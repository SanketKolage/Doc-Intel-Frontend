import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Database } from 'lucide-react'

export default function ChunkCard({ chunk, index }) {
  const [open, setOpen] = useState(false)
  const pct = Math.round((chunk.rrfScore || chunk.semScore || 0) * 100 * 10)

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:index * 0.06 }}
      style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                 background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <Database size={13} color="var(--amber)" strokeWidth={2} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'0.72rem', color:'var(--text-3)', fontFamily:'var(--font-mono)',
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {chunk.source} · chunk {chunk.chunkIndex}
          </div>
          <div style={{ marginTop:4, height:3, background:'var(--bg-3)', borderRadius:2, overflow:'hidden' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(pct, 100)}%` }}
              transition={{ duration:0.6, delay:index * 0.06 + 0.2 }}
              style={{ height:'100%', background:'var(--amber)', borderRadius:2 }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          {chunk.semScore > 0 && <span style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)',
            color:'var(--info)', background:'rgba(90,154,224,0.1)', padding:'2px 6px', borderRadius:4 }}>
            sem {chunk.semScore.toFixed(3)}</span>}
          {chunk.bm25Score > 0 && <span style={{ fontSize:'0.65rem', fontFamily:'var(--font-mono)',
            color:'var(--success)', background:'rgba(92,184,138,0.1)', padding:'2px 6px', borderRadius:4 }}>
            bm25 {chunk.bm25Score.toFixed(2)}</span>}
        </div>
        <motion.div animate={{ rotate:open ? 180 : 0 }} transition={{ duration:0.2 }}>
          <ChevronDown size={14} color="var(--text-3)" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}>
            <div style={{ padding:'10px 14px 12px', borderTop:'1px solid var(--border)' }}>
              <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.7,
                          fontFamily:'var(--font-mono)', whiteSpace:'pre-wrap' }}>{chunk.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
