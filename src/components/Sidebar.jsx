import { motion } from 'framer-motion'
import { MessageSquare, Upload, BarChart2, FlaskConical, Trash2, BookOpen } from 'lucide-react'

const NAV = [
  { id:'chat',   label:'Chat',      Icon:MessageSquare, desc:'Ask questions' },
  { id:'upload', label:'Upload',    Icon:Upload,        desc:'Add documents' },
  { id:'logs',   label:'Telemetry', Icon:BarChart2,     desc:'Query logs'    },
  { id:'eval',   label:'Eval',      Icon:FlaskConical,  desc:'Test accuracy' },
]

export default function Sidebar({ active, onNav, stats, onReset }) {
  return (
    <motion.aside initial={{ x:-80, opacity:0 }} animate={{ x:0, opacity:1 }}
      transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
      style={{ width:220, minWidth:220, background:'var(--bg-1)', borderRight:'1px solid var(--border)',
               display:'flex', flexDirection:'column', padding:'24px 0',
               position:'sticky', top:0, height:'100dvh' }}>

      {/* Logo */}
      <div style={{ padding:'0 20px 24px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'var(--amber)',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BookOpen size={18} color="#0a0a0b" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'1rem', letterSpacing:'-0.02em' }}>AskMyDocs</div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
              MERN · AI · RAG
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ margin:'14px', background:'var(--amber-glow2)', border:'1px solid var(--amber-dim)',
                      borderRadius:10, padding:'10px 12px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--amber-dim)',
                        marginBottom:8, letterSpacing:'0.08em' }}>CORPUS STATUS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['Docs',    stats.totalDocs    ?? 0],
              ['Chunks',  stats.totalChunks  ?? 0],
              ['Queries', stats.totalQueries ?? 0],
              ['Avg ms',  stats.avgLatency ? (stats.avgLatency*1000).toFixed(0) : '—'],
            ].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--amber)', fontFamily:'var(--font-mono)' }}>{v}</div>
                <div style={{ fontSize:'0.62rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 10px', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(({ id, label, Icon, desc }, i) => {
          const on = active === id
          return (
            <motion.button key={id} onClick={() => onNav(id)} whileHover={{ x:2 }} whileTap={{ scale:0.98 }}
              initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.2+i*0.06 }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8,
                       border:'none', background:on?'var(--amber-glow)':'transparent',
                       color:on?'var(--amber)':'var(--text-2)', fontFamily:'var(--font-display)',
                       fontWeight:on?600:400, fontSize:'0.88rem', cursor:'pointer',
                       width:'100%', textAlign:'left', position:'relative' }}>
              {on && <motion.div layoutId="nav-ind"
                style={{ position:'absolute', left:0, top:'20%', bottom:'20%',
                         width:3, borderRadius:2, background:'var(--amber)' }}
                transition={{ type:'spring', stiffness:400, damping:30 }} />}
              <Icon size={15} strokeWidth={on?2.2:1.8} />
              <div>
                <div>{label}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', fontWeight:400 }}>{desc}</div>
              </div>
            </motion.button>
          )
        })}
      </nav>

      {/* Reset */}
      <div style={{ padding:'14px 10px', borderTop:'1px solid var(--border)' }}>
        <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={onReset}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:8,
                   border:'1px solid var(--border)', background:'transparent', color:'var(--text-3)',
                   fontFamily:'var(--font-display)', fontSize:'0.82rem', cursor:'pointer', width:'100%' }}>
          <Trash2 size={13} strokeWidth={1.8} /> Reset All Docs
        </motion.button>
      </div>
    </motion.aside>
  )
}
