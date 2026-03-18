from fastapi import APIRouter, UploadFile, File
from ultralytics import YOLO
import io, base64, numpy as np
from PIL import Image

# Change this from FastAPI() to APIRouter()
router = APIRouter()

model = YOLO('best.pt') 

@router.post("/detect") # Change @app to @router
async def detect(file: UploadFile = File(...)):
    data = await file.read()
    image = Image.open(io.BytesIO(data)).convert("RGB")
    
    results = model.predict(source=np.array(image))
    found_items = []
    annotated_base64 = ""

    for r in results:
        res_plotted = r.plot() 
        res_image = Image.fromarray(res_plotted.astype(np.uint8))
        
        buffered = io.BytesIO()
        res_image.save(buffered, format="JPEG")
        annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        if r.masks:
            for i, mask in enumerate(r.masks.data):
                area = float(mask.sum().item())
                label = model.names[int(r.boxes.cls[i])]
                found_items.append({"type": label, "area": round(area, 2)})

    return {
        "total": len(found_items), 
        "details": found_items,
        "image": f"data:image/jpeg;base64,{annotated_base64}"
    }