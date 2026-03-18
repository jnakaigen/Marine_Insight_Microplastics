# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware  # Added this import
# from ultralytics import YOLO
# import io
# from PIL import Image
# import numpy as np

# # STEP 1: Create the app FIRST
# app = FastAPI()

# # STEP 2: Add the middleware SECOND
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # STEP 3: Load your model
# model = YOLO('best.pt') 

# @app.post("/detect")
# async def detect(file: UploadFile = File(...)):
#     data = await file.read()
#     image = Image.open(io.BytesIO(data)).convert("RGB")
    
#     results = model.predict(source=np.array(image))
    
#     found_items = []
#     for r in results:
#         if r.masks:
#             for i, mask in enumerate(r.masks.data):
#                 area = float(mask.sum().item())
#                 label = model.names[int(r.boxes.cls[i])]
#                 found_items.append({"type": label, "area": round(area, 2)})

#     return {"total": len(found_items), "details": found_items}
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
import base64
from PIL import Image
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('best.pt') 

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    data = await file.read()
    image = Image.open(io.BytesIO(data)).convert("RGB")
    
    # 1. Run AI
    results = model.predict(source=np.array(image))
    
    found_items = []
    annotated_base64 = ""

    for r in results:
        # 2. Generate the colorful image
        res_plotted = r.plot() # This is the image with masks/boxes
        res_image = Image.fromarray(res_plotted.astype(np.uint8))
        
        # 3. Convert image to Base64 string
        buffered = io.BytesIO()
        res_image.save(buffered, format="JPEG")
        annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # 4. Get the data for the table
        if r.masks:
            for i, mask in enumerate(r.masks.data):
                area = float(mask.sum().item())
                label = model.names[int(r.boxes.cls[i])]
                found_items.append({"type": label, "area": round(area, 2)})

    # Return BOTH data and the image
    return {
        "total": len(found_items), 
        "details": found_items,
        "image": f"data:image/jpeg;base64,{annotated_base64}"
    }