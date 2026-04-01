import os
import chromadb
from chromadb.utils import embedding_functions

# Initialize Chroma client
chroma_dir = os.path.join(os.path.dirname(__file__), "../chroma_db")
os.makedirs(chroma_dir, exist_ok=True)
client = chromadb.PersistentClient(path=chroma_dir)

# Embedding function (local, no API key needed)
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

# Create collection
collection = client.get_or_create_collection(
    name="documents",
    embedding_function=embedding_fn
)

def store_text_chunks(chunks: list, source: str):
    """Add chunks to Chroma local DB."""
    ids = [f"{source}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": source}] * len(chunks)
    collection.add(documents=chunks, metadatas=metadatas, ids=ids)
    return {"stored_chunks": len(chunks)}

def query_vector_db(query: str, n_results=3):
    """Query similar chunks from Chroma."""
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

def get_chunks_by_source(source: str , limit=222):
    """Get all chunks for a specific source file by metadata filter."""
    results = collection.get(
        where={"source": source},
        limit=limit
    )
    return results