import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Get the path to the brain folder relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "marine_brain_v4")

# Load the same model we used in Colab
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_marine_data(query):
    # Connect to the existing brain
    vector_db = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)
    
    # Use the same MMR search we perfected in Colab
    results = vector_db.search(query, search_type="mmr", k=2)
    
    return [
        {"text": doc.page_content, "page": doc.metadata.get("page", "N/A")} 
        for doc in results
    ]