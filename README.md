# Marine Insight Microplastics

An end-to-end full-stack platform for uploading marine sample images, running AI-based microplastic detection, and viewing analysis results.

This project combines computer vision, environmental hazard scoring, and generative AI to help researchers analyze marine microplastic pollution more efficiently.

## Overview

Current methods for monitoring microplastic pollution rely heavily on manual microscopy, which is labor-intensive, error-prone, and difficult to scale for real-time environmental monitoring. Marine Insight bridges this gap by combining high-speed instance segmentation with a retrieval-augmented generation workflow.

The system detects and measures microplastics from microscopic water sample images, calculates their physical risk, and synthesizes the data into evidence-backed ecological reports.

<img width="1877" height="947" alt="Marine Insight dashboard preview" src="https://github.com/user-attachments/assets/06ceb741-5f78-48fe-b5f4-c31b5286214b" />

<img width="1896" height="943" alt="Microplastic analysis interface" src="https://github.com/user-attachments/assets/a9d570b0-2dc4-4d45-af9f-b12ab9408efd" />

<img width="1869" height="921" alt="Analysis results page" src="https://github.com/user-attachments/assets/b8f3d7bf-0b65-4fdb-8f16-60a142d323b1" />



<img width="1832" height="832" alt="Detection results view" src="https://github.com/user-attachments/assets/9b318686-d088-464d-b802-70b9e3dc12d2" />

<img width="1866" height="918" alt="Dashboard summary view" src="https://github.com/user-attachments/assets/ced7bdc4-d843-4293-855d-4e489e4839eb" />

## Key Features

- Real-time instance segmentation powered by YOLOv8-Seg for detecting and classifying microplastics into fiber, film, fragment, and pellet morphologies.
- Multidimensional hazard assessment that calculates particle-level risk based on size and shape.
- RAG-powered report generation that turns quantitative findings into human-readable ecological insights.
- Full-stack analytics dashboard with React and Django for upload, analysis, results, and reporting workflows.

## Tech Stack

- Machine Learning and AI: Python, YOLOv8-Seg, transfer learning
- Generative AI: retrieval-augmented generation, dense vector indexing, LLMs
- Backend: Django, REST APIs
- Frontend: React + Vite
- Data and annotation: Roboflow

## Local Setup

### Prerequisites
Make sure you have the following installed locally:
- Python 3.10+ (recommended 3.11)
- Node.js 18+ and npm
- Git

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd MarinePhase2
```

### 2. Set up the Django backend
Open a terminal in the project root and run:

```bash
cd djangoproject
python -m venv venv
```

On Windows:
```bash
venv\\Scripts\\activate
```

On macOS/Linux:
```bash
source venv/bin/activate
```

Install the Python dependencies:
```bash
pip install -r requirements.txt
```

Apply the database migrations:
```bash
python manage.py migrate
```

Start the Django server:
```bash
python manage.py runserver 0.0.0.0:8000
```

The backend API should now be available at:
- http://127.0.0.1:8000/api

### 3. Set up the React frontend
Open a second terminal and run:

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The frontend should open at:
- http://127.0.0.1:5173

### 4. Create an account and use the app
1. Open the frontend in your browser.
2. Sign up or log in.
3. Upload images for analysis from the upload page.
4. View the generated results from the results dashboard.

### 5. Notes
- The frontend expects the Django API at the URL defined in [frontend/src/api.js](frontend/src/api.js). By default it uses:
  - http://127.0.0.1:8000/api
- If you are running Django on a different port, update the VITE_DJANGO_API_URL environment variable or the fallback URL in [frontend/src/api.js](frontend/src/api.js).
- If you want to build the frontend for production:

```bash
cd frontend
npm run build
```

## Project Structure

- [djangoproject](djangoproject) - Django backend, models, API views, and ML logic
- [frontend](frontend) - React frontend built with Vite

## Troubleshooting

- If Django cannot start, make sure the virtual environment is activated and dependencies were installed successfully.
- If the frontend cannot connect to the backend, confirm the Django server is running and that the API URL is correct.
- If you see authentication issues, create a new user account and log in again.