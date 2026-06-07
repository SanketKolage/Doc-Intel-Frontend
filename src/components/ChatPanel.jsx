import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Send, Bot, User, Clock, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import ChunkCard from './ChunkCard'
import { queryRAG } from '../services/api'

const Dots = () => (
  <div style={{ display:'flex', gap:5, padding:'4px 0' }}>
    {[0,1,2].map(i => (
      <motion.div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--amber)' }}
        animate={{ y:[0,-6,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }} />
    ))}
  </div>
)

const SUGGESTIONS = [
  'What are the key concepts in this document?',
  'Summarize the main findings.',
  'Explain the methodology used.',
]

// messages and setMessages come from App.jsx — survive tab switches
export default function ChatPanel({ messages, setMessages, onStatsRefresh }) {
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [expanded, setExpanded] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role:'user', content:q }])
    setLoading(true)
    try {
      const r = await queryRAG(q)
      setMessages(m => [...m, {
        role:'assistant', content:r.data.answer,
        chunks:r.data.chunks, latency:r.data.latency
      }])
      onStatsRefresh?.()
    } catch (e) {
      const msg = e.response?.data?.error || 'Something went wrong.'
      toast.error(msg)
      setMessages(m => [...m, { role:'assistant', content:`Error: ${msg}`, chunks:[], latency:0 }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg-0)' }}>

      {/* Header */}
      <div style={{ padding:'18px 28px', borderBottom:'1px solid var(--border)',
                    display:'flex', alignItems:'center', gap:12, background:'var(--bg-1)' }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'var(--amber-glow)',
                      border:'1px solid var(--amber-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Bot size={16} color="var(--amber)" />
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:'0.95rem' }}>DocuMind AI — Chat</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
            Hybrid RAG · Ollama · MongoDB logs · Chat persists across tabs
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={() => { setMessages([]); setExpanded(null) }}
            style={{ marginLeft:'auto', background:'var(--bg-3)', border:'1px solid var(--border)',
                     borderRadius:6, padding:'4px 10px', fontSize:'0.75rem', color:'var(--text-3)',
                     cursor:'pointer', fontFamily:'var(--font-mono)' }}>
            Clear chat
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
        {messages.length === 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                     justifyContent:'center', gap:16, textAlign:'center', paddingTop:60 }}>
            <div style={{ width:64, height:64, borderRadius:20, background:'var(--amber-glow)',
                          border:'1px solid var(--amber-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={28} color="var(--amber)" />
            </div>
            <div>
              <div style={{ fontSize:'1.2rem', fontWeight:700, marginBottom:6 }}>Ask anything</div>
              <div style={{ color:'var(--text-3)', fontSize:'0.85rem', maxWidth:340, lineHeight:1.7 }}>
                Upload a document first, then ask questions about it.
              </div>
            </div>
            {SUGGESTIONS.map(s => (
              <motion.button key={s} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                onClick={() => setInput(s)}
                style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
                         padding:'8px 16px', color:'var(--text-2)', fontSize:'0.82rem',
                         cursor:'pointer', fontFamily:'var(--font-display)' }}>{s}
              </motion.button>
            ))}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.3 }}
              style={{ display:'flex', flexDirection:'column',
                       alignItems:m.role==='user'?'flex-end':'flex-start', gap:8 }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', maxWidth:'80%',
                            flexDirection:m.role==='user'?'row-reverse':'row' }}>
                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, marginTop:2,
                              background:m.role==='user'?'var(--amber)':'var(--bg-3)',
                              display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {m.role==='user' ? <User size={14} color="#0a0a0b" /> : <Bot size={14} color="var(--amber)" />}
                </div>
                <div style={{ background:m.role==='user'?'var(--amber-glow)':'var(--bg-2)',
                              border:`1px solid ${m.role==='user'?'var(--amber-dim)':'var(--border)'}`,
                              borderRadius:12, padding:'12px 16px', maxWidth:'100%' }}>
                  {m.role==='user'
                    ? <p style={{ color:'var(--text-1)', fontSize:'0.9rem' }}>{m.content}</p>
                    : <div className="prose"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
                </div>
              </div>

              {m.role==='assistant' && m.chunks?.length > 0 && (
                <div style={{ maxWidth:'80%', paddingLeft:38, width:'100%' }}>
                  <button onClick={() => setExpanded(expanded===i ? null : i)}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
                             cursor:'pointer', color:'var(--text-3)', fontSize:'0.75rem',
                             fontFamily:'var(--font-mono)', marginBottom:8, padding:0 }}>
                    <Layers size={12} />{m.chunks.length} chunks retrieved
                    {m.latency && <><Clock size={12} style={{ marginLeft:8 }} />{m.latency}s</>}
                    <span style={{ marginLeft:4 }}>{expanded===i?'▲':'▼'}</span>
                  </button>
                  <AnimatePresence>
                    {expanded===i && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                        exit={{ opacity:0, height:0 }}
                        style={{ display:'flex', flexDirection:'column', gap:6, overflow:'hidden' }}>
                        {m.chunks.map((c, j) => <ChunkCard key={j} chunk={c} index={j} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'var(--bg-3)',
                          display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}>
              <Bot size={14} color="var(--amber)" />
            </div>
            <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 16px' }}>
              <Dots />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'16px 28px', borderTop:'1px solid var(--border)', background:'var(--bg-1)' }}>
        <div style={{ display:'flex', gap:10, background:'var(--bg-2)', border:'1px solid var(--border)',
                      borderRadius:12, padding:'8px 8px 8px 16px' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Ask a question about your documents..."
            style={{ flex:1, background:'none', border:'none', outline:'none',
                     color:'var(--text-1)', fontFamily:'var(--font-display)', fontSize:'0.9rem' }} />
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={send}
            disabled={!input.trim() || loading}
            style={{ width:36, height:36, borderRadius:8, border:'none', cursor:'pointer',
                     background:input.trim()&&!loading?'var(--amber)':'var(--bg-3)',
                     display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
            <Send size={15} color={input.trim()&&!loading?'#0a0a0b':'var(--text-3)'} strokeWidth={2.2} />
          </motion.button>
        </div>
        <p style={{ fontSize:'0.68rem', color:'var(--text-3)', textAlign:'center', marginTop:8, fontFamily:'var(--font-mono)' }}>
          Enter to send · Chat history saved while app is open
        </p>
      </div>
    </div>
  )
}
