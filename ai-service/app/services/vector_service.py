import os
import uuid
from google.genai import Client, types
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

COLLECTION_NAME = "documents"
VECTOR_SIZE = 3072
EMBED_MODEL = "gemini-embedding-2-preview"

gemini_client = Client(api_key=os.getenv("GEMINI_API_KEY"))

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QUADRANT_API_KEY"),
)

def _ensure_payload_index():
    try:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="source",
            field_schema="keyword",
        )
    except Exception:
        pass  # index already exists


def _ensure_collection():
    existing = {c.name: c for c in client.get_collections().collections}
    if COLLECTION_NAME in existing:
        info = client.get_collection(COLLECTION_NAME)
        current_size = info.config.params.vectors.size
        if current_size != VECTOR_SIZE:
            client.delete_collection(COLLECTION_NAME)
        else:
            _ensure_payload_index()
            return
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    _ensure_payload_index()

_ensure_collection()


def _embed(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
    result = gemini_client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts,
        config=types.EmbedContentConfig(task_type=task_type),
    )
    return [e.values for e in result.embeddings]


def store_text_chunks(chunks: list, source: str):
    chunks = [c for c in chunks if c and c.strip()]
    if not chunks:
        return {"stored_chunks": 0}
    vectors = _embed(chunks)
    points = [
        PointStruct(
            id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{source}_{i}")),
            vector=vector,
            payload={"text": chunk, "source": source},
        )
        for i, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)
    return {"stored_chunks": len(chunks)}


def query_vector_db(query: str, n_results=3):
    query_vector = _embed([query], task_type="RETRIEVAL_QUERY")[0]
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=n_results,
        with_payload=True,
    )
    documents = [[r.payload.get("text", "") for r in results]]
    metadatas = [[r.payload for r in results]]
    return {"documents": documents, "metadatas": metadatas}


def get_chunks_by_source(source: str, limit=222):
    results, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=Filter(
            must=[FieldCondition(key="source", match=MatchValue(value=source))]
        ),
        limit=limit,
        with_payload=True,
    )
    documents = [r.payload.get("text", "") for r in results]
    metadatas = [r.payload for r in results]
    return {"documents": documents, "metadatas": metadatas}
