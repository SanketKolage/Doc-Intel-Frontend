import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Play, CheckCircle, FlaskConical } from 'lucide-react'
import { runEval } from '../services/api'
import toast from 'react-hot-toast'

const ScoreBadge = ({ label, value, color }) => (
  <div style={{ textAlign:'center' }}>
    <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
      transition={{ type:'spring', stiffness:300, delay:0.1 }}
      style={{ fontSize:'1.6rem', fontWeight:800, color, fontFamily:'var(--font-mono)' }}>
      {Math.round((value||0)*100)}<span style={{ fontSize:'0.9rem' }}>%</span>
    </motion.div>
    <div style={{ fontSize:'0.68rem', color:'var(--text-3)', textTransform:'uppercase',
                  letterSpacing:'0.06em', marginTop:2 }}>{label}</div>
  </div>
)

export default function EvalPanel() {
  const [pairs, setPairs]     = useState([{ question:'', ground_truth:'' }])
  const [result, setResult]   = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError]     = useState(null)

  const run = async () => {
    const valid = pairs.filter(p => p.question.trim())
    setRunning(true)
    setError(null)
    try {
      const r = await runEval(valid.length ? valid : [])
      console.log('Eval result:', r.data)
      setResult(r.data)
      toast.success('Evaluation complete!')
    } catch(e) {
      console.error('Eval error:', e)
      const msg = e.response?.data?.error || 'Eval failed. Make sure you uploaded a document first.'
      setError(msg)
      toast.error(msg)
    }
    setRunning(false)
  }

  return (
    <div style={{ padding:'28px 32px', height:'100%', overflowY:'auto', maxWidth:760, margin:'0 auto', width:'100%' }}>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontWeight:800, fontSize:'1.3rem', letterSpacing:'-0.02em' }}>Eval Harness</h2>
      </div>

      {/* What is Eval */}
      <div style={{ background:'var(--amber-glow2)', border:'1px solid var(--amber-dim)', borderRadius:10,
                    padding:'12px 16px', marginBottom:24, display:'flex', gap:10, alignItems:'flex-start' }}>
        <FlaskConical size={16} color="var(--amber)" style={{ flexShrink:0, marginTop:2 }} />
        <div style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.7 }}>
          <strong style={{ color:'var(--amber)' }}>What is Eval?</strong> — Tests if your RAG pipeline is accurate.
          You provide questions + expected answers, it runs them through the AI and scores:
          <br/>
          • <strong>Faithfulness</strong> — Did the answer come from the document (not hallucinated)?
          <br/>
          • <strong>Relevancy</strong> — Did it actually answer the question?
          <br/>
          • <strong>Precision</strong> — Were the retrieved document chunks useful?
          <br/>
          <strong>Upload a document first</strong>, then run eval. Leave fields empty to use built-in test questions.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'rgba(224,90,90,0.1)', border:'1px solid var(--error)', borderRadius:10,
                      padding:'12px 16px', marginBottom:16, color:'var(--error)', fontSize:'0.85rem' }}>
          {error}
        </div>
      )}

      {/* Q&A Pairs */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {pairs.map((pair, i) => (
          <motion.div key={i} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
            style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:'var(--text-3)' }}>
                PAIR {i+1}
              </span>
              {pairs.length > 1 && (
                <button onClick={() => setPairs(p => p.filter((_,j)=>j!==i))}
                  style={{ background:'none', border:'none', cursor:'pointer' }}>
                  <Trash2 size={13} color="var(--error)" />
                </button>
              )}
            </div>
            <textarea value={pair.question} placeholder="e.g. What is the main topic of this document?" rows={2}
              onChange={e => setPairs(p => p.map((x,j)=>j===i?{...x,question:e.target.value}:x))}
              style={{ width:'100%', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
                       padding:'8px 12px', color:'var(--text-1)', fontFamily:'var(--font-display)',
                       fontSize:'0.85rem', resize:'none', outline:'none', marginBottom:6 }} />
            <textarea value={pair.ground_truth} placeholder="Expected answer (optional — leave blank for auto scoring)" rows={2}
              onChange={e => setPairs(p => p.map((x,j)=>j===i?{...x,ground_truth:e.target.value}:x))}
              style={{ width:'100%', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:8,
                       padding:'8px 12px', color:'var(--text-2)', fontFamily:'var(--font-display)',
                       fontSize:'0.82rem', resize:'none', outline:'none' }} />
          </motion.div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:28 }}>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
          onClick={() => setPairs(p => [...p, { question:'', ground_truth:'' }])}
          style={{ flex:1, padding:'10px', background:'var(--bg-2)', border:'1px solid var(--border)',
                   borderRadius:10, color:'var(--text-2)', cursor:'pointer', fontFamily:'var(--font-display)',
                   fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <Plus size={14} /> Add Question
        </motion.button>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={run} disabled={running}
          style={{ flex:2, padding:'10px', background:'var(--amber)', border:'none', borderRadius:10,
                   color:'#0a0a0b', cursor:running?'not-allowed':'pointer', fontFamily:'var(--font-display)',
                   fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center',
                   justifyContent:'center', gap:8, opacity:running?0.7:1 }}>
          <Play size={14} fill="#0a0a0b" />
          {running ? 'Running... (this may take a minute)' : 'Run Evaluation'}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:12,
                          padding:'20px 24px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                <CheckCircle size={16} color="var(--success)" />
                <span style={{ fontWeight:700, fontSize:'0.9rem' }}>
                  Complete · {result.totalQuestions} questions tested
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                <ScoreBadge label="Overall"      value={result.overallScore}     color="var(--amber)"   />
                <ScoreBadge label="Faithfulness" value={result.avgFaithfulness}  color="var(--success)" />
                <ScoreBadge label="Relevancy"    value={result.avgRelevancy}     color="var(--info)"    />
                <ScoreBadge label="Precision"    value={result.avgPrecision}     color="var(--text-2)"  />
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {result.results?.map((r, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.05 }}
                  style={{ background:'var(--bg-1)', border:'1px solid var(--border)',
                           borderRadius:10, padding:'14px 16px' }}>
                  <p style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:6 }}>{r.question}</p>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-2)', marginBottom:10, lineHeight:1.6 }}>
                    {r.answer?.slice(0,200)}{r.answer?.length>200?'...':''}
                  </p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[
                      ['Faithful',  r.faithfulness,      'var(--success)'],
                      ['Relevant',  r.answerRelevancy,   'var(--info)'   ],
                      ['Precise',   r.contextPrecision,  'var(--amber)'  ],
                      [`${r.contextsUsed} chunks used`, null, 'var(--text-3)'],
                    ].map(([l,v,c]) => (
                      <span key={l} style={{ fontSize:'0.68rem', fontFamily:'var(--font-mono)', color:c,
                                             background:'var(--bg-3)', padding:'2px 8px', borderRadius:4 }}>
                        {l}{v!==null ? ': '+Math.round(v*100)+'%' : ''}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
