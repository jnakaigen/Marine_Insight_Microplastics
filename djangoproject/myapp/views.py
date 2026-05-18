# ==========================================
# 1. IMPORTS SECTION
# ==========================================
import uuid 
import os 
import cv2 
import io 
import base64 
import joblib 
import numpy as np 
import pandas as pd 
import matplotlib 
import matplotlib.pyplot as plt 
import chromadb

from django.shortcuts import render 
from django.conf import settings 
from django.http import JsonResponse 
from django.views.decorators.csrf import csrf_exempt 
from django.db.models import Count, Max, F, Sum
from django.utils import timezone 
from django.contrib.auth.models import User 
from django.contrib.auth import authenticate

from rest_framework.response import Response   
from rest_framework.permissions import IsAuthenticated, AllowAny 
from rest_framework.decorators import api_view, parser_classes, permission_classes 
from rest_framework.parsers import MultiPartParser, FormParser 
from rest_framework import status 
from rest_framework_simplejwt.tokens import RefreshToken

from PIL import Image 
from ultralytics import YOLO 
from tensorflow.keras.models import load_model 
from langchain_huggingface import HuggingFaceEmbeddings 
from langchain_chroma import Chroma 

from myapp.serializers import MarineWasteDetectionSerializer 
from .models import MarineWasteDetection 
from .Newbrain import generate_scientific_report 

# ==========================================
# 2. GLOBAL CONSTANTS & HELPER FUNCTIONS
# ==========================================
PIXEL_TO_MM = 0.01  

def extract_risk_features(found_items):
    total = len(found_items)
    if total == 0: 
        return None

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
    return (area_pixels ** 0.5) * PIXEL_TO_MM

# ==========================================
# 3. GLOBAL MODEL LOADING
# ==========================================
BASE_DIR_PATH = str(settings.BASE_DIR)
weathering_path = os.path.join(BASE_DIR_PATH, 'best_weathering.pt')
model1 = YOLO(weathering_path)

age_model_path = os.path.join(BASE_DIR_PATH, "age_classifier_v2.h5")
age_model = load_model(age_model_path)
os.environ["TF_USE_LEGACY_KERAS"] = "1" 

# ==========================================
# 4. RAG / VECTOR DATABASE SETUP
# ==========================================
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_vector_db():
    """
    Lazy loads Chroma vector database only when actively running an analysis pipeline.
    Prevents global scope exceptions from crashing unrelated views like signup and login.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(current_dir, "marine_brain_new")
    
    if not os.path.exists(DB_PATH):
        # Create a fallback empty directory structure on Render so it doesn't throw a hard crash
        os.makedirs(DB_PATH, exist_ok=True)
        
    persistent_client = chromadb.PersistentClient(path=DB_PATH)
    return Chroma(
        client=persistent_client,
        collection_name="langchain",
        embedding_function=embeddings,
    )

# ==========================================
# 5. MORE MODEL LOADING
# ==========================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

risk_model_path = os.path.join(BASE_DIR, "risk_model.pkl")
risk_model = joblib.load(risk_model_path)

matplotlib.use('Agg')
best_path = os.path.join(BASE_DIR_PATH, 'best.pt')
model = YOLO(best_path)

# ==========================================
# 6. MAIN DETECTION API ENDPOINT
# ==========================================
@csrf_exempt 
@api_view(['POST']) 
@parser_classes([MultiPartParser, FormParser]) 
@permission_classes([IsAuthenticated]) # SECURED
def detect_marine_waste(request):
    files = request.FILES.getlist('files')
    if not files:
        return Response({"error": "No files uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    location = request.data.get('location', 'Unknown')
    beach_name = request.data.get('beach_name', 'General')
    timestamp_str = request.data.get('timestamp')
    analysis_time = timezone.now()

    if timestamp_str:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            analysis_time = timezone.make_aware(dt, timezone.get_current_timezone())
        except (ValueError, TypeError):
            analysis_time = timezone.now()

    all_image_results = []
    batch_id = uuid.uuid4() 

    for file in files:
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")

        # --- Phase 1: Detection (YOLO) ---
        results = model.predict(source=np.array(image))
        found_items = []
        annotated_base64 = ""

        for r in results:
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
                        "type": label.lower(), 
                        "area": round(area, 2),
                        "size_mm": round(size_mm, 4),
                        "category": "Microplastic", 
                        "priority": "HIGH" if area > 500 else "MEDIUM",
                        "trophic": "High risk of ingestion by marine biota.",
                        "chem": "Potential for chemical leaching and adsorption."
                    })
        
        # --- Phase 2: Hazard Analytics Phase ---
        hazard_metrics = calculate_physical_hazard(found_items)
        
       # --- Phase 3: Scientific Reporting Phase (RAG) ---
        try:
            # Safely invoke the lazy load constructor when processing batches
            v_db = get_vector_db() 
            scientific_report_text = generate_scientific_report(hazard_metrics, str(batch_id))
        except Exception as e:
            scientific_report_text = f"Report error: {str(e)}"

        # --- Phase 4: Risk Model Prediction (ML) ---
        risk_score = 0.0
        risk_level = "Requires Volume"

        # --- Phase 5: Visualization (Graph) ---
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

        # --- Phase 6: Database Persistence ---
        db_entry = MarineWasteDetection.objects.create(
            user=request.user, # Tied strictly to the logged-in user
            batch_id=batch_id,
            filename=file.name,
            total_detections=len(found_items),
            annotated_image_base64=f"data:image/jpeg;base64,{annotated_base64}",
            graph_image_base64=f"data:image/png;base64,{graph_base64}" if graph_base64 else None,
            detection_details=found_items, 
            analysis_timestamp=analysis_time,
            ecological_risk_score=risk_score,
            ecological_risk_level=risk_level,
            hazard_analytics=hazard_metrics, 
            aggregated_hazard_score=hazard_metrics.get("max_Hp", 0), 
            scientific_report=scientific_report_text,
            sampling_location=location,
            beach_name=beach_name,
        )

        # --- Phase 7: Add to Batch Results ---
        all_image_results.append({
            "db_id": db_entry.id,
            "filename": file.name,
            "total_detections": len(found_items),
            "detection_details": found_items,  
            "hazard_metrics": hazard_metrics,
            "scientific_report": scientific_report_text,
            "risk_score": risk_score,
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


# ==========================================
# 7. AUTHENTICATION ENDPOINTS
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Fields required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)
    
    User.objects.create_user(username=username, password=password)
    return Response({"message": "Success! You can now Login."}, status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
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


# ==========================================
# 8. DATA FETCHING ENDPOINTS (FOR FRONTEND)
# ==========================================
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # SECURED
def get_dashboard_data(request):
    batch_ids = MarineWasteDetection.objects.filter(user=request.user).values_list('batch_id', flat=True).distinct()
    dashboard = []

    for b_id in batch_ids:
        detections = MarineWasteDetection.objects.filter(batch_id=b_id, user=request.user)
        if not detections.exists():
            continue

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
            "user": latest_entry.user.username if latest_entry.user else "Anonymous",
            "image_count": detections.count(),
            "last_created": latest_entry.created_at,
            "summary": total_summary,
            "detections": detection_list
        })

    dashboard.sort(key=lambda x: x['last_created'], reverse=True)
    return Response(dashboard)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # SECURED
def get_single_detection(request, detection_id):
    try:
        detection = MarineWasteDetection.objects.get(id=detection_id, user=request.user)
        serializer = MarineWasteDetectionSerializer(detection) 
        return Response(serializer.data)
    except MarineWasteDetection.DoesNotExist:
        return Response({"error": "Detection not found or unauthorized"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # SECURED
def get_batch_results(request, batch_id):
    detections = MarineWasteDetection.objects.filter(batch_id=batch_id, user=request.user)
    
    if not detections.exists():
        return Response({"error": "Batch not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated]) # SECURED
def delete_batch(request, batch_id):
    deleted_count, _ = MarineWasteDetection.objects.filter(batch_id=batch_id, user=request.user).delete()
    if deleted_count == 0:
        return Response({"error": "Batch not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "Batch deleted successfully.", "batch_id": str(batch_id)}, status=status.HTTP_200_OK)


# ==========================================
# 9. HAZARD ALGORITHM LOGIC (PROTOCOL ALIGNED)
# ==========================================
def calculate_physical_hazard(found_items):
    """
    Calculates the Maximum Particle-Specific Hazard Score (Max Hp) and
    component percentages based on the MarineInsight Protocol.
    """
    if not found_items:
        return {
            "max_Hp": 0.0,
            "max_hp_shape": "None",
            "max_hp_size_bin": "None",
            "dominant_shape": "None",
            "dominant_size_bin": "None",
            "critical_size_flag": False,
            "shape_contribution_percent": 0.0,
            "size_contribution_percent": 0.0,
            "assumptions": [],
            "n": 0
        }

    def get_size_rank(size_mm):
        if size_mm < 0.001: return None, "Excluded"
        if size_mm <= 0.009: return 0.70, "Smallest microplastic"
        elif size_mm < 0.1: return 0.40, "Small microplastic"
        elif size_mm < 1.0: return 0.30, "Intermediate microplastic"
        else: return 0.10, "Large microplastic"

    shape_ranks = {"fiber": 0.90, "film": 0.80, "fragment": 0.60, "pellet": 0.10, "sphere": 0.10}

    max_hp = 0.0
    max_s_rank = 0.0
    max_sh_rank = 0.0
    max_shape_str = "Unknown"
    max_size_str = "Unknown"
    
    shape_counts = {}
    size_bin_counts = {}
    critical_size_flag = False
    valid_n = 0
    assumptions = []

    for item in found_items:
        shape = str(item.get("type", "")).lower()
        size_mm = item.get("size_mm", 0)

        s_rank, s_bin = get_size_rank(size_mm)
        if s_rank is None: 
            continue 
        
        if s_bin == "Smallest microplastic": 
            critical_size_flag = True

        if shape not in shape_ranks:
            assumption_text = f"Assumed unlisted morphology '{shape}' as Fragment (0.60)"
            if assumption_text not in assumptions:
                assumptions.append(assumption_text)
            sh_rank = 0.60
        else:
            sh_rank = shape_ranks[shape] 

        hp_score = s_rank + sh_rank
        item["hp_score"] = round(hp_score, 2)
        item["size_rank"] = s_rank
        item["shape_rank"] = sh_rank
        
        if hp_score > max_hp:
            max_hp = hp_score
            max_s_rank = s_rank
            max_sh_rank = sh_rank
            max_shape_str = shape
            max_size_str = s_bin

        valid_n += 1
        shape_counts[shape] = shape_counts.get(shape, 0) + 1
        size_bin_counts[s_bin] = size_bin_counts.get(s_bin, 0) + 1

    dom_shape = max(shape_counts, key=shape_counts.get) if shape_counts else "None"
    dom_size = max(size_bin_counts, key=size_bin_counts.get) if size_bin_counts else "None"

    total_max_comp = max_s_rank + max_sh_rank
    shape_cont = (max_sh_rank / total_max_comp * 100) if total_max_comp > 0 else 0
    size_cont = (max_s_rank / total_max_comp * 100) if total_max_comp > 0 else 0

    return {
        "max_Hp": round(max_hp, 2),
        "max_hp_shape": max_shape_str.capitalize(), 
        "max_hp_size_bin": max_size_str,            
        "dominant_shape": dom_shape.capitalize(),
        "dominant_size_bin": dom_size,
        "critical_size_flag": critical_size_flag,
        "shape_contribution_percent": round(shape_cont, 2),
        "size_contribution_percent": round(size_cont, 2),
        "assumptions": assumptions,
        "n": valid_n 
    }

# ==========================================
# 10. TRENDS & INSIGHTS ENDPOINTS
# ==========================================
def search_insight(request):
    query = request.GET.get('q') 
    results = []
    
    if query:
        pass 
        
    return render(request, 'insight_results.html', {'results': results, 'query': query})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_locations_by_city(request):
    city = request.GET.get('city')
    spots = MarineWasteDetection.objects.filter(
        sampling_location__iexact=city
    ).values_list('beach_name', flat=True).distinct()
    
    return Response({
        "city": city,
        "spots": list(spots)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_spot_insight(request):
    spot = request.GET.get('spot') 
    records = MarineWasteDetection.objects.filter(beach_name=spot).order_by('analysis_timestamp')

    if not records.exists():
        return Response({"error": "No data for this location"}, status=404)

    counts = [r.total_detections for r in records]
    pollution_trend = "Stable"
    if len(counts) > 1:
        pollution_trend = "Increasing" if counts[-1] > counts[0] else "Decreasing"

    latest_hazard = records.last().hazard_analytics
    dom_shape = latest_hazard.get("dominant_shape", "Unknown")
    
    source_map = {
        "Fiber": "Textile waste (laundry/fishing nets)",
        "Film": "Packaging/Plastic bags",
        "Fragment": "Broken larger plastic debris",
        "Pellet": "Industrial raw material spills"
    }
    source_insight = source_map.get(dom_shape, f"{dom_shape} dominant source")

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