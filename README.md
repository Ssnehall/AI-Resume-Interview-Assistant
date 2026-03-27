<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

# 🎯 AI Resume + Interview Assistant

An AI-powered full-stack application that analyzes your resume and helps you ace job interviews — with personalized question generation, answer evaluation, and real-time AI coaching.

> Built with **Node.js**, **LangChain**, **Google Gemini AI**, and **React**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **PDF Resume Upload** | Drag & drop your resume — text is extracted automatically |
| ❓ **Smart Question Generation** | AI generates 8 targeted interview questions from your resume |
| 📊 **Answer Evaluation** | Get scored (out of 10) with strengths, weaknesses & a model answer |
| ✨ **Answer Improvement** | AI rewrites your answers using the STAR method |
| 🤖 **Agentic System** | LangChain agent with 3 tools — decides which action to take based on your message |
| 🧠 **RAG Pipeline** | Resume is chunked → embedded → stored as vectors. Only relevant sections are retrieved per query |
| 💬 **Conversation Memory** | Session-based chat history simulates a real interview |
| 🌙 **Premium Dark UI** | Modern glassmorphism design with animations, Markdown rendering & responsive layout |

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **LangChain v1.x** | AI chains, tools, and agent framework |
| **Google Gemini Flash** | LLM for question generation, evaluation & coaching |
| **Gemini text-embedding-004** | Vector embeddings for RAG |
| **Multer** | PDF file upload handling |
| **pdf-parse** | Extract text from PDF resumes |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Dev server & build tool |
| **react-markdown** | Render AI responses with rich formatting |
| **remark-gfm** | GitHub-Flavored Markdown support |

### AI / ML Concepts Used
- 🔗 **Prompt Chaining** — Sequential prompt templates for different tasks
- 🛠️ **Tool Calling** — Agent dynamically selects which tool to invoke
- 🧠 **RAG (Retrieval Augmented Generation)** — Embed → Store → Retrieve relevant context
- 📐 **Cosine Similarity** — Custom vector search for chunk retrieval
- 💾 **Session Memory** — Maintains conversation context across turns

---

## 📁 Project Structure

```
AI-Resume-Interview-Assistant/
│
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── interviewAgent.js    # LangChain agent with tool calling + memory
│   │   ├── chains/
│   │   │   └── resumeChains.js      # Prompt templates for questions, eval, improve
│   │   ├── tools/
│   │   │   └── interviewTools.js    # 3 tools: generate, evaluate, improve
│   │   ├── rag/
│   │   │   └── vectorStore.js       # Text chunking, embeddings, cosine similarity
│   │   ├── routes/
│   │   │   ├── upload.js            # POST /api/upload (PDF parse + RAG ingest)
│   │   │   ├── questions.js         # POST /api/generate-questions
│   │   │   ├── evaluate.js          # POST /api/evaluate-answer + improve-answer
│   │   │   └── agent.js             # POST /api/chat (main agent endpoint)
│   │   ├── middleware/
│   │   │   └── upload.middleware.js  # Multer config (PDF only, 5MB max)
│   │   └── index.js                 # Express server entry point
│   ├── uploads/                     # Uploaded PDF files (git-ignored)
│   ├── .env                         # API keys (git-ignored)
│   └── .env.example                 # Template for environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main UI: upload, chat, quick actions
│   │   └── index.css                # Dark theme design system
│   ├── .env.example                 # Frontend env template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ installed
- **Gemini API Key** — Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/app/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/Ssnehall/AI-Resume-Interview-Assistant.git
cd AI-Resume-Interview-Assistant
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=5001
```
Then install and start:
```bash
npm install
npm run dev
```
✅ Backend runs on `http://localhost:5001`

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

### 4. Use the App
1. Open `http://localhost:5173` in your browser
2. Upload your resume PDF (drag & drop or click)
3. Click **"Generate Interview Questions"** or start chatting!

---

## 📡 API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/` | — | Health check |
| `POST` | `/api/upload` | `FormData: resume (PDF)` | Upload & parse resume + RAG ingest |
| `POST` | `/api/generate-questions` | `{ resumeText }` | Generate 8 interview questions |
| `POST` | `/api/evaluate-answer` | `{ question, answer, resumeText }` | Evaluate an answer (score + feedback) |
| `POST` | `/api/improve-answer` | `{ question, answer, resumeText }` | Rewrite answer professionally |
| `POST` | `/api/chat` | `{ message, resumeText, sessionId }` | Agent chat (auto-selects tool) |

---

## 🌐 Deployment

### Backend → Render
1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** → `backend`
4. **Build Command** → `npm install`
5. **Start Command** → `npm start`
6. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel frontend URL

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. **Framework Preset** → Vite
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

---

## 🧠 How RAG Works in This Project

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Upload PDF │────▶│  Parse Text  │────▶│  Split into     │
│             │     │  (pdf-parse) │     │  Chunks (500ch) │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │ Generate Vector  │
                                         │ Embeddings       │
                                         │ (Gemini API)     │
                                         └────────┬────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │  Store in Memory │
                                         │  Vector Store    │
                                         └────────┬────────┘
                                                   │
       ┌───────────────┐                           │
       │  User Question │──▶ Embed Query ──▶ Cosine Similarity
       └───────────────┘                           │
                                                   ▼
                                         ┌─────────────────┐
                                         │ Return Top 3    │
                                         │ Relevant Chunks │──▶ Send to Gemini AI
                                         └─────────────────┘
```

---

## 🎓 How to Explain in an Interview

> *"I built an AI-powered Interview Coach using Node.js, LangChain, and Google Gemini. Users upload their resume as a PDF, which gets parsed and ingested into a custom RAG pipeline — the text is split into chunks, embedded using Gemini's embedding model, and stored in an in-memory vector store. When the user interacts, a LangChain agent with three tools (generate questions, evaluate answers, improve answers) decides the best action. The agent uses cosine similarity to retrieve only the most relevant resume sections, reducing token usage and improving response quality. The frontend is a React chat interface with Markdown rendering and session-based memory."*

---

## 📄 License

MIT © 2026 — Built by [Ssnehall](https://github.com/Ssnehall)
