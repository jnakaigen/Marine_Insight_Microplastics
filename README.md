
🌊 MarineInsight: A Unified Deep Learning & RAG Framework for Marine Microplastic Analysis and Hazard Assessment 

> An end-to-end full-stack platform automating the detection, quantification, and environmental risk assessment of marine microplastics using computer vision and Generative AI.
> 
> 

## 📌 Overview

Current methods for monitoring microplastic pollution rely heavily on manual microscopy, which is labor-intensive, error-prone, and struggles to scale for real-time environmental monitoring. **MarineInsight** bridges this gap by combining high-speed instance segmentation with a Retrieval-Augmented Generation (RAG) framework.

The system not only detects and measures microplastics from microscopic water sample images but also calculates their multidimensional physical risk and synthesizes the data into human-readable, evidence-backed ecological reports.

<img width="1877" height="947" alt="image (12)" src="https://github.com/user-attachments/assets/06ceb741-5f78-48fe-b5f4-c31b5286214b" />

<img width="1896" height="943" alt="image (1)" src="https://github.com/user-attachments/assets/a9d570b0-2dc4-4d45-af9f-b12ab9408efd" />

<img width="1869" height="921" alt="image (2)" src="https://github.com/user-attachments/assets/b8f3d7bf-0b65-4fdb-8f16-60a142d323b1" />

<img width="1875" height="938" alt="image (3)" src="https://github.com/user-attachments/assets/7405f369-2a7d-41a1-9ffc-dba1dc802b9a" />

<img width="1879" height="957" alt="image (4)" src="https://github.com/user-attachments/assets/e85fd5c3-035d-41af-8037-de9859c892b9" />

<img width="1832" height="832" alt="image (5)" src="https://github.com/user-attachments/assets/9b318686-d088-464d-b802-70b9e3dc12d2" />

<img width="1866" height="918" alt="image (7)" src="https://github.com/user-attachments/assets/ced7bdc4-d843-4293-855d-4e489e4839eb" />


## ✨ Key Features

* **Real-Time Instance Segmentation:** Powered by **YOLOv8-Seg** to instantly detect, segment, and classify microplastics into four primary morphologies: Fiber, Film, Fragment, and Pellet.


* **Multidimensional Hazard Assessment:** Calculates a particle-specific hazard score (Hp = Size Rank + Shape Rank) to evaluate the physical risk posed by the contaminants.


* **RAG-Powered Ecotoxicologist:** Translates raw quantitative metrics into comprehensive environmental impact reports by retrieving contextual knowledge from validated scientific literature.


* **Full-Stack Analytics Dashboard:** Features a React.js frontend for an interactive user experience and a robust Django backend for secure HTTP handling and deep learning model integration. Includes seamless PDF and CSV data exports.



## 🛠️ Tech Stack

* **Machine Learning & AI:** Python, YOLOv8-Seg, Transfer Learning 


* **Generative AI:** Retrieval-Augmented Generation (RAG), Dense Vector Indexing, LLMs 


* **Backend:** Django (Python), REST APIs 


* **Frontend:** React.js 


* **Data & Annotation:** Roboflow 



## 🏗️ System Architecture

1. **Data Ingestion & QA:** Users upload microscopic images after clearing a strict sample preparation and imaging standard checklist.


2. **AI Processing:** YOLOv8-Seg extracts precise segmentation masks, outputting particle counts, size (area in pixels/mm²), and morphological class.


3. **Hazard Calculation:** The backend ranks each particle based on its physical dimensions to isolate the maximum particle-specific hazard.


4. **Knowledge Retrieval:** The RAG pipeline queries a vector database of scientific literature based on the specific sample findings.


5. **Synthesis & Export:** The platform generates a grounded environmental report and visual dashboard for the researcher.



## 🚀 Installation & Local Setup

### Prerequisites

* Python 3.9+
* Node.js & npm
* Git

### Backend (Django + ML Models)

```bash
# 1. Clone the repository
git clone https://github.com/YourUsername/MarineInsight.git
cd MarineInsight/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Start the backend server
python manage.py runserver

```

### Frontend (React)

```bash
# 1. Navigate to the frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start

```

## 🔗 Project Links

* **Roboflow Dataset:** [https://app.roboflow.com/project-aunby/microplastic-final-kpdl3/2]
* **Colab Training Notebooks:**
      🟢 [YOLOv8-Seg Training Notebook](https://colab.research.google.com/drive/1y6JAWzAqOOwEp_3ae1d4upe_IZp1H9j5)
      🔵 [U-Net2+ Training Notebook](https://colab.research.google.com/drive/1kzI24BQzk_fHkDIYn02w-_re_WaQ1y5Z)
      🟣 [U-Net Training Notebook](https://colab.research.google.com/drive/1FPozBVioMZxU2MOivYiuB3oS0VtgZw0k)
