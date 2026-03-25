
import os
import django
import re
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# 1. Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings') 
django.setup()
from django.conf import settings

def clean_text(text):
    """Fixes PDF ligatures and formatting issues"""
    replacements = {
        "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl",
        "  ": " ", "\n": " ", "\r": " "
    }
    for search, replace in replacements.items():
        text = text.replace(search, replace)
    
    # Remove citations like [1], [10-14] to make it more readable
    text = re.sub(r'\[\d+(–\d+)?(,\s*\d+)*\]', '', text)
    
    # Fix broken words (environmen t -> environment)
    text = re.sub(r'(\w)\s+(\w)', r'\1\2', text) # Simple fix for accidental spaces
    
    return text.strip()

def start_ingestion():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PDF_DIR = os.path.join(BASE_DIR, "Research_papers") 
    DB_PATH = os.path.join(BASE_DIR, "myapp", "marine_insight_db")

    if not os.path.exists(PDF_DIR):
        print(f"🚨 ERROR: Folder '{PDF_DIR}' not found!")
        return

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("🧹 Clearing old messy data...")
    vector_db = Chroma(persist_directory=DB_PATH, embedding_function=embeddings, collection_name="langchain")
    try: vector_db.delete_collection()
    except: pass

    # 5. Load and Clean
    print("⏳ Processing and cleaning PDFs...")
    documents = []
    pdf_files = [f for f in os.listdir(PDF_DIR) if f.endswith(".pdf")]
    
    for file in pdf_files:
        loader = PyPDFLoader(os.path.join(PDF_DIR, file))
        raw_docs = loader.load()
        for doc in raw_docs:
            doc.page_content = clean_text(doc.page_content) # Apply cleaning
        documents.extend(raw_docs)
        print(f" ✅ Cleaned & Loaded: {file}")

    # 6. Split and Save
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    final_splits = text_splitter.split_documents(documents)
    
    print(f"🚀 Re-indexing {len(final_splits)} clean chunks...")
    Chroma.from_documents(
        documents=final_splits,
        embedding=embeddings,
        persist_directory=DB_PATH,
        collection_name="langchain"
    )
    print("✨ SUCCESS! The brain is now clean and professional.")

if __name__ == "__main__":
    start_ingestion()