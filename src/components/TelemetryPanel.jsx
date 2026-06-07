import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getLogs } from '../services/api'
import { RefreshCw, Clock, Layers, Zap, Database } from 'lucide-react'

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
                  padding:'8px 12px', fontSize:'0.78rem', fontFamily:'var(--font-mono)' }}>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color }}>{p.name}: {typeof p.value==='number'?p.value.toFixed(2):p.value}</div>
      ))}
    </div>
  )
}

export default function TelemetryPanel() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await getLogs(100)
      console.log('Telemetry data:', r.data)
      setLogs(r.data.queries || [])
    } catch(e) {
      console.error('Telemetry error:', e)
      setError(e.response?.data?.error || 'Failed to load logs')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const latencyData = [...logs].reverse().slice(-20).map((q,i) => ({ i:i+1, latency:q.latency||0 }))
  const tokenData   = [...logs].reverse().slice(-10).map(q => ({
    q: (q.question||'').slice(0,14)+'...', tokens: q.tokensUsed||0
  }))

  return (
    <div style={{ padding:'28px 32px', height:'100%', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.3rem', letterSpacing:'-0.02em' }}>Telemetry</h2>
          <p style={{ color:'var(--text-3)', fontSize:'0.8rem', marginTop:3, fontFamily:'var(--font-mono)' }}>
            Every query logged to MongoDB · {logs.length} total
          </p>
        </div>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={load}
          style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
                   padding:8, cursor:'pointer', display:'flex' }}>
          <RefreshCw size={15} color="var(--text-2)"
            style={{ animation:loading?'spin 1s linear infinite':'none' }} />
        </motion.button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'rgba(224,90,90,0.1)', border:'1px solid var(--error)', borderRadius:10,
                      padding:'12px 16px', marginBottom:16, color:'var(--error)', fontSize:'0.85rem' }}>
          Error: {error}
        </div>
      )}

      {/* What is Telemetry */}
      <div style={{ background:'var(--amber-glow2)', border:'1px solid var(--amber-dim)', borderRadius:10,
                    padding:'12px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'flex-start' }}>
        <Database size={16} color="var(--amber)" style={{ flexShrink:0, marginTop:2 }} />
        <div style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.7 }}>
          <strong style={{ color:'var(--amber)' }}>What is Telemetry?</strong> — Logs every question you ask:
          how long it took, how many chunks were retrieved, and how many tokens were used.
          Ask questions in the <strong>Chat</strong> tab first, then come back here to see the logs.
        </div>
      </div>

      {/* Empty state */}
      {logs.length === 0 && !loading && !error && (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ fontSize:'2rem', marginBottom:12 }}>💬</div>
          <p style={{ color:'var(--text-2)', fontWeight:600, marginBottom:6 }}>No queries yet</p>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem' }}>
            Go to the <strong style={{ color:'var(--amber)' }}>Chat</strong> tab, upload a document and ask a question.
            <br/>Then come back here to see it logged.
          </p>
        </div>
      )}

      {/* Charts */}
      {logs.length > 1 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          {[
            { title:'RESPONSE TIME (s)', data:latencyData, key:'latency', type:'line', color:'var(--amber)' },
            { title:'TOKENS USED',       data:tokenData,   key:'tokens',  type:'bar',  color:'var(--info)'  },
          ].map(({ title, data, key, type, color }) => (
            <div key={title} style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:'0.7rem', color:'var(--text-3)', fontFamily:'var(--font-mono)',
                            marginBottom:12, letterSpacing:'0.06em' }}>{title}</div>
              <ResponsiveContainer width="100%" height={100}>
                {type==='line'
                  ? <LineChart data={data}><XAxis hide /><YAxis hide /><Tooltip content={<Tip />} />
                      <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} name={key} />
                    </LineChart>
                  : <BarChart data={data}><XAxis dataKey="q" hide /><YAxis hide /><Tooltip content={<Tip />} />
                      <Bar dataKey={key} fill={color} radius={[3,3,0,0]} name={key} />
                    </BarChart>}
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Log entries */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {logs.map((q, i) => (
          <motion.div key={q._id||i} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.03 }}
            style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <p style={{ fontSize:'0.88rem', fontWeight:600, flex:1, marginRight:16 }}>{q.question}</p>
              <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.68rem', fontFamily:'var(--font-mono)', color:'var(--amber)',
                               background:'var(--amber-glow)', padding:'2px 7px', borderRadius:4,
                               display:'flex', alignItems:'center', gap:3 }}>
                  <Clock size={10} />{q.latency}s
                </span>
                <span style={{ fontSize:'0.68rem', fontFamily:'var(--font-mono)', color:'var(--info)',
                               background:'rgba(90,154,224,0.1)', padding:'2px 7px', borderRadius:4,
                               display:'flex', alignItems:'center', gap:3 }}>
                  <Layers size={10} />{q.chunks?.length||0} chunks
                </span>
              </div>
            </div>
            <p style={{ fontSize:'0.78rem', color:'var(--text-3)', lineHeight:1.6 }}>
              {q.answer?.slice(0,160)}{q.answer?.length>160?'...':''}
            </p>
            <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:'var(--font-mono)', marginTop:8 }}>
              {new Date(q.createdAt).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
