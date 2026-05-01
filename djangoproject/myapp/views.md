# =============================================================
# 🧠 THIS FILE = YOUR BACKEND BRAIN (views.py)
# =============================================================
# This file acts as the "traffic controller" between:
# 👉 Frontend (React / Flutter)
# 👉 AI Models (YOLO, ML, RAG)
# 👉 Database (Django ORM)
#
# Flow:
# 1. Receive request (image/text)
# 2. Run AI models
# 3. Process results
# 4. Store in DB
# 5. Send response back
#
# Upload flow in djangoproject:
# - Frontend posts files to /detect/ (myapp/urls.py -> detect_marine_waste)
# - myapp/views.py handles the request and loops through uploaded images
# - Each image is analyzed by YOLO via myapp/views.py using `best.pt`
# - Hazard analytics and risk scoring happen in myapp/views.py
# - RAG report generation uses myapp/Newbrain.py and the local vector DB folder
# - Results are saved into the SQLite backend via myapp/models.py (MarineWasteDetection)
# - Response JSON is returned to the frontend with annotated images, graphs, and metrics
#
# Files activated during upload flow:
# - djangoproject/myapp/urls.py
# - djangoproject/myapp/views.py
# - djangoproject/myapp/models.py
# - djangoproject/myapp/serializers.py
# - djangoproject/myapp/Newbrain.py
# - djangoproject/marine_brain_new/ (vector database folder)
# - djangoproject/risk_model.pkl
# - djangoproject/best.pt
# - djangoproject/best_weathering.pt
# - djangoproject/age_classifier_v2.h5
# - djangoproject/db.sqlite3
# =============================================================

import uuid  # used to generate unique batch IDs
from django.shortcuts import render
import os
from django.conf import settings
import cv2  # OpenCV for image processing
from rest_framework.response import Response   
import pandas as pd

# Django HTTP + API tools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Serializer converts DB objects → JSON
from myapp.serializers import MarineWasteDetectionSerializer

# AI models
from ultralytics import YOLO
from tensorflow.keras.models import load_model

# Image handling
import io
import base64
from PIL import Image
import numpy as np

# Database model
from .models import MarineWasteDetection

# DB aggregation tools
from django.db.models import Count  
from django.db.models import Max

# Time handling
from datetime import datetime
from django.utils import timezone

# Visualization
import matplotlib.pyplot as plt
import matplotlib

# Auth system
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, parser_classes, permission_classes

# File upload parsers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

# ML model loading
import joblib

# RAG system (vector database)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma 
from .Newbrain import generate_scientific_report

# =============================================================
# 📏 CONSTANT: pixel → mm conversion (approximation)
# =============================================================
PIXEL_TO_MM = 0.01

# =============================================================
# 📊 FEATURE EXTRACTION FOR ML RISK MODEL
# =============================================================
def extract_risk_features(found_items):
    # Total detected items
    total = len(found_items)
    if total == 0: 
        return None

    # Count each type
    counts = {"fiber": 0, "pellet": 0, "fragment": 0, "film": 0}
    areas = [item["area"] for item in found_items]

    # Loop through detected items
    for item in found_items:
        label = item["type"].lower() 
        if label in counts:
            counts[label] += 1

    # Return features used by ML model
    return {
        "total": total,
        "fiber_ratio": counts["fiber"] / total,
        "pellet_ratio": counts["pellet"] / total,
        "fragment_ratio": counts["fragment"] / total,
        "film_ratio": counts["film"] / total,
        "avg_area": sum(areas) / total,
        "min_area": min(areas)
    }

# =============================================================
# 📐 Convert pixel area → approximate mm size
# =============================================================
def pixel_area_to_mm(area_pixels):
    return (area_pixels ** 0.5) * PIXEL_TO_MM

# =============================================================
# 🤖 LOAD MODELS (DONE ONCE FOR PERFORMANCE)
# =============================================================
BASE_DIR_PATH = str(settings.BASE_DIR)

# YOLO model (weathering classification)
model1 = YOLO('best_weathering.pt') 

# Age classification model
age_model_path = os.path.join(BASE_DIR_PATH, "age_classifier_v2.h5")
age_model = load_model(age_model_path)

# Fix for TensorFlow compatibility
os.environ["TF_USE_LEGACY_KERAS"] = "1"

# =============================================================
# 🧠 VECTOR DATABASE SETUP (RAG)
# =============================================================
current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "marine_brain_new") 

print(f"📂 DJANGO IS LOOKING FOR DATABASE AT: {DB_PATH}")
if not os.path.exists(DB_PATH):
    print("🚨 ERROR: VECTOR DB NOT FOUND")

# Load embedding model
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Create persistent vector DB
import chromadb
persistent_client = chromadb.PersistentClient(path=DB_PATH)

vector_db = Chroma(
    client=persistent_client,
    collection_name="langchain",
    embedding_function=embeddings,
)

# Debug check
try:
    doc_count = vector_db._collection.count()
    print(f"✅ Found {doc_count} research chunks!")
except Exception as e:
    print(f"❌ VECTOR DB ERROR: {e}")

# =============================================================
# 🤖 LOAD RISK MODEL (ML)
# =============================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
risk_model_path = os.path.join(BASE_DIR, "risk_model.pkl")
risk_model = joblib.load(risk_model_path)

# =============================================================
# 🎯 MAIN DETECTION MODEL
# =============================================================
matplotlib.use('Agg')  # prevent GUI errors
model = YOLO('best.pt')

# =============================================================
# 🚀 MAIN API: DETECT MARINE WASTE
# =============================================================
@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def detect_marine_waste(request):
    # Get uploaded files
    files = request.FILES.getlist('files')

    if not files:
        return Response({"error": "No files uploaded"}, status=400)

    # Metadata
    location = request.data.get('location', 'Unknown')
    beach_name = request.data.get('beach_name', 'General')
    timestamp_str = request.data.get('timestamp')

    analysis_time = timezone.now()

    # Parse timestamp
    if timestamp_str:
        try:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            analysis_time = timezone.make_aware(dt)
        except:
            pass

    all_image_results = []
    batch_id = uuid.uuid4()

    # Feature names expected by ML model
    FEATURE_NAMES = ["total_count", "fiber_ratio", "pellet_ratio", "fragment_ratio", "film_ratio", "avg_area", "min_area"]

    # =========================================================
    # 🔁 LOOP THROUGH EACH IMAGE
    # =========================================================
    for file in files:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")

        # ==============================
        # 1️⃣ YOLO DETECTION
        # ==============================
        results = model.predict(source=np.array(image))
        found_items = []
        annotated_base64 = ""

        for r in results:
            # Draw bounding boxes
            res_image = Image.fromarray(r.plot().astype(np.uint8))
            buffer = io.BytesIO()
            res_image.save(buffer, format="JPEG")
            annotated_base64 = base64.b64encode(buffer.getvalue()).decode()

            # Extract detected objects
            items_to_process = []

            if r.boxes:
                for box in r.boxes:
                    coords = box.xyxy[0].cpu().tolist()
                    area = (coords[2] - coords[0]) * (coords[3] - coords[1])
                    label = model.names[int(box.cls[0])]
                    items_to_process.append((label, area))

            # Convert into structured format
            for label, area in items_to_process:
                if area > 0:
                    size_mm = (area ** 0.5) * 0.01
                    found_items.append({
                        "type": label.lower(),
                        "area": round(area, 2),
                        "size_mm": round(size_mm, 4),
                        "category": "Microplastic",
                        "priority": "HIGH" if area > 500 else "MEDIUM",
                    })

        # ==============================
        # 2️⃣ HAZARD CALCULATION
        # ==============================
        hazard_metrics = calculate_physical_hazard(found_items)

        # ==============================
        # 3️⃣ RAG REPORT GENERATION
        # ==============================
        try:
            scientific_report_text = generate_scientific_report(hazard_metrics)
        except Exception as e:
            scientific_report_text = f"Error: {str(e)}"

        # ==============================
        # 4️⃣ ML RISK PREDICTION
        # ==============================
        risk_features = extract_risk_features(found_items)
        risk_score = 0
        risk_level = "LOW"

        if risk_features:
            if "total" in risk_features:
                risk_features["total_count"] = risk_features.pop("total")

            df = pd.DataFrame([risk_features], columns=FEATURE_NAMES)
            risk_score = float(risk_model.predict(df)[0])

            if risk_score < 35:
                risk_level = "LOW"
            elif risk_score < 70:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"

        # ==============================
        # 5️⃣ GRAPH GENERATION
        # ==============================
        graph_base64 = ""
        if found_items:
            summary = {}
            for item in found_items:
                summary[item['type']] = summary.get(item['type'], 0) + 1

            plt.figure()
            plt.bar(summary.keys(), summary.values())
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            plt.close()
            graph_base64 = base64.b64encode(buf.getvalue()).decode()

        # ==============================
        # 6️⃣ SAVE TO DATABASE
        # ==============================
        db_entry = MarineWasteDetection.objects.create(
            batch_id=batch_id,
            filename=file.name,
            total_detections=len(found_items),
            annotated_image_base64=f"data:image/jpeg;base64,{annotated_base64}",
            graph_image_base64=f"data:image/png;base64,{graph_base64}",
            detection_details=found_items,
            ecological_risk_score=risk_score,
            ecological_risk_level=risk_level,
            hazard_analytics=hazard_metrics,
            sampling_location=location,
            beach_name=beach_name,
        )

        # ==============================
        # 7️⃣ RESPONSE BUILDING
        # ==============================
        all_image_results.append({
            "db_id": db_entry.id,
            "filename": file.name,
            "total_detections": len(found_items),
            "risk_level": risk_level,
        })

    # Final response
    return Response({
        "batch_id": str(batch_id),
        "results": all_image_results
    })

# =============================================================
# 📊 HAZARD CALCULATION FUNCTION (CORE LOGIC)
# =============================================================
def calculate_physical_hazard(found_items):
    # If no items → return default
    if not found_items:
        return {"Hs": 0}

    # Shape risk scores
    shape_ranks = {
        "fiber": 0.90,
        "film": 0.80,
        "fragment": 0.60,
        "pellet": 0.10,
    }

    total_hs = 0

    for item in found_items:
        shape = item.get("type", "fragment")
        size_mm = item.get("size_mm", 0)

        # Size scoring
        if size_mm < 0.01:
            size_rank = 0.7
        elif size_mm < 0.1:
            size_rank = 0.4
        elif size_mm < 1:
            size_rank = 0.3
        else:
            size_rank = 0.1

        shape_rank = shape_ranks.get(shape, 0.6)

        hp = size_rank + shape_rank
        total_hs += hp

    return {"Hs": round(total_hs, 2)}
