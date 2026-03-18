   





import os
from openai import OpenAI
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()
# 1. Setup Gemini (Global Initialization)
API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize the new Client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# 2. Setup Vector DB
current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "marine_brain_new")

# Initialize Embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# We use the existing vector_db connection
vector_db = Chroma(
    persist_directory=DB_PATH, 
    embedding_function=embeddings, 
    collection_name="langchain"
)

def generate_scientific_report(metrics):
    """
    Generates a RAG-based scientific report using retrieved context.
    """
    if not metrics:
        return "No metrics provided for report generation."

    # Extract detailed metrics required by the Protocol
    dom_shape = metrics.get('dominant_shape', 'Unknown')
    dom_size = metrics.get('dominant_size_bin', 'Unknown')
    max_hp = metrics.get('max_Hp', 0.0) # Protocol primary metric [cite: 89]
    n_particles = metrics.get('n', 0) # Total count [cite: 75]
    crit_flag = metrics.get('critical_size_flag', False) # Size warning [cite: 79]
    shape_cont = metrics.get('shape_contribution_percent', 0.0) # Hazard driver [cite: 80]
    size_cont = metrics.get('size_contribution_percent', 0.0) # Hazard driver [cite: 81]

    query = f"Physical toxicity and ingestion risk of {dom_shape} and {dom_size} microplastics"
    
    try:
        # Search the database for relevant research chunks
        docs = vector_db.similarity_search(query, k=6)
        context = "\n\n".join([d.page_content for d in docs])
    except Exception as e:
        context = "Search failed. No supporting evidence found in provided documents."

    # 2. Updated Prompt based on MARINEINSIGHT REPORT PROTOCOL
    prompt = f"""
    You are "MarineInsight," an evidence-first AI ecotoxicologist. 
    Produce a comprehensive Human-Readable Report based STRICTLY on the RESEARCH CONTEXT provided.

    STRICT REPORTING RULES:
    - Use ONLY the provided RESEARCH CONTEXT. Cite scientific claims using bracketed numbers [1]. [cite: 58-60]
    - If evidence is missing, state: "No supporting evidence found in provided documents." [cite: 69]
    - Analysis must be technical and mechanistic. Do NOT use bullet points or filler. [cite: 137, 143, 145]
    - Each section (I-VI) must contain at least 2-3 developed paragraphs. [cite: 137]
    - The full report must exceed 1,200 words. [cite: 142]

    SAMPLE METRICS:
    - Total Particles (n): {n_particles}
    - Maximum Particle-Specific Hazard (Max Hp): {max_hp}
    - Dominant Morphology: {dom_shape}
    - Dominant Size Bin: {dom_size}
    - Critical Size Flag: {crit_flag}
    - Shape Contribution: {shape_cont}%
    - Size Contribution: {size_cont}%

    RESEARCH CONTEXT:
    {context}

    OUTPUT STRUCTURE:

    **I. EXECUTIVE HAZARD SUMMARY**
    Report the Max Hp and explain that it represents the "worst-case" physical hazard ($H_p = S_z + S_h$) for the sample. [cite: 89, 92] Discuss whether the hazard is primarily driven by morphological composition ({shape_cont}%) or size distribution ({size_cont}%). [cite: 97]

    **II. MORPHOLOGICAL TOXICITY**
    Analyze the ecological implications of {dom_shape} as the dominant morphology. [cite: 99] Contrast its physical stress potential against the pellet/sphere baseline. [cite: 100]

    **III. SIZE-CLASS & PHYSIOLOGICAL IMPLICATIONS**
    Evaluate the {dom_size} bin. If Critical_Size_Flag is TRUE ({crit_flag}), analyze systemic risks associated with particles in the 0.001-0.009 mm range. [cite: 104, 105]

    **IV. TROPHIC & FOOD WEB IMPLICATIONS**
    Assess ingestion likelihood and retention potential (e.g., entanglement of fibers) within the food web based on structural composition. [cite: 109-111]

    **V. HUMAN HEALTH & FISHERIES**
    Assess seafood exposure risks. Distinguish between gastrointestinal retention and the potential for systemic penetration through epithelial interaction. [cite: 116-119]

    **VI. DATA QUALITY & UNCERTAINTY**
    State the additive assumption ($H_p = S_z + S_h$) used in this model. [cite: 124] Provide an overall qualitative confidence rating (High/Medium/Low). [cite: 130]
    MANDATORY DISCLOSURE: "This hazard model evaluates physical dimensions only (size and morphology) and does not incorporate polymer chemistry or environmental contaminant load." [cite: 156]

    **VII. REFERENCES**
    Provide a full bibliographic list matching the bracketed citations used in the text. [cite: 131-133]
    """


    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",  # you can change model
            messages=[
                {"role": "user", "content": prompt}
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating report: {str(e)}"
