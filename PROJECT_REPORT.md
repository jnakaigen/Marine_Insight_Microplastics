# MarinePhase2 Project Report

## 1. Report Scope

This report covers the project architecture, data flow, and main features for the code outside the `backend` folder. It focuses on:

- `djangoproject` (Django application)
- `frontend` (React/Vite user interface)
- project documentation and implementation patterns


---

## 2. Project Summary

MarinePhase2 is a marine environmental analysis platform combining computer vision, machine learning, and retrieval-augmented generation (RAG) to analyze microplastic samples. The platform enables users to upload microscope images, detect microplastic particles, classify them by morphology, compute risk metrics, and generate scientific reports.

Key capabilities:

- Image upload and batch analysis
- YOLO-based microplastic detection
- Morphology classification (fiber, pellet, fragment, film)
- Ecological risk scoring using a classical ML model
- RAG-backed scientific report generation
- Dashboard review, results visualization, and export

---

## 3. Technology Stack

### Backend (Django)

- Django 6.0 and Django REST Framework
- Python ML libraries: `ultralytics`, `tensorflow`, `torch`, `joblib`
- Image handling: `PIL`, `OpenCV`, `numpy`
- Data tools: `pandas`, `matplotlib`
- Vector search / embeddings: `langchain_chroma`, `langchain_huggingface`, `chromadb`

### Frontend

- React + Vite
- React Router DOM for client-side routing
- `axios` for API requests
- HTML-to-PDF export via `html2pdf.js`
- GSAP animations for dashboard interactions

### Data & Storage

- Django ORM with SQLite-backed models
- ChromaDB persistent vector store for RAG
- Local model artifacts: `best.pt`, `best_weathering.pt`, `age_classifier_v2.h5`, `risk_model.pkl`

---

## 4. Django Application Overview

### 4.1 Main Model: `MarineWasteDetection`

Defined in `djangoproject/myapp/models.py`, this model stores:

- `user`: link to Django `User`
- `batch_id`: UUID for grouped uploads
- `filename`: original image name
- `total_detections`: count of particles detected
- `annotated_image_base64`: base64-encoded annotated image
- `graph_image_base64`: optional graph image output
- `detection_details`: JSON field with per-particle detection metadata
- `scientific_report`: generated report text
- `ecological_risk_score` and `ecological_risk_level`
- `hazard_analytics` and `aggregated_hazard_score`
- `sampling_location`, `analysis_timestamp`, `beach_name`

### 4.2 API Endpoints

Mapped in `djangoproject/myapp/urls.py`:

- `POST /api/signup/` → `signup_view`
- `POST /api/login/` → `custom_login`
- `POST /api/detect/` → `detect_marine_waste`
- `GET /api/dashboard/` → `get_dashboard_data`
- `GET /api/detection/<id>/` → `get_single_detection`
- `GET /api/batch/<batch_id>/` → `get_batch_results`
- `GET /api/locations/` → `get_locations_by_city`
- `GET /api/spot-insight/` → `get_spot_insight`

### 4.3 Detection and Analysis Pipeline

The main analysis path is implemented in `djangoproject/myapp/views.py`.

Important components:

- `model = YOLO('best.pt')`: primary detection model for microplastic objects
- `model1 = YOLO('best_weathering.pt')`: specialized weathering/segmentation model
- `age_model = load_model('age_classifier_v2.h5')`: Keras-based age/weathering classifier
- `risk_model = joblib.load('risk_model.pkl')`: classical ML model for ecological risk

Key helper functions:

- `extract_risk_features(found_items)`: converts detected objects into model-ready features
- `pixel_area_to_mm(area_pixels)`: converts pixel area into approximate physical size

The `detect_marine_waste` endpoint:

1. receives multipart uploads and metadata
2. loops through each uploaded image
3. runs YOLO inference and draws annotated output
4. computes per-object size and classification metrics
5. builds feature vectors for the risk model
6. stores results in the `MarineWasteDetection` model
7. returns detection output to the frontend

### 4.4 RAG Report Generation

The scientific report generator is implemented in `djangoproject/myapp/Newbrain.py`.

Core behavior:

- loads OpenRouter/OpenAI-style LLM client using environment variables
- loads `sentence-transformers/all-MiniLM-L6-v2` embeddings
- connects to a local ChromaDB collection at `marine_brain_new`
- performs similarity search using sample metrics
- constructs a controlled prompt for evidence-first scientific text generation
- requests a long-form report from the LLM

The prompt enforces:

- evidence-based analysis
- structured sections (Executive Summary, Morphological Toxicity, Size-Class Implications, Trophic Implications, Human Health, Data Quality, References)
- at least 1,200 words
- explicit disclosure of physical hazard modeling limitations

---

## 5. Frontend Architecture and Pages

### 5.1 Routing

Defined in `frontend/src/App.jsx`, the main client routes include:

- `/` → `LandingPage`
- `/login` → `LoginPage`
- `/signup` → `SignupPage`
- `/forgot-password` → `ForgotPasswordPage`
- `/dashboard` → `DashboardPage`
- `/upload` → `UploadPage`
- `/results` → `ResultsPage`
- `/results/:id` → `ResultsPage` with batch data
- `/report` → `ReportPage`
- `/detections/:id` → `SingleDetection`
- `/qa` → `QAPage`
- `/edu` → `EduAwareness`

The app uses `SummaryStatsProvider` context for shared analytics state.

### 5.2 Upload Flow

`frontend/src/pages/UploadPage.jsx` provides:

- file selection and browsing
- sampling location entry
- timestamp input
- upload of multiple images as multipart form data
- POST to `http://127.0.0.1:8000/api/detect/`
- navigation to `/results` after analysis

### 5.3 Dashboard

`frontend/src/pages/DashboardPage.jsx` implements:

- fetch from `http://127.0.0.1:8000/api/dashboard/`
- search by location
- cards for batch results with thumbnail previews
- buttons to view batch results and scientific reports
- animated entrance for analysis cards via GSAP

### 5.4 Results & Reporting

`frontend/src/pages/ResultsPage.jsx` supports:

- retrieval of batch details from `http://127.0.0.1:8000/api/batch/<id>/`
- summary metrics for particle counts and area
- image gallery of annotated outputs
- scientific report display
- PDF export of the generated report
- CSV export of detection details and areas

### 5.5 Authentication and Account Management

Frontend pages show both canonical login/signup and alternate login pages.

- `frontend/src/pages/LoginPage.jsx` posts to `/api/login`
- `frontend/src/pages/SignupPage.jsx` posts to `/api/register`
- `frontend/src/pages/Signnup.jsx` posts to `/api/signup/`

### 5.6 Additional UX Pages

- `QAPage.jsx`: quality assurance workflow for laboratory sample preparation and verification
- `EduAwareness.jsx`: educational content on microplastic impacts and environmental awareness
- `SingleDetection.jsx` / `SingleViewReport.jsx`: per-detection detail views

---

## 6. Data Flow Summary

1. User selects sample images and metadata in the frontend
2. Frontend sends images + location + timestamp to Django endpoint `/api/detect/`
3. Django loads YOLO, age classifier, and risk model
4. Image detections are converted into structured features
5. The model computes hazard scores and generates charts
6. Results are persisted in `MarineWasteDetection`
7. Frontend dashboard and result pages fetch stored batch data
8. RAG module builds a science-backed narrative report
9. User can review analysis, export PDF, or download CSV

---

## 7. Notable Project Features

- Multi-image batch processing using UUID-based `batch_id`
- Base64 storage of annotated imagery for browser display
- Combined morphology and size hazard analytics
- Persistent vector search for scientific evidence retrieval
- Evidence-first prompt design with explicit report structure
- Frontend export utilities for scientific reporting and data sharing
- Modern React dashboard with search and card UI

---

## 8. Implementation Notes

- The Django app loads heavy models globally to avoid repeated reloads per request.
- `matplotlib` uses the `Agg` backend for server-friendly image generation.
- RAG relies on local ChromaDB persistence in `djangoproject/myapp/marine_brain_new`.
- The frontend uses hard-coded local API URLs (`127.0.0.1:8000`) for development mode.

---

## 9. Recommendations for Next Steps

1. Validate the API contract between Django endpoints and the React frontend.
2. Confirm the presence and integrity of the model artifacts: `best.pt`, `best_weathering.pt`, `age_classifier_v2.h5`, `risk_model.pkl`.
3. Add documentation for environment variables required by RAG and OpenRouter.
4. If desired, enhance report generation with explicit source citations from saved metadata.

