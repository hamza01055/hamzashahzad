import { Fragment, memo, useEffect, useRef, useState } from 'react'
import { getProjects, getSettings, getTeam } from '../data/store'
import { localAnswer } from '../chat/localAnswers'

const STORAGE_KEY = 'hs-chat'
const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: 'Hi! I’m Hamza’s AI portfolio assistant. I can help you explore his work, find a suitable service, or discuss your project. What would you like to build?',
}
let idCounter = 0
const makeId = (prefix) => `${prefix}${Date.now()}-${idCounter++}`
const SUGGESTIONS = ['Explore services', 'See relevant projects', 'Discuss my project', 'Contact Hamza']

const loadSaved = () => {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && Array.isArray(saved.messages)) return saved
  } catch {
    // ignore storage errors
  }
  return null
}

const save = (state) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

// Turns URLs, site paths, and emails in plain text into links.
const LINK_PATTERN = /(https?:\/\/[^\s)]+[^\s).,!?]|\/(?:work\/[a-z0-9-]+|work|services|about|team|#contact|Hamza-Shahzad-AI-Engineer-Resume\.pdf)(?=[\s).,!?]|$)|[\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi
const Linkified = ({ text }) => {
  const parts = text.replace(/\*\*(.+?)\*\*/g, '$1').split(LINK_PATTERN)
  return parts.map((part, index) => {
    if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>
    const isEmail = part.includes('@') && !part.startsWith('http')
    const href = isEmail ? `mailto:${part}` : part
    const external = part.startsWith('http')
    return (
      <a key={index} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="font-semibold text-[#a36a0b] underline decoration-[#F2B56B]/50 underline-offset-2 hover:decoration-[#F2B56B] break-words">
        {part}
      </a>
    )
  })
}

// Animated robot mascot. Animations live in index.css (.robot-*): the head bobs,
// the eyes blink, and the antenna glows. With `thinking`, the eyes look around
// and the antenna blinks faster. All motion stops for reduced-motion users.
const RobotIcon = ({ size = 34, thinking = false, bob = true }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={`robot ${bob ? 'robot--bob' : ''} ${thinking ? 'robot--thinking' : ''}`}>
    <g className="robot-head">
      <line x1="24" y1="7" x2="24" y2="13" stroke="#F5F4F0" strokeWidth="2.2" strokeLinecap="round" />
      <circle className="robot-antenna" cx="24" cy="5.5" r="3.2" fill="#F2B56B" />
      <rect x="5" y="21" width="4.5" height="10" rx="2.25" fill="#F5F4F0" />
      <rect x="38.5" y="21" width="4.5" height="10" rx="2.25" fill="#F5F4F0" />
      <rect x="9" y="12.5" width="30" height="26" rx="9" fill="#F5F4F0" />
      <rect x="13" y="18" width="22" height="13" rx="6.5" fill="#1a1a1a" />
      <g className="robot-eyes">
        <rect className="robot-eye" x="17.5" y="21.5" width="4" height="6" rx="2" fill="#F2B56B" />
        <rect className="robot-eye" x="26.5" y="21.5" width="4" height="6" rx="2" fill="#F2B56B" />
      </g>
      <path d="M20 34 q4 2.6 8 0" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
)
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
)

async function askAI(history, onText, signal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history }),
    signal,
  })
  // Static hosts may answer with the site's index.html; only trust our own endpoint.
  if (response.headers.get('X-Chat-Api') !== '1') return { ok: false, unavailable: true }
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}))
    return { ok: false, unavailable: data.error === 'not_configured', message: data.message }
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    onText(decoder.decode(value, { stream: true }))
  }
  return { ok: true }
}

function Chatbot() {
  const [saved] = useState(loadSaved)
  const [open, setOpen] = useState(saved?.open ?? false)
  const [messages, setMessages] = useState(saved?.messages?.length ? saved.messages : [GREETING])
  const [mode, setMode] = useState(saved?.mode || 'ai') // 'ai' or 'local'
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!busy) save({ open, messages, mode })
  }, [open, messages, mode, busy])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => () => abortRef.current?.abort(), [])

  const update = (id, change) => setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...change(m) } : m)))

  const send = async (text) => {
    const question = text.trim().slice(0, 1000)
    if (!question || busy) return
    setInput('')
    const userMessage = { id: makeId('u'), role: 'user', content: question }
    const replyId = makeId('a')
    const next = [...messages, userMessage]
    setMessages([...next, { id: replyId, role: 'assistant', content: '', pending: true }])
    setBusy(true)

    const answerLocally = () => {
      const answer = localAnswer(question, { projects: getProjects(), team: getTeam(), settings: getSettings() })
      update(replyId, () => ({ content: answer, pending: false }))
    }

    if (mode === 'local') {
      answerLocally()
      setBusy(false)
      return
    }

    const history = next
      .filter((m) => m.id !== GREETING.id && !m.excluded && m.content)
      .map(({ role, content }) => ({ role, content }))
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const result = await askAI(history, (chunk) => update(replyId, (m) => ({ content: m.content + chunk, pending: false })), controller.signal)
      if (!result.ok) {
        if (result.message) {
          update(replyId, () => ({ content: result.message, pending: false, excluded: true }))
        } else {
          // No AI endpoint on this host (or no API key): switch to offline answers.
          setMode('local')
          answerLocally()
        }
      } else {
        update(replyId, (m) => ({ pending: false, content: m.content || 'Sorry, something went wrong. Please try again.' }))
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      setMode('local')
      answerLocally()
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setBusy(false)
    setMode('ai')
    setMessages([GREETING])
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(input)
    }
  }

  const showSuggestions = messages.length === 1

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-label="Chat with Hamza's portfolio assistant"
          onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}
          className="flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-[#e7e3dc] bg-[#F5F4F0] shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 bg-[#1a1a1a] px-5 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <RobotIcon size={34} thinking={busy} bob={false} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">Ask about Hamza&apos;s work</p>
              <p className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F2B56B]" />
                {busy ? 'Thinking...' : mode === 'ai' ? 'AI assistant' : 'Quick answers'}
              </p>
            </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"><span className="text-xs">New chat</span></button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"><CloseIcon /></button>
            </div>
          </header>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-md bg-[#1a1a1a] text-white' : 'rounded-bl-md border border-[#e7e3dc] bg-white text-[#374151]'}`}>
                  {m.pending ? (
                    <span className="flex gap-1 py-1" aria-label="Assistant is typing">
                      {[0, 150, 300].map((delay) => <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#F2B56B]" style={{ animationDelay: `${delay}ms` }} />)}
                    </span>
                  ) : m.role === 'assistant' ? <Linkified text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-[#eedbb5] bg-[#FDF5EB] px-3 py-1.5 text-xs font-semibold text-[#a36a0b] hover:border-[#F2B56B]"><span className="text-xs">{s}</span></button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); send(input) }} className="flex items-end gap-2 border-t border-[#e7e3dc] bg-white p-3">
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1000}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question..."
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl bg-[#F5F4F0] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F2B56B]"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2B56B] text-[#1a1a1a] transition hover:brightness-95 disabled:opacity-40">
              <SendIcon />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        aria-expanded={open}
        className="chat-launcher relative flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-xl ring-4 ring-[#F2B56B]/30 transition hover:scale-105 hover:bg-black"
      >
        {!open && messages.length === 1 && <span aria-hidden="true" className="robot-ring pointer-events-none absolute inset-0 rounded-full border-2 border-[#F2B56B]" />}
        {open ? <CloseIcon /> : <RobotIcon size={48} thinking={busy} />}
      </button>
    </div>
  )
}

export default memo(Chatbot)
