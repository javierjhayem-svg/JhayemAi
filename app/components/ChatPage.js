'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './ChatPage.module.css'

const SUGGESTIONS = [
  'What can you do?',
  'Explain AI in simple terms',
  'Write me a short poem',
  'Help me with coding',
]

export default function ChatPage({ user, onAbout, onLogout }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${user}! 👋 I'm JhayemAI — your personal assistant. Ask me anything!`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')
    setMenuOpen(false)

    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || data.error || 'Something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Chat cleared! What's on your mind, ${user}?` }])
    setMenuOpen(false)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerAvatar}>
            <img src="/jhayem.jpg" alt="JhayemAI" className={styles.headerImg} />
            <span className={styles.headerDot} />
          </div>
          <div>
            <div className={styles.headerTitle}>JhayemAI</div>
            <div className={styles.headerSub}>
              {loading ? <><span className={styles.typingDot}/><span className={styles.typingDot}/><span className={styles.typingDot}/> thinking...</> : 'Online'}
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
        {menuOpen && (
          <div className={styles.dropdown}>
            <button className={styles.dropItem} onClick={onAbout}>
              <InfoIcon /> About
            </button>
            <button className={styles.dropItem} onClick={clearChat}>
              <TrashIcon /> Clear chat
            </button>
            <div className={styles.dropDivider} />
            <button className={`${styles.dropItem} ${styles.dropDanger}`} onClick={onLogout}>
              <LogoutIcon /> Sign out
            </button>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className={styles.messages} onClick={() => setMenuOpen(false)}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAI}`}>
            {m.role === 'assistant' && (
              <div className={styles.aiIcon}>✦</div>
            )}
            <div className={`${styles.bubbleContent} ${m.role === 'user' ? styles.userContent : styles.aiContent}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className={styles.bubble + ' ' + styles.bubbleAI}>
            <div className={styles.aiIcon}>✦</div>
            <div className={styles.aiContent + ' ' + styles.bubbleContent}>
              <div className={styles.dots}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only on empty state) */}
      {messages.length === 1 && (
        <div className={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className={styles.suggestion} onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputRow}>
        <div className={styles.inputWrap}>
          <textarea
            ref={inputRef}
            className={styles.textarea}
            placeholder="Message JhayemAI..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            maxLength={2000}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="4" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="16" r="1.5" fill="currentColor"/></svg>
}
function SendIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9l14-7-5 7 5 7-14-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
}
function TrashIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3H3a1 1 0 00-1 1v8a1 1 0 001 1h7M11 5l3 3-3 3M6 8h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
