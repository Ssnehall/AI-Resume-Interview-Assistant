import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './index.css'

const API_BASE = 'http://localhost:5001/api'
const SESSION_ID = `session_${Date.now()}`

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg }) {
  return (
    <div className={`message ${msg.role}`}>
      <div className="message-avatar">
        {msg.role === 'assistant' ? '🤖' : '👤'}
      </div>
      <div>
        <div className="message-bubble">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>
        <div className="message-time">{formatTime(msg.time)}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadState, setUploadState] = useState('idle') // idle | loading | success | error
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // ─── Upload PDF ───
  async function handleUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.')
      return
    }
    setError('')
    setUploadState('loading')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setResumeText(data.resumeText)
      setResumeFile(file.name)
      setUploadState('success')

      // Add welcome message
      addMessage('assistant', `✅ Resume uploaded! I've parsed **${file.name}** (${data.textLength} characters).\n\nI'm ready to help you prepare for interviews! You can:\n• Ask me to **generate interview questions**\n• Give me a question and answer to **evaluate**\n• Ask me to **improve any answer**\n\nWhat would you like to do first?`)
    } catch (err) {
      setUploadState('error')
      setError(err.message)
    }
  }

  // ─── Quick Actions ───
  async function quickAction(prompt) {
    if (!resumeText) {
      setError('Please upload your resume first!')
      return
    }
    setInput(prompt)
    await sendMessage(prompt)
  }

  // ─── Add Message ───
  function addMessage(role, content) {
    setMessages(prev => [...prev, { role, content, time: new Date() }])
  }

  // ─── Send Message ───
  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || isLoading) return

    setInput('')
    setError('')
    addMessage('user', msg)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, resumeText, sessionId: SESSION_ID })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      addMessage('assistant', data.response)
    } catch (err) {
      setError(err.message)
      addMessage('assistant', '❌ Sorry, I ran into an error. Please try again or check if the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-logo">🎯</div>
        <div>
          <div className="header-title">AI Resume + Interview Assistant</div>
          <div className="header-subtitle">Powered by Gemini AI + LangChain</div>
        </div>
        <div className="header-status">
          <div className="status-dot" />
          AI Ready
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Upload Section */}
          <div>
            <div className="sidebar-section-title">📄 Resume</div>
            {uploadState === 'idle' || uploadState === 'error' ? (
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]) }}
              >
                <input type="file" accept=".pdf" onChange={e => handleUpload(e.target.files[0])} />
                <div className="upload-icon">📋</div>
                <h3>Upload Resume PDF</h3>
                <p>Drag & drop or click to browse<br />PDF only · Max 5MB</p>
              </div>
            ) : uploadState === 'loading' ? (
              <div className="upload-loading">
                <div className="spinner" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Parsing resume...</span>
              </div>
            ) : (
              <div className="upload-success">
                <div className="upload-success-header">✅ Resume Loaded</div>
                <div className="upload-success-info">
                  📁 {resumeFile}<br />
                  {resumeText.length} characters extracted
                </div>
                <button className="upload-again-btn" onClick={() => { setUploadState('idle'); setResumeText(''); setResumeFile(null) }}>
                  Upload different file
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="sidebar-section-title">⚡ Quick Actions</div>
            <div className="quick-actions">
              {[
                { icon: '❓', label: 'Generate Interview Questions', prompt: 'Generate interview questions based on my resume' },
                { icon: '📊', label: 'Evaluate My Answer', prompt: 'I want to practice. Ask me a question from my resume, then evaluate my answer.' },
                { icon: '✨', label: 'Improve an Answer', prompt: 'Help me improve my answer to a question' },
                { icon: '💼', label: 'Common HR Questions', prompt: 'What common HR questions should I prepare for based on my resume?' },
                { icon: '🚀', label: 'Mock Interview', prompt: 'Start a mock interview with me. Ask questions one by one.' },
              ].map((a, i) => (
                <button key={i} className="quick-btn" disabled={!resumeText} onClick={() => quickAction(a.prompt)}>
                  <span className="quick-btn-icon">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="sidebar-section-title">💡 Tips</div>
            <div className="tips-list">
              {[
                'Upload your resume first to get personalized questions',
                'Use STAR method: Situation, Task, Action, Result',
                'Ask the AI to evaluate your practice answers',
              ].map((tip, i) => (
                <div key={i} className="tip-item">{tip}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🎯</div>
              <div className="welcome-title">Your AI Interview Coach</div>
              <div className="welcome-subtitle">
                Upload your resume and I'll generate personalized interview questions, evaluate your answers, and help you ace your next interview.
              </div>
              <div className="welcome-features">
                {[
                  { icon: '📝', title: 'Question Gen', desc: 'Tailored to your resume' },
                  { icon: '📊', title: 'Answer Eval', desc: 'Score + detailed feedback' },
                  { icon: '✨', title: 'AI Coaching', desc: 'Improve any answer' },
                ].map((f, i) => (
                  <div key={i} className="feature-card">
                    <div className="feature-card-icon">{f.icon}</div>
                    <div className="feature-card-title">{f.title}</div>
                    <div className="feature-card-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="message-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                  <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {error && <div className="error-banner">⚠️ {error}</div>}

          <div className="chat-input-area">
            <div className="chat-input-wrap">
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder={resumeText ? "Ask about interview prep, practice answers, tips..." : "Upload your resume first, then start chatting..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || isLoading}>
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
            <div className="chat-hint">Press Enter to send · Shift+Enter for new line</div>
          </div>
        </main>
      </div>
    </div>
  )
}
