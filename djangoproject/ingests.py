import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# 1. Setup paths
PDF_DIR = "./researchPapers"  # Put your 10+ research PDFs here
DB_DIR = "./myapp/marine_brain_new" # The folder the script will create

def build_knowledge_base():
    # Load all PDFs from the folder
    loader = PyPDFDirectoryLoader(PDF_DIR)
    documents = loader.load()

    # Split papers into meaningful chunks (1000 chars) [cite: 144]
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)

    # Initialize the Embedding model (turns text into numbers)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # Create the Persistent Database
    print(f"Indexing {len(chunks)} chunks into ChromaDB...")
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_DIR,
        collection_name="langchain" 
    )
    print("✅ Database built successfully!")

if __name__ == "__main__":
    build_knowledge_base()