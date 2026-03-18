import chromadb
import os

# 1. Set the path to the folder containing 'chroma.sqlite3' from your screenshot
# Replace 'path/to/your/folder' with the actual folder path
db_path = "./marine_insight_db" 

def verify_chroma_content():
    if not os.path.exists(db_path):
        print(f"❌ Error: Folder not found at {db_path}")
        return

    # Initialize Client
    client = chromadb.PersistentClient(path=db_path)
    
    try:
        # Get the collection (usually named 'marine_microplastics' or similar)
        # If you don't know the name, let's list them all
        collections = client.list_collections()
        
        if not collections:
            print("❌ No collections found in this database. It is empty.")
            return

        for col in collections:
            print(f"\n--- Checking Collection: {col.name} ---")
            collection = client.get_collection(name=col.name)
            
            # Fetch the first 5 items
            results = collection.peek(limit=5)
            
            if not results['documents']:
                print("⚠️ Collection exists but contains no text documents.")
            else:
                print(f"✅ Found {len(results['documents'])} samples. Previewing first document:")
                print(f"Text Content: {results['documents'][0][:200]}...")
                print(f"Metadata Tags: {results['metadatas'][0]}")

    except Exception as e:
        print(f"❌ Error reading database: {e}")

if __name__ == "__main__":
    verify_chroma_content()