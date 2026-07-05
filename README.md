# Marine Insight Microplastics

This project is a full-stack web app for uploading marine sample images, running AI-based microplastic detection, and viewing analysis results.

It currently consists of:
- a Django backend in [djangoproject](djangoproject)
- a React + Vite frontend in [frontend](frontend)

## Prerequisites
Make sure you have the following installed locally:
- Python 3.10+ (recommended 3.11)
- Node.js 18+ and npm
- Git

## 1. Clone the repository
```bash
git clone <your-repo-url>
cd MarinePhase2
```

## 2. Set up the Django backend
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

## 3. Set up the React frontend
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

## 4. Create an account and use the app
1. Open the frontend in your browser.
2. Sign up or log in.
3. Upload images for analysis from the upload page.
4. View the generated results from the results dashboard.

## 5. Notes
- The frontend expects the Django API at the URL defined in [frontend/src/api.js](frontend/src/api.js). By default it uses:
  - http://127.0.0.1:8000/api
- If you are running Django on a different port, update the VITE_DJANGO_API_URL environment variable or the fallback URL in [frontend/src/api.js](frontend/src/api.js).
- If you want to build the frontend for production:
```bash
cd frontend
npm run build
```

## Project structure
- [djangoproject](djangoproject) - Django backend, models, API views, and ML logic
- [frontend](frontend) - React frontend built with Vite

## Troubleshooting
- If Django cannot start, make sure the virtual environment is activated and dependencies were installed successfully.
- If the frontend cannot connect to the backend, confirm the Django server is running and that the API URL is correct.
- If you see authentication issues, create a new user account and log in again.