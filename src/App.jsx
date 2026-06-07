import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import UploadPanel from './components/UploadPanel'
import TelemetryPanel from './components/TelemetryPanel'
import EvalPanel from './components/EvalPanel'
import { getStats, resetStore } from './services/api'

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch { return defaultValue }
  })
  const setPersistedState = (value) => {
    setState(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }
  return [state, setPersistedState]
}

export default function App() {
  const [page, setPage]         = useState('chat')
  const [stats, setStats]       = useState(null)
  const [messages, setMessages] = usePersistedState('askmydocs_messages', [])

  const fetchStats = useCallback(async () => {
    try { const r = await getStats(); setStats(r.data) } catch {}
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats, page])

  const handleReset = async () => {
    if (!window.confirm('Reset all documents and query logs?')) return
    try {
      await resetStore()
      setMessages([])
      toast.success('Corpus reset')
      fetchStats()
    } catch { toast.error('Reset failed') }
  }

  return (
    <div style={{ display:'flex', minHeight:'100dvh', background:'var(--bg-0)' }}>
      <Sidebar active={page} onNav={setPage} stats={stats} onReset={handleReset} />
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {/* All panels always mounted — hidden with CSS not unmounted */}
        <div style={{ display: page==='chat'   ? 'flex' : 'none', flex:1, flexDirection:'column', height:'100dvh', overflow:'hidden' }}>
          <ChatPanel messages={messages} setMessages={setMessages} onStatsRefresh={fetchStats} />
        </div>
        <div style={{ display: page==='upload' ? 'flex' : 'none', flex:1, flexDirection:'column', height:'100dvh', overflow:'hidden' }}>
          <UploadPanel onStatsRefresh={fetchStats} />
        </div>
        <div style={{ display: page==='logs'   ? 'flex' : 'none', flex:1, flexDirection:'column', height:'100dvh', overflow:'hidden' }}>
          <TelemetryPanel />
        </div>
        <div style={{ display: page==='eval'   ? 'flex' : 'none', flex:1, flexDirection:'column', height:'100dvh', overflow:'hidden' }}>
          <EvalPanel />
        </div>

      </main>
    </div>
  )
}
