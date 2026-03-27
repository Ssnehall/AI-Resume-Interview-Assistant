import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// ─── In-Memory Vector Store ───
// Each session gets its own store: { chunks: string[], embeddings: number[][] }
const vectorStores = {};

// ─── 1. Split text into chunks ───
export function splitTextIntoChunks(text, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }

  return chunks;
}

// ─── 2. Generate embedding for a single text ───
async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// ─── 3. Cosine similarity between two vectors ───
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ─── 4. Ingest resume: split + embed + store ───
export async function ingestResume(sessionId, resumeText) {
  const chunks = splitTextIntoChunks(resumeText);

  console.log(`📦 RAG: Splitting resume into ${chunks.length} chunks for session "${sessionId}"`);

  const embeddings = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    embeddings.push(embedding);
  }

  vectorStores[sessionId] = { chunks, embeddings };

  console.log(`✅ RAG: Ingested ${chunks.length} chunks with embeddings`);
  return chunks.length;
}

// ─── 5. Retrieve top-K relevant chunks for a query ───
export async function retrieveRelevantChunks(sessionId, query, topK = 3) {
  const store = vectorStores[sessionId];

  if (!store || store.chunks.length === 0) {
    return null; // No vector store — fallback to full resume
  }

  const queryEmbedding = await getEmbedding(query);

  // Score every chunk
  const scored = store.chunks.map((chunk, i) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, store.embeddings[i])
  }));

  // Sort by highest similarity and return top K
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK);

  console.log(`🔍 RAG: Retrieved ${topChunks.length} chunks (best score: ${topChunks[0]?.score.toFixed(3)})`);

  return topChunks.map(c => c.chunk).join('\n\n---\n\n');
}

// ─── 6. Check if a session has a vector store ───
export function hasVectorStore(sessionId) {
  return !!vectorStores[sessionId] && vectorStores[sessionId].chunks.length > 0;
}
