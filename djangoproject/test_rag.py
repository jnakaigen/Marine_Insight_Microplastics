import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

def run_standalone_test():
    # 1. Locate the folder
    current_dir = os.getcwd()
    db_path = os.path.join(current_dir, "marine_insight_db_export")
    
    print(f"🔍 Searching for database at: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"❌ Error: Folder 'marine_insight_db' not found!")
        print(f"Make sure you extracted the zip into: {current_dir}")
        return

    # 2. Load the Embedding Model
    print("⏳ Loading Embedding Model (this takes a few seconds)...")
    try:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception as e:
        print(f"❌ Error loading embeddings: {e}")
        return

    # 3. Load the Vector Database
    print("📦 Opening ChromaDB...")
    try:
        db = Chroma(persist_directory=db_path, embedding_function=embeddings)
        
        # 4. Perform a Test Query
        test_query = "fiber impacts"
        print(f"🔎 Testing query: '{test_query}'")
        
        results = db.similarity_search(test_query, k=1)
        
        if results:
            print("\n" + "✅" * 10)
            print("SUCCESS! RAG IS WORKING LOCALLY!")
            print("✅" * 10)
            print(f"\nFound Research Data:\n{results[0].page_content[:250]}...")
        else:
            print("⚠️ Database opened, but it seems to be empty.")
            
    except Exception as e:
        print(f"❌ Failed to read database: {str(e)}")

if __name__ == "__main__":
    run_standalone_test()