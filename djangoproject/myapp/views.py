
import uuid
from django.shortcuts import render
import os
from django.conf import settings
import cv2
from rest_framework.response import Response   
import pandas as pd

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.serializers import MarineWasteDetectionSerializer
from ultralytics import YOLO
from tensorflow.keras.models import load_model
import io
import base64
from PIL import Image
import numpy as np
from .models import MarineWasteDetection
from django.db.models import Count  
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
import io
import base64
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from PIL import Image
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, parser_classes, permission_classes

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import joblib
import os
import os
from django.conf import settings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma 
from .Newbrain import generate_scientific_report
PIXEL_TO_MM = 0.01  # 1 pixel ≈ 0.01 mm (project-safe assumption)
def extract_risk_features(found_items):
    total = len(found_items)
    if total == 0: 
        return None

    # Use lowercase keys to match your detection loop (label.lower())
    counts = {"fiber": 0, "pellet": 0, "fragment": 0, "film": 0}
    areas = [item["area"] for item in found_items]

    for item in found_items:
        label = item["type"].lower() 
        if label in counts:
            counts[label] += 1

    return {
        "total": total,
        "fiber_ratio": counts["fiber"] / total,
        "pellet_ratio": counts["pellet"] / total,
        "fragment_ratio": counts["fragment"] / total,
        "film_ratio": counts["film"] / total,
        "avg_area": sum(areas) / total,
        "min_area": min(areas)
    }
def pixel_area_to_mm(area_pixels):
    # Convert pixel area → approximate size in mm
    return (area_pixels ** 0.5) * PIXEL_TO_MM

# Load model once outside the function for speed
BASE_DIR_PATH = str(settings.BASE_DIR)
model1 = YOLO('best_weathering.pt') 

age_model_path = os.path.join(BASE_DIR_PATH, "age_classifier_v2.h5")
age_model = load_model(age_model_path)



os.environ["TF_USE_LEGACY_KERAS"] = "1"

current_dir = os.path.dirname(os.path.abspath(__file__))


DB_PATH = os.path.join(current_dir, "marine_brain_new") 


print(f"📂 DJANGO IS LOOKING FOR DATABASE AT: {DB_PATH}")
if not os.path.exists(DB_PATH):
    print("🚨 ERROR: FOLDER NOT FOUND! Ensure you unzipped marine_brain_new.zip here.")


current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "marine_brain_new")


embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


import chromadb
from langchain_chroma import Chroma

persistent_client = chromadb.PersistentClient(path=DB_PATH)

vector_db = Chroma(
    client=persistent_client,
    collection_name="langchain",
    embedding_function=embeddings,
)


try:
    doc_count = vector_db._collection.count()
    if doc_count == 0:
        print("🚨 STILL 0: Try deleting the 'marine_brain_new' folder and re-unzipping it.")
    else:
        print(f"✅ SUCCESS: Found {doc_count} research chunks!")
except Exception as e:
    print(f"❌ CONNECTION ERROR: {e}")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
risk_model_path = os.path.join(BASE_DIR, "risk_model.pkl")
risk_model = joblib.load(risk_model_path)


from ultralytics import YOLO

matplotlib.use('Agg')


model = YOLO('best.pt')


import uuid
import io
import base64
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
from datetime import datetime
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status

@csrf_exempt # <--- Add thi
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def detect_marine_waste(request):
    files = request.FILES.getlist('files')
    if not files:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    location = request.data.get('location', 'Unknown')
    timestamp_str = request.data.get('timestamp')
    #new one
    location = request.data.get('location', 'Unknown') # City (e.g., Kochi)
    beach_name = request.data.get('beach_name', 'General') # Specific spot (e.g., Vembanad)
    analysis_time = timezone.now()

    # Parse timestamp if provided
    if timestamp_str:
        try:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            analysis_time = timezone.make_aware(dt, timezone.get_current_timezone())
        except (ValueError, TypeError):
            analysis_time = timezone.now()

    all_image_results = []
    batch_id = uuid.uuid4() 
    
    # FIX: Updated feature names to match your model's expected 'total_count'
    FEATURE_NAMES = ["total_count", "fiber_ratio", "pellet_ratio", "fragment_ratio", "film_ratio", "avg_area", "min_area"]

    for file in files:
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # 1. Detection Phase (YOLO)
        results = model.predict(source=np.array(image))
        found_items = []
        annotated_base64 = ""

        for r in results:
            # Annotated Image Generation
            res_plotted = r.plot()
            res_image = Image.fromarray(res_plotted.astype(np.uint8))
            buffered = io.BytesIO()
            res_image.save(buffered, format="JPEG")
            annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

            items_to_process = []
            if r.boxes:
                for box in r.boxes:
                    coords = box.xyxy[0].cpu().tolist()
                    area = (coords[2] - coords[0]) * (coords[3] - coords[1])
                    label = model.names[int(box.cls[0])]
                    items_to_process.append((label, area))
            elif r.masks:
                for i, mask in enumerate(r.masks.data):
                    area = float(mask.sum().item())
                    label = model.names[int(r.boxes.cls[i])]
                    items_to_process.append((label, area))

            for label, area in items_to_process:
                if area > 0:
                    size_mm = (area ** 0.5) * 0.01 
                    found_items.append({
                        "type": label.lower(), # Standardized for analytics
                        "area": round(area, 2),
                        "size_mm": round(size_mm, 4),
                        "category": "Microplastic", 
                        "priority": "HIGH" if area > 500 else "MEDIUM",
                        "trophic": "High risk of ingestion by marine biota.",
                        "chem": "Potential for chemical leaching and adsorption."
                    })
        
        # 2. Hazard Analytics Phase
        hazard_metrics = calculate_physical_hazard(found_items)
        
        # 3. Scientific Reporting Phase (RAG)
        # FIX: Ensure Newbrain.py uses 'gemini-1.5-flash' instead of 'gemini-1.5-flash-latest'
        try:
            from .Newbrain import generate_scientific_report
            scientific_report_text = generate_scientific_report(hazard_metrics)
        except Exception as e:
            scientific_report_text = f"Report error: {str(e)}"

        # 4. Risk Model Prediction (ML)
        risk_features = extract_risk_features(found_items)
        risk_score = 0.0
        risk_level = "LOW"
        if risk_features:
            try:
                # FIX: Map 'total' to 'total_count' if that's what your model expects
                if "total" in risk_features:
                    risk_features["total_count"] = risk_features.pop("total")

                df_features = pd.DataFrame([risk_features], columns=FEATURE_NAMES)
                prediction = risk_model.predict(df_features)[0]
                risk_score = float(prediction)
                
                if risk_score < 35: risk_level = "LOW"
                elif risk_score < 70: risk_level = "MEDIUM"
                else: risk_level = "HIGH"
            except Exception as e:
                print(f"Risk model error: {e}")

        # 5. Visualization (Graph)
        graph_base64 = ""
        if found_items:
            summary = {}
            for item in found_items:
                t = item['type']
                summary[t] = summary.get(t, 0) + 1 
            
            plt.figure(figsize=(5, 3))
            plt.bar(list(summary.keys()), list(summary.values()), color='#3498db')
            plt.title('Detection Distribution')
            graph_buffer = io.BytesIO()
            plt.savefig(graph_buffer, format='png', bbox_inches='tight')
            plt.close()
            graph_base64 = base64.b64encode(graph_buffer.getvalue()).decode('utf-8')

        # 6. Database Persistence
        db_entry = MarineWasteDetection.objects.create(
            user=request.user if request.user.is_authenticated else None,
            batch_id=batch_id,
            filename=file.name,
            total_detections=len(found_items),
            annotated_image_base64=f"data:image/jpeg;base64,{annotated_base64}",
            graph_image_base64=f"data:image/png;base64,{graph_base64}" if graph_base64 else None,
            detection_details=found_items, # JSONField in model
            
            analysis_timestamp=analysis_time,
            ecological_risk_score=risk_score,
            ecological_risk_level=risk_level,
            hazard_analytics=hazard_metrics, 
            aggregated_hazard_score=hazard_metrics.get("Hs", 0),
            scientific_report=scientific_report_text ,
            sampling_location=location,
            beach_name=beach_name,
        )

        # 7. Add to Batch Results
        all_image_results.append({
            "db_id": db_entry.id,
            "filename": file.name,
            "total_detections": len(found_items),
            "detection_details": found_items,  # FIX: NOW INCLUDED FOR REACT
            "hazard_metrics": hazard_metrics,
            "scientific_report": scientific_report_text,
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "annotated_image": f"data:image/jpeg;base64,{annotated_base64}",
            "graph_image": f"data:image/png;base64,{graph_base64}" if graph_base64 else None
        })

    return Response({
        "batch_id": str(batch_id),
        "total_images": len(all_image_results),
        "overall_status": "Protocol Analyzed",
        "results": all_image_results
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Fields required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)
    
    # create_user hashes the password automatically for security
    User.objects.create_user(username=username, password=password)
    return Response({"message": "Success! You can now Login."}, status=201)



def generate_marineinsight_report_prompt(hazard_metrics, vector_db):
    # 1. Retrieval: Search specifically for morphology and size impacts
    query = f"Physical toxicity and ingestion risk of {hazard_metrics['dominant_shape']} {hazard_metrics['dominant_size_bin']}"
    docs = vector_db.similarity_search(query, k=4)
    context = "\n\n".join([d.page_content for d in docs])

    # 2. The Strict Protocol Prompt (Section 8 of PDF)
    prompt = f"""
    You are "MarineInsight," an evidence-first AI ecotoxicologist.
    
    REPORT PROTOCOL RULES:
    - Use ONLY provided RESEARCH CONTEXT. 
    - Cite using bracketed numbers [1].
    - Minimum length: 1,200 words.
    - If no evidence: "No supporting evidence found in provided documents."

    SAMPLE_METRICS:
    - n: {hazard_metrics['n']}
    - Hs (Aggregated Hazard Score): {hazard_metrics['Hs']}
    - Dominant Morphology: {hazard_metrics['dominant_shape']}
    - Dominant Size Bin: {hazard_metrics['dominant_size_bin']}
    - Critical Size Flag: {hazard_metrics['critical_size_flag']}
    - Shape Contribution: {hazard_metrics['shape_contribution_percent']}%
    - Size Contribution: {hazard_metrics['size_contribution_percent']}%

    RESEARCH CONTEXT:
    {context}

    OUTPUT STRUCTURE (Strict Sections I-VII):
    I. Executive Summary: Primary hazard driver and Hs interpretation.
    II. Morphological Toxicity: Analysis of {hazard_metrics['dominant_shape']} impacts.
    III. Size-Class Implications: Impact of {hazard_metrics['dominant_size_bin']} range.
    IV. Trophic Implications: Ingestion and retention mechanisms.
    V. Human Health: Exposure and systemic penetration.
    VI. Data Quality & Scientific Disclosure: 
        MANDATORY DISCLOSURE: "This hazard model evaluates physical dimensions only (size and morphology) and does not incorporate polymer chemistry or environmental contaminant load."
    VII. References: Numbered list.
    """
    return prompt

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])

def custom_login(request):
    
    login_id = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')

    if not login_id or not password:
        return Response({"error": "Please provide both credentials"}, status=400)

    
    user = authenticate(username=login_id, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "Login Successful"
        }, status=200)
    
    return Response({"error": "Invalid credentials"}, status=401)


from django.db.models import F, Sum
import json


@api_view(['GET'])

@permission_classes([AllowAny])
def get_dashboard_data(request):#changed
    # Get all unique batch IDs in the system
    batch_ids = MarineWasteDetection.objects.values_list('batch_id', flat=True).distinct()
    
    dashboard = []

    for b_id in batch_ids:
        # Get all images in this specific batch
        detections = MarineWasteDetection.objects.filter(batch_id=b_id)
        if not detections.exists():
            continue

        # Total counts for this specific batch
        total_summary = {"Fiber": 0, "Pellet": 0, "Fragment": 0, "Film": 0}
        
        detection_list = []
        for d in detections:
            
            details = d.detection_details or []
            for item in details:
                t = item.get("type")
                if t in total_summary:
                    total_summary[t] += 1

            detection_list.append({
                "id": d.id,
                "filename": d.filename,
                "annotated_image": d.annotated_image_base64,
                "sampling_location": d.sampling_location,
                "analysis_timestamp": d.analysis_timestamp.isoformat() if d.analysis_timestamp else None,
            })

        
        latest_entry = detections.latest("created_at")

        dashboard.append({
            "batch_id": str(b_id),
            "user": latest_entry.user.username,
            "image_count": detections.count(),
            "last_created": latest_entry.created_at,
            "summary": total_summary,
            "detections": detection_list
        })

    
    dashboard.sort(key=lambda x: x['last_created'], reverse=True)
    
    return Response(dashboard)


@api_view(['GET'])
def get_single_detection(request,detection_id):#changed
    try:
        detection=MarineWasteDetection.objects.get(id=detection_id)
        serializer = MarineWasteDetectionSerializer(detection)
        return Response(serializer.data)
    except MarineWasteDetection.DoesNotExist:
        return Response({"error": "Detection not found"}, status=404)
    

@api_view(['GET'])
def get_batch_results(request, batch_id):
    detections = MarineWasteDetection.objects.filter(batch_id=batch_id)

    results = []
    for d in detections:
        results.append({
            "db_id": d.id,
            "filename": d.filename,
            "total_detections": d.total_detections,
            "detection_details": d.detection_details,
            "hazard_metrics": d.hazard_analytics,
            "scientific_report": d.scientific_report,
            "risk_level": d.ecological_risk_level,
            "annotated_image": d.annotated_image_base64,  
            "graph_image": d.graph_image_base64
        })

    return Response({
        "batch_id": str(batch_id),
        "count": len(results),
        "results": results
    })



from django.shortcuts import render
from .brain import get_marine_data

def calculate_physical_hazard(found_items):
    """
    Calculates the Aggregated Hazard Score (Hs) and individual 
    Particle Hazard (Hp) based on the MarineInsight Protocol.
    """
    if not found_items:
        return {
            "Hs": 0,
            "aggregated_hazard_score": 0,
            "dominant_shape": "None",
            "dominant_size_bin": "None",
            "critical_size_flag": False,
            "shape_contribution_percent": 0.0,
            "size_contribution_percent": 0.0,
            "n": 0
        }

    # 🔬 PROTOCOL SIZE RANKING (MM-BASED)
    # Using continuous logic (<) to ensure no particle (e.g., 0.0095mm) is skipped
    def get_size_rank(size_mm):
        if size_mm < 0.001:
            return None, "Excluded"
        if size_mm < 0.01:      # 0.001 to 0.0099...
            return 0.70, "Smallest microplastic"
        elif size_mm < 0.1:     # 0.01 to 0.099...
            return 0.40, "Small microplastic"
        elif size_mm < 1.0:     # 0.1 to 0.999...
            return 0.30, "Intermediate microplastic"
        else:                   # 1.0 mm and above
            return 0.10, "Large microplastic"

    # 🧬 PROTOCOL SHAPE RANKING - Page 3 of Protocol
    shape_ranks = {
        "fiber": 0.90,
        "film": 0.80,
        "fragment": 0.60,
        "pellet": 0.10,
        "sphere": 0.10
    }

    total_hs = 0
    size_sum = 0
    shape_sum = 0
    shape_counts = {}
    size_bin_counts = {}
    critical_size_flag = False
    valid_n = 0

    for item in found_items:
        # Normalize shape name to lowercase for dictionary matching
        shape = str(item.get("type", "")).lower()
        size_mm = item.get("size_mm", 0)

        # 1. Size Rank & Critical Flag
        s_rank, s_bin = get_size_rank(size_mm)
        if s_rank is None: 
            continue 
        
        if s_bin == "Smallest microplastic": 
            critical_size_flag = True

        # 2. Shape Rank (Defaults to fragment score if model label is unknown)
        sh_rank = shape_ranks.get(shape, 0.60) 

        # 3. Particle Hazard Calculation (Hp = Size + Shape)
        # We store this in the item dict so it persists in the database details
        hp_score = s_rank + sh_rank
        item["hp_score"] = round(hp_score, 2)
        item["size_rank"] = s_rank
        item["shape_rank"] = sh_rank
        
        total_hs += hp_score
        size_sum += s_rank
        shape_sum += sh_rank
        valid_n += 1

        # Track distributions for dominance logic
        shape_counts[shape] = shape_counts.get(shape, 0) + 1
        size_bin_counts[s_bin] = size_bin_counts.get(s_bin, 0) + 1

    # 4. Statistical Analysis
    dom_shape = max(shape_counts, key=shape_counts.get) if shape_counts else "None"
    dom_size = max(size_bin_counts, key=size_bin_counts.get) if size_bin_counts else "None"

    # 5. Percentage Contribution - Requirement Section 5
    total_comp = size_sum + shape_sum
    shape_cont = (shape_sum / total_comp * 100) if total_comp > 0 else 0
    size_cont = (size_sum / total_comp * 100) if total_comp > 0 else 0

    return {
        "Hs": round(total_hs, 2), 
        "aggregated_hazard_score": round(total_hs, 2),
        "dominant_shape": dom_shape.capitalize(),
        "dominant_size_bin": dom_size,
        "critical_size_flag": critical_size_flag,
        "shape_contribution_percent": round(shape_cont, 2),
        "size_contribution_percent": round(size_cont, 2),
        "n": valid_n 
    }

def search_insight(request):
    """
    Renders research data from the local vector database.
    """
    query = request.GET.get('q') 
    results = []
    
    if query:
        # get_marine_data handles the ChromaDB similarity search
        results = get_marine_data(query)
        
    return render(request, 'insight_results.html', {'results': results, 'query': query})
@api_view(['GET'])
@permission_classes([AllowAny])
def get_locations_by_city(request):
    city = request.GET.get('city')
    # Fetch unique beaches/lakes associated with this city
    spots = MarineWasteDetection.objects.filter(
        sampling_location__iexact=city
    ).values_list('beach_name', flat=True).distinct()
    
    return Response({
        "city": city,
        "spots": list(spots)
    })
@api_view(['GET'])
def get_spot_insight(request):
    spot = request.GET.get('spot') # e.g., "Vembanad"
    records = MarineWasteDetection.objects.filter(beach_name=spot).order_by('analysis_timestamp')

    if not records.exists():
        return Response({"error": "No data for this location"}, status=404)

    # 1. COUNT TREND (Is pollution increasing?)
    counts = [r.total_detections for r in records]
    pollution_trend = "Stable"
    if len(counts) > 1:
        pollution_trend = "Increasing" if counts[-1] > counts[0] else "Decreasing"

    # 2. SHAPE TREND (Source Tracking)
    latest_hazard = records.last().hazard_analytics
    dom_shape = latest_hazard.get("dominant_shape", "Unknown")
    source_map = {
        "Fiber": "Textile waste (laundry/fishing nets)",
        "Film": "Packaging/Plastic bags",
        "Fragment": "Broken larger plastic debris",
        "Pellet": "Industrial raw material spills"
    }
    source_insight = source_map.get(dom_shape, f"{dom_shape} dominant source")

    # 3. SIZE TREND (Risk Analysis)
    is_critical = latest_hazard.get("critical_size_flag", False)
    risk_msg = "Ecological risk is rising due to particle fragmentation." if is_critical else "Risk level is consistent."

    return Response({
        "spot": spot,
        "summary": {
            "pollution": f"Pollution is {pollution_trend}",
            "source": source_insight,
            "risk": risk_msg,
            "full_insight": f"In {spot}, pollution is {pollution_trend.lower()}. The dominant source is {source_insight}. {risk_msg}"
        },
        "chart_data": list(records.values('analysis_timestamp', 'total_detections', 'aggregated_hazard_score'))
    })