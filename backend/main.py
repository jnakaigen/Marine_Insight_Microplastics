# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from routes import auth

# app = FastAPI()

# # CORS (Cross-Origin Resource Sharing) Middleware
# # This allows your React frontend (running on a different port) to communicate with this backend.
# origins = [
#     "http://localhost:3000", # Default React port
#     "http://localhost:5173", # Default Vite port
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Include the authentication router
# app.include_router(auth.router, prefix="/api", tags=["Authentication"])

# @app.get("/")
# def read_root():
#     return {"message": "Welcome to Marine Insight Backend"}
# main.py

# Update this list to include 5174
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, detection  # Cleaned up duplicate import

app = FastAPI() 

# Updated origins list
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(detection.router, prefix="/api", tags=["Detection"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Marine Insight Backend"}