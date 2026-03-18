import os
import django

# --- 1. SET UP DJANGO ENVIRONMENT ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings') # Ensure 'myproject' matches your folder name
django.setup()

from django.conf import settings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def run_ingestion():
    # --- 2. CONFIGURATION ---
    # Update this to the exact folder where your PDFs are
    PDF_FOLDER = r"C:\Users\Namithaprasad\Desktop\Marine_Insight-main\research_papers"
    DB_PATH = os.path.join(str(settings.BASE_DIR), "myapp", "marine_insight_db")

    if not os.path.exists(PDF_FOLDER):
        print(f"❌ ERROR: Folder not found at {PDF_FOLDER}")
        return

    # --- 3. LOAD PDFs ---
    print(f"⏳ Loading PDFs from: {PDF_FOLDER}")
    all_docs = []
    for file in os.listdir(PDF_FOLDER):
        if file.endswith(".pdf"):
            try:
                loader = PyPDFLoader(os.path.join(PDF_FOLDER, file))
                all_docs.extend(loader.load())
                print(f" ✅ Loaded: {file}")
            except Exception as e:
                print(f" ❌ Error loading {file}: {e}")

    if not all_docs:
        print("🚨 No PDF content found!")
        return

    # --- 4. SPLIT TEXT ---
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    splits = text_splitter.split_documents(all_docs)
    print(f"📖 Split into {len(splits)} chunks.")

    # --- 5. EMBED AND SAVE ---
    print("🧠 Generating embeddings and saving to ChromaDB...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vector_db = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=DB_PATH,
        collection_name="langchain"
    )

    print(f"🚀 SUCCESS! Database now contains {vector_db._collection.count()} documents.")

if __name__ == "__main__":
    run_ingestion()