# The traffic cop. When a user clicks a button or uploads an image on the frontend, a function in views.py runs, calls your AI models, and returns the result.
# Takes input (image, text, etc.)
# Runs AI models (YOLO, ML, RAG)
# Processes results
# Saves to database
# Sends response back

# ==========================================
# 1. IMPORTS SECTION
# ==========================================
import uuid # Used to generate unique IDs for batches of uploaded images
from django.shortcuts import render # Standard Django function to render HTML templates (used in search_insight)
import os # For interacting with the operating system (building file paths)
from django.conf import settings # To access Django project settings (like BASE_DIR)
import cv2 # OpenCV for computer vision/image processing (imported but not heavily used below)
from rest_framework.response import Response   # Django REST Framework's way of sending JSON back to the frontend
import pandas as pd # For data manipulation, specifically preparing data for the Scikit-Learn ML model

# Create your views here.
from django.http import JsonResponse # Standard Django JSON response
from django.views.decorators.csrf import csrf_exempt # Bypasses CSRF token checks (useful for external API requests)
from myapp.serializers import MarineWasteDetectionSerializer # Converts complex Django database models into JSON
from ultralytics import YOLO # The library for your Object Detection/Segmentation model
from tensorflow.keras.models import load_model # For loading your age classifier neural network
import io # Core Python module for working with streams (like reading image bytes in memory)
import base64 # To convert images into long text strings so they can be sent via JSON/saved to DB
from PIL import Image # Python Imaging Library, used to open and manipulate the uploaded images
import numpy as np # For fast numerical operations and matrix math (crucial for images)
from .models import MarineWasteDetection # Your custom Django database table for saving results
from django.db.models import Count  # Django ORM tool to count rows
from django.db.models import Max # Django ORM tool to find the maximum value
from datetime import datetime # For handling dates and times
from django.utils import timezone # Django's timezone-aware date/time handling
import matplotlib.pyplot as plt # For generating the bar charts dynamically
import matplotlib # The core plotting library
from django.contrib.auth.models import User # Django's built-in user authentication model
from rest_framework.permissions import IsAuthenticated, AllowAny # Defines who can access the API endpoints
from rest_framework.decorators import api_view, parser_classes, permission_classes # Decorators to configure API views
from rest_framework.parsers import MultiPartParser, FormParser # Allows the API to accept file uploads (form-data)
from rest_framework import status # HTTP status codes (200 OK, 400 Bad Request, etc.)
import joblib # Used to load the classical Machine Learning model (risk_model.pkl)

from langchain_huggingface import HuggingFaceEmbeddings # Used to convert text into numbers (vectors) for RAG
from langchain_chroma import Chroma # The vector database used for the RAG pipeline
from .Newbrain import generate_scientific_report # Your custom RAG generation function

# ==========================================
# 2. GLOBAL CONSTANTS & HELPER FUNCTIONS
# ==========================================
PIXEL_TO_MM = 0.01  # 1 pixel ≈ 0.01 mm (project-safe assumption for microscopic scale)

def extract_risk_features(found_items):
    """
    This function takes the raw YOLO detections and formats them 
    into a structured dictionary so the Scikit-Learn risk model can process them.
    """
    total = len(found_items)
    if total == 0: 
        return None

    # Use lowercase keys to match your detection loop (label.lower())
    counts = {"fiber": 0, "pellet": 0, "fragment": 0, "film": 0}
    areas = [item["area"] for item in found_items] # Extract just the areas

    # Count how many of each shape we found
    for item in found_items:
        label = item["type"].lower() 
        if label in counts:
            counts[label] += 1

    # Return the ratios and area stats needed by the ML model
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
    # Convert pixel area → approximate size in mm (square root of area * scaling factor)
    return (area_pixels ** 0.5) * PIXEL_TO_MM


# ==========================================
# 3. GLOBAL MODEL LOADING
# ==========================================
# VERY IMPORTANT: We load these models OUTSIDE the API functions.
# If they were inside, Django would reload gigabytes of AI models on every single click, crashing the server.

BASE_DIR_PATH = str(settings.BASE_DIR)

# Load Unet2+ model
model1 = YOLO('best_weathering.pt') 

# Load Keras Neural Network
age_model_path = os.path.join(BASE_DIR_PATH, "age_classifier_v2.h5")
age_model = load_model(age_model_path)

os.environ["TF_USE_LEGACY_KERAS"] = "1" # Compatibility flag for older Keras models

# ==========================================
# 4. RAG / VECTOR DATABASE SETUP (ChromaDB)
# ==========================================
current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "marine_brain_new") 

print(f"📂 DJANGO IS LOOKING FOR DATABASE AT: {DB_PATH}")
if not os.path.exists(DB_PATH):
    print("🚨 ERROR: FOLDER NOT FOUND! Ensure you unzipped marine_brain_new.zip here.")

# Setup the embedding model (converts text queries into vectors)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

import chromadb
from langchain_chroma import Chroma

# Connect to the local vector database containing your scientific literature
persistent_client = chromadb.PersistentClient(path=DB_PATH)

vector_db = Chroma(
    client=persistent_client,
    collection_name="langchain",
    embedding_function=embeddings,
)

# Debugging: Check if the vector DB loaded the research papers correctly
try:
    doc_count = vector_db._collection.count()
    if doc_count == 0:
        print("🚨 STILL 0: Try deleting the 'marine_brain_new' folder and re-unzipping it.")
    else:
        print(f"✅ SUCCESS: Found {doc_count} research chunks!")
except Exception as e:
    print(f"❌ CONNECTION ERROR: {e}")


# ==========================================
# 5. MORE MODEL LOADING
# ==========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load the Scikit-Learn risk predictor model
risk_model_path = os.path.join(BASE_DIR, "risk_model.pkl")
risk_model = joblib.load(risk_model_path)

from ultralytics import YOLO

# Set matplotlib backend to 'Agg' so it doesn't try to open a GUI window on the server
matplotlib.use('Agg')

# Load the primary YOLO model for segmentation/detection
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

# ==========================================
# 6. MAIN DETECTION API ENDPOINT
# ==========================================
@csrf_exempt # <--- Add thi (Disables CSRF protection for this endpoint so React can easily POST to it)
@api_view(['POST']) # Only allows HTTP POST requests
@parser_classes([MultiPartParser, FormParser]) # Tells Django to expect file uploads
@permission_classes([AllowAny]) # Anyone can hit this endpoint (no login required for now)
def detect_marine_waste(request):
    """
    The main traffic cop for analysis. 
    Receives images -> Runs YOLO -> Calculates Hazards -> Runs ML -> Generates Graph -> Saves to DB.
    """
    # Grab the uploaded files from the request
    files = request.FILES.getlist('files')
    if not files:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    # Grab metadata sent from the frontend
    location = request.data.get('location', 'Unknown')
    timestamp_str = request.data.get('timestamp')
    #new one
    location = request.data.get('location', 'Unknown') # City (e.g., Kochi)
    beach_name = request.data.get('beach_name', 'General') # Specific spot (e.g., Vembanad)
    analysis_time = timezone.now()

    # Parse timestamp if provided
    if timestamp_str:
        try:
            # Clean up the ISO string and make it timezone aware
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            analysis_time = timezone.make_aware(dt, timezone.get_current_timezone())
        except (ValueError, TypeError):
            analysis_time = timezone.now()

    all_image_results = []
    batch_id = uuid.uuid4() # Generate one unique ID for this entire upload batch
    
    # FIX: Updated feature names to match your model's expected 'total_count'
    FEATURE_NAMES = ["total_count", "fiber_ratio", "pellet_ratio", "fragment_ratio", "film_ratio", "avg_area", "min_area"]

    # Loop through every image the user uploaded
    for file in files:
        # Read the image file into memory and convert it to RGB
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # ---------------------------------------
        # Phase 1: Detection (YOLO)
        # ---------------------------------------
        # Convert the PIL image to a numpy array (which YOLO expects) and run prediction
        results = model.predict(source=np.array(image))
        found_items = []
        annotated_base64 = ""

        for r in results:
            # Annotated Image Generation: Let YOLO draw the bounding boxes/masks
            res_plotted = r.plot()
            res_image = Image.fromarray(res_plotted.astype(np.uint8))
            
            # Save the drawn image to a memory buffer, then encode to base64 string
            buffered = io.BytesIO()
            res_image.save(buffered, format="JPEG")
            annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

            items_to_process = []
            
            # Extract data from YOLO results. 
            # Check if it returned bounding boxes (r.boxes) or segmentation masks (r.masks)
            if r.boxes:
                for box in r.boxes:
                    coords = box.xyxy[0].cpu().tolist() # Get [x1, y1, x2, y2]
                    area = (coords[2] - coords[0]) * (coords[3] - coords[1]) # Calculate Box Area
                    label = model.names[int(box.cls[0])] # Get the class name (fiber, pellet, etc.)
                    items_to_process.append((label, area))
            elif r.masks:
                for i, mask in enumerate(r.masks.data):
                    area = float(mask.sum().item()) # Calculate pixel area of the mask
                    label = model.names[int(r.boxes.cls[i])]
                    items_to_process.append((label, area))

            # Process the extracted items and calculate their physical dimensions
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
        
        # ---------------------------------------
        # Phase 2: Hazard Analytics Phase
        # ---------------------------------------
        # Call the custom algorithm defined lower in this file
        hazard_metrics = calculate_physical_hazard(found_items)
        
        # ---------------------------------------
        # Phase 3: Scientific Reporting Phase (RAG)
        # ---------------------------------------
        # FIX: Ensure Newbrain.py uses 'gemini-1.5-flash' instead of 'gemini-1.5-flash-latest'
        try:
            from .Newbrain import generate_scientific_report
            # Pass the hazard scores to the LLM to generate the report
            scientific_report_text = generate_scientific_report(hazard_metrics)
        except Exception as e:
            scientific_report_text = f"Report error: {str(e)}"

        # ---------------------------------------
        # Phase 4: Risk Model Prediction (ML)
        # ---------------------------------------
        risk_features = extract_risk_features(found_items) # Format data for Scikit-learn
        risk_score = 0.0
        risk_level = "LOW"
        
        if risk_features:
            try:
                # FIX: Map 'total' to 'total_count' if that's what your model expects
                if "total" in risk_features:
                    risk_features["total_count"] = risk_features.pop("total")

                # Convert dict to DataFrame and predict
                df_features = pd.DataFrame([risk_features], columns=FEATURE_NAMES)
                prediction = risk_model.predict(df_features)[0]
                risk_score = float(prediction)
                
                # Determine risk tier based on score thresholds
                if risk_score < 35: risk_level = "LOW"
                elif risk_score < 70: risk_level = "MEDIUM"
                else: risk_level = "HIGH"
            except Exception as e:
                print(f"Risk model error: {e}")

        # ---------------------------------------
        # Phase 5: Visualization (Graph)
        # ---------------------------------------
        # Generate a bar chart using matplotlib
        graph_base64 = ""
        if found_items:
            summary = {}
            for item in found_items:
                t = item['type']
                summary[t] = summary.get(t, 0) + 1 
            
            plt.figure(figsize=(5, 3))
            plt.bar(list(summary.keys()), list(summary.values()), color='#3498db')
            plt.title('Detection Distribution')
            
            # Save plot to memory buffer and encode to base64
            graph_buffer = io.BytesIO()
            plt.savefig(graph_buffer, format='png', bbox_inches='tight')
            plt.close() # Free up memory
            graph_base64 = base64.b64encode(graph_buffer.getvalue()).decode('utf-8')

        # ---------------------------------------
        # Phase 6: Database Persistence
        # ---------------------------------------
        # Save all the generated data into the Django SQLite database
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

        # ---------------------------------------
        # Phase 7: Add to Batch Results
        # ---------------------------------------
        # Format the data to send back to the React frontend
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

    # Return the massive JSON payload back to the frontend
    return Response({
        "batch_id": str(batch_id),
        "total_images": len(all_image_results),
        "overall_status": "Protocol Analyzed",
        "results": all_image_results
    }, status=status.HTTP_200_OK)


# ==========================================
# 7. AUTHENTICATION ENDPOINTS
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """ Handles new user registration. """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Fields required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)
    
    # create_user hashes the password automatically for security
    User.objects.create_user(username=username, password=password)
    return Response({"message": "Success! You can now Login."}, status=201)

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
def custom_login(request):
    """ 
    Handles user login using JSON Web Tokens (JWT).
    Instead of sessions, the server gives the React frontend a 'token' it must send with future requests.
    """
    login_id = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')

    if not login_id or not password:
        return Response({"error": "Please provide both credentials"}, status=400)

    # Check if credentials match a user in the database
    user = authenticate(username=login_id, password=password)

    if user is not None:
        # Generate the JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "message": "Login Successful"
        }, status=200)
    
    return Response({"error": "Invalid credentials"}, status=401)


# ==========================================
# 8. DATA FETCHING ENDPOINTS (FOR FRONTEND)
# ==========================================
from django.db.models import F, Sum
import json

@api_view(['GET'])
@permission_classes([AllowAny])
def get_dashboard_data(request):#changed
    """ Fetches and formats data for the main dashboard view. Groups images by batch_id. """
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
            
            # Aggregate counts across all images in the batch
            details = d.detection_details or []
            for item in details:
                t = item.get("type")
                if t in total_summary:
                    total_summary[t] += 1

            # Append lightweight data for the dashboard card
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

    
    # Sort so the newest batches appear first
    dashboard.sort(key=lambda x: x['last_created'], reverse=True)
    
    return Response(dashboard)


@api_view(['GET'])
def get_single_detection(request,detection_id):#changed
    """ Fetches a single database row based on its ID. """
    try:
        detection=MarineWasteDetection.objects.get(id=detection_id)
        serializer = MarineWasteDetectionSerializer(detection) # Serialize it to JSON
        return Response(serializer.data)
    except MarineWasteDetection.DoesNotExist:
        return Response({"error": "Detection not found"}, status=404)
    

@api_view(['GET'])
def get_batch_results(request, batch_id):
    """ Fetches all results associated with a specific batch upload. """
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


# ==========================================
# 9. HAZARD ALGORITHM LOGIC
# ==========================================
from django.shortcuts import render
from .brain import get_marine_data

def calculate_physical_hazard(found_items):
    """
    Calculates the Aggregated Hazard Score (Hs) and individual 
    Particle Hazard (Hp) based on the MarineInsight Protocol.
    This is the core business logic translating pixel data into ecological risk.
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
        # Smaller particles represent a higher ingestion/biological risk
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
    # Fibers and films are ranked higher due to entanglement/ingestion dangers
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
        
        # Flag if we find dangerously small particles
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
        
        # Aggregate the scores for the whole sample
        total_hs += hp_score
        size_sum += s_rank
        shape_sum += sh_rank
        valid_n += 1

        # Track distributions for dominance logic (to find the most common type/size)
        shape_counts[shape] = shape_counts.get(shape, 0) + 1
        size_bin_counts[s_bin] = size_bin_counts.get(s_bin, 0) + 1

    # 4. Statistical Analysis
    dom_shape = max(shape_counts, key=shape_counts.get) if shape_counts else "None"
    dom_size = max(size_bin_counts, key=size_bin_counts.get) if size_bin_counts else "None"

    # 5. Percentage Contribution - Requirement Section 5
    # Calculate what percentage of the danger comes from shape vs. size
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


# ==========================================
# 10. TRENDS & INSIGHTS ENDPOINTS
# ==========================================
def search_insight(request):
    """
    Renders research data from the local vector database.
    (This returns an HTML template, not JSON, so it might be for a different frontend view)
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
    """ Returns all specific spots (beaches) analyzed within a given city. """
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
    """ 
    Analyzes historical data for a specific spot to generate a trend report. 
    (e.g., Is pollution increasing over time?)
    """
    spot = request.GET.get('spot') # e.g., "Vembanad"
    # Get all records for this spot, ordered oldest to newest
    records = MarineWasteDetection.objects.filter(beach_name=spot).order_by('analysis_timestamp')

    if not records.exists():
        return Response({"error": "No data for this location"}, status=404)

    # 1. COUNT TREND (Is pollution increasing?)
    counts = [r.total_detections for r in records]
    pollution_trend = "Stable"
    if len(counts) > 1:
        # Simple trend check: Is the last entry bigger than the first entry?
        pollution_trend = "Increasing" if counts[-1] > counts[0] else "Decreasing"

    # 2. SHAPE TREND (Source Tracking)
    latest_hazard = records.last().hazard_analytics
    dom_shape = latest_hazard.get("dominant_shape", "Unknown")
    
    # Map the shape back to the likely real-world source
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

    # Return a structured analysis payload for the frontend dashboard
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