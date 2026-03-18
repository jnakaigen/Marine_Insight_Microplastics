# import os
# import django
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_chroma import Chroma

# # Set up Django
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
# django.setup()
# from django.conf import settings

# def refill():
#     DB_PATH = os.path.join(str(settings.BASE_DIR), "myapp", "marine_insight_db")
#     embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

#     # Sample Data (Since your PDFs are missing)
#     # You can add more paragraphs here from your research papers
#     scientific_data = [
#         "Microplastic films are thin, flat fragments often originating from plastic bags and packaging. They pose a significant threat to marine life through ingestion and chemical leaching.",
#         "Microplastic fibers are elongated synthetic particles typically shed from synthetic textiles. They are easily ingested by filter feeders and can cause physical blockage in digestive systems.",
#         "Pellets, also known as nurdles, are pre-production plastic granules. They are high-density pollutants that act as sponges for persistent organic pollutants (POPs) in the ocean.",
#         "Marine plastic debris undergoes weathering through UV radiation and mechanical stress, breaking down into secondary microplastics that enter the trophic chain."
#     ]
    
#     # Metalabels to help the search
#     metadatas = [{"source": "manual"}, {"source": "manual"}, {"source": "manual"}, {"source": "manual"}]
#     ids = ["id1", "id2", "id3", "id4"]

#     print("⏳ Injecting data into the brain...")
#     vector_db = Chroma.from_texts(
#         texts=scientific_data,
#         embedding=embeddings,
#         persist_directory=DB_PATH,
#         collection_name="langchain",
#         metadatas=metadatas,
#         ids=ids
#     )
    
#     print(f"🚀 SUCCESS! Brain now has {vector_db._collection.count()} documents.")

# if __name__ == "__main__":
#     refill()
# Copy and paste this into a new file called 'test_final_brain.py'
import os
import django
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

def test_search():
    DB_PATH = os.path.join(os.getcwd(), "myapp", "marine_insight_db")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vector_db = Chroma(
        persist_directory=DB_PATH, 
        embedding_function=embeddings, 
        collection_name="langchain"
    )
    
    query = "microplastic film"
    results = vector_db.similarity_search(query, k=1)
    
    print("\n🔍 TEST SEARCH FOR: 'microplastic film'")
    print("---------------------------------------")
    if results:
        print(f"FOUND IN BRAIN:\n{results[0].page_content[:500]}...")
    else:
        print("❌ Nothing found in brain.")

if __name__ == "__main__":
    test_search()