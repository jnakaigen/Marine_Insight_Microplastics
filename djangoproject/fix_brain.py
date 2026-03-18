import os
import django
import chromadb

# 1. Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings') # Change 'myproject' to your actual settings folder name
django.setup()

from django.conf import settings

def check_brain():
    # 2. Path to the unzipped folder
    DB_PATH = os.path.join(str(settings.BASE_DIR), "myapp", "marine_insight_db")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ folder not found at {DB_PATH}. Please move the 'marine_insight_db' folder there.")
        return

    # 3. Connect to the database
    client = chromadb.PersistentClient(path=DB_PATH)
    
    # 4. List collections
    collections = client.list_collections()
    print(f"📂 Collections found in the brain: {collections}")

    for coll in collections:
        collection = client.get_collection(coll.name)
        count = collection.count()
        print(f"  🔍 Collection Name: '{coll.name}' | Documents: {count}")
        
        if count > 0:
            print(f"  ✅ DATA DETECTED in '{coll.name}'!")
            # Peek at data
            sample = collection.peek(1)
            print(f"  📝 Sample Text: {sample['documents'][0][:100]}...")

if __name__ == "__main__":
    check_brain()