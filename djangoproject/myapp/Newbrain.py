import os
import json
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

def generate_scientific_report(metrics, batch_id_string="auto-generated"):
    """
    Generates a RAG-based scientific report using retrieved context.
    """
    if not metrics:
        return "No metrics provided for report generation."
        
    print("\n--- DEBUG: METRICS DICTIONARY ---")
    for key, value in metrics.items():
        print(f"Key: '{key}' --> Value: {value}")
    print("---------------------------------\n")

    # Extract protocol-compliant metrics
    dom_shape = metrics.get('dominant_shape', 'Unknown')
    dom_size = metrics.get('dominant_size_bin', 'Unknown')
    max_hp = metrics.get('max_Hp', 0.0) 
    
    # NEW: Extract the worst-case particle traits
    worst_shape = metrics.get('max_hp_shape', 'Unknown')
    worst_size = metrics.get('max_hp_size_bin', 'Unknown')
    
    n_particles = metrics.get('n', 0) 
    crit_flag = metrics.get('critical_size_flag', False) 
    shape_cont = metrics.get('shape_contribution_percent', 0.0) 
    size_cont = metrics.get('size_contribution_percent', 0.0) 
    assumptions_str = json.dumps(metrics.get('assumptions', []))

    query = f"Physical toxicity and ingestion risk of {dom_shape}, {worst_shape}, {dom_size}, and {worst_size} microplastics"
    
    try:
        docs = vector_db.similarity_search(query, k=6)
        context_parts = []
        for i, d in enumerate(docs):
            source = d.metadata.get('source', 'Unknown Source') 
            context_parts.append(f"[Source: {source}]\n{d.page_content}")
        context = "\n\n".join(context_parts)
    except Exception as e:
        context = "Search failed. No supporting evidence found in provided documents."

    # UPDATED PROMPT: Enforcing worst-case particle focus and side effects.
    prompt = f"""
    You are "MarineInsight," an evidence-first AI ecotoxicologist. 
    You must produce TWO outputs in order based STRICTLY on the RESEARCH CONTEXT provided.

    STRICT REPORTING FORMAT RULES:
    - NO FLUFF: Be extremely concise, direct, and highly technical.
    - POINT-WISE FORMAT: Write all explanations as numbered points. Do NOT write long paragraphs.
    - NO ASTERISKS: Do NOT use markdown asterisks (**) or underscores (_) for bolding or italics anywhere in the report. Use plain capitalization for headings.
    - NO RAW MATH DELIMITERS: Do NOT use LaTeX delimiters like \( or \). Write equations cleanly in plain text, like (Hp = Sz + Sh).
    - WORST-CASE PARTICLE FOCUS: You must explicitly mention the specific ecological side effects of the worst-case particle ({worst_size} {worst_shape}) throughout Sections II, III, and IV, alongside the dominant sample traits.
    - Use ONLY the provided RESEARCH CONTEXT. Cite scientific claims using bracketed numbers [1]. 

    SAMPLE METRICS:
    - Total Particles (n): {n_particles}
    - Dominant Morphology: {dom_shape}
    - Dominant Size Bin: {dom_size}
    - Worst-Case Particle (Max Hp): {max_hp} (Identity: {worst_size} {worst_shape})
    - Critical Size Flag: {crit_flag}
    - Shape Contribution (for Max Hp): {shape_cont}%
    - Size Contribution (for Max Hp): {size_cont}%
    - Assumptions Log: {assumptions_str}

    RESEARCH CONTEXT:
    {context}

    OUTPUT STRUCTURE:

    A) MACHINE-READABLE JSON
    Generate a JSON block matching this exact schema first:
    {{
    "sample_id": "{batch_id_string}",
    "n": {n_particles},
    "max_Hp": {max_hp},
    "dominant_shape": "{dom_shape}",
    "dominant_size_bin": "{dom_size}",
    "critical_size_flag": {str(crit_flag).lower()},
    "shape_contribution_percent": {shape_cont},
    "size_contribution_percent": {size_cont},
    "assumptions": {assumptions_str},
    "confidence_overall": "[Output only 'High', 'Medium', or 'Low' based on evidence strength]",
    }}

    B) HUMAN-READABLE REPORT (Follow the point-wise, no-asterisk rules strictly)
    
    SECTION I: EXECUTIVE HAZARD SUMMARY
    1. Report the Max Hp ({max_hp}) and explicitly state that this worst-case physical hazard (Hp = Sz + Sh) belongs to a specific particle: a {worst_size} {worst_shape}.
    2. Explicitly state that the sample's overall dominant shape is {dom_shape} and dominant size is {dom_size}.
    3. State whether the hazard of the worst particle is driven more by shape or size based on the percentages.
    4. Note how frequency of the dominant traits vs. severity of the worst-case particle elevates the overall aggregated risk.

    SECTION II: MORPHOLOGICAL TOXICITY
    1. Detail the specific ecological physical stress of the dominant {dom_shape} morphology.
    2. Detail the specific ecological side effects of the worst-case {worst_shape} morphology (e.g., entanglement, blockages).
    3. Contrast these stress potentials directly against the pellet/sphere baseline.

    SECTION III: SIZE-CLASS AND PHYSIOLOGICAL IMPLICATIONS
    1. Evaluate the risks associated with the dominant {dom_size} bin.
    2. Discuss the specific physiological side effects of the worst-case {worst_size} particle.
    3. Note that Critical_Size_Flag is {crit_flag}. If true, note systemic risks of 0.001-0.009 mm. If false, state systemic risks are not indicated.

    SECTION IV: TROPHIC AND FOOD WEB IMPLICATIONS
    1. Assess ingestion likelihood based on the dominant size distribution.
    2. Explain retention potential based on the structural composition, specifically noting the side effects of the worst-case {worst_shape}.
    3. If the Trojan Horse mechanism is explicitly supported by PDFs, explain it relates only to chemical transport and is excluded from this physical score.

    SECTION V: HUMAN HEALTH AND FISHERIES
    1. Assess seafood exposure risks and distinguish between GI retention vs. systemic penetration.
    2. Do not imply systemic toxicity unless explicitly stated in PDFs.

    SECTION VI: DATA QUALITY AND UNCERTAINTY
    1. State the additive assumption used: Hp = Sz + Sh.
    2. Declare sensitivity to size/shape misclassification.
    3. State overall confidence rating (High/Medium/Low).
    4. Mandatory Disclosure: This hazard model evaluates physical dimensions only (size and morphology) and does not incorporate polymer chemistry or environmental contaminant load.

    SECTION VII: REFERENCES
    Provide the full bibliographic details (Author, Year, Title, Journal) for every bracketed citation used in the text. Do not just list the numbers.
    """

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini", 
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating report: {str(e)}"