import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, X, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadDocument, getStats } from '../services/api'

export default function UploadPanel({ onStatsRefresh }) {
  const [files, setFiles]         = useState([])
  const [uploading, setUploading] = useState(false)
  const [savedDocs, setSavedDocs] = useState([])   // docs already in server

  // load already-uploaded docs from server on mount
  const loadSavedDocs = async () => {
    try {
      const r = await getStats()
      setSavedDocs(r.data.documents || [])
    } catch {}
  }

  useEffect(() => { loadSavedDocs() }, [])

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted.map(f => ({
      file: f, status: 'ready', progress: 0, chunks: 0
    }))])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain':['.txt'], 'text/markdown':['.md'], 'application/pdf':['.pdf'] },
    multiple: true,
  })

  const uploadAll = async () => {
    const ready = files.filter(f => f.status === 'ready')
    if (!ready.length) return
    setUploading(true)

    for (const item of ready) {
      setFiles(prev => prev.map(f => f.file===item.file ? { ...f, status:'uploading' } : f))
      try {
        const r = await uploadDocument(item.file, (pct) =>
          setFiles(prev => prev.map(f => f.file===item.file ? { ...f, progress:pct } : f)))
        setFiles(prev => prev.map(f => f.file===item.file
          ? { ...f, status:'done', chunks:r.data.chunks, progress:100 } : f))
        toast.success(`${item.file.name} → ${r.data.chunks} chunks`)
      } catch (e) {
        const msg = e.response?.data?.error || 'Upload failed'
        setFiles(prev => prev.map(f => f.file===item.file ? { ...f, status:'error', error:msg } : f))
        toast.error(msg)
      }
    }

    setUploading(false)
    await loadSavedDocs()
    onStatsRefresh?.()
  }

  return (
    <div style={{ padding:'32px 36px', maxWidth:680, margin:'0 auto', width:'100%' }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h2 style={{ fontWeight:800, fontSize:'1.4rem', letterSpacing:'-0.02em' }}>Upload Documents</h2>
        <p style={{ color:'var(--text-3)', fontSize:'0.85rem', marginTop:4 }}>
          PDF, TXT, Markdown. Stored in MongoDB — persists across restarts.
        </p>
      </motion.div>

      {/* Already uploaded docs */}
      {savedDocs.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:12,
                   padding:'14px 16px', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <FolderOpen size={15} color="var(--amber)" />
            <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-2)' }}>
              {savedDocs.length} document{savedDocs.length > 1 ? 's' : ''} in corpus
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {savedDocs.map((doc, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8,
                                    padding:'6px 10px', background:'var(--bg-2)',
                                    borderRadius:8, border:'1px solid var(--border)' }}>
                <FileText size={13} color="var(--success)" strokeWidth={1.8} />
                <span style={{ fontSize:'0.8rem', color:'var(--text-2)', flex:1,
                               whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {doc}
                </span>
                <CheckCircle size={13} color="var(--success)" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Drop zone */}
      <motion.div {...getRootProps()} whileHover={{ borderColor:'var(--amber-dim)' }}
        style={{ border:`2px dashed ${isDragActive?'var(--amber)':'var(--border)'}`,
                 borderRadius:16, padding:'48px 32px', textAlign:'center', cursor:'pointer',
                 background:isDragActive?'var(--amber-glow2)':'var(--bg-1)',
                 transition:'all 0.2s', marginBottom:20 }}>
        <input {...getInputProps()} />
        <motion.div animate={{ y:isDragActive?-4:0 }} transition={{ duration:0.2 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--amber-glow)',
                        border:'1px solid var(--amber-dim)', display:'flex', alignItems:'center',
                        justifyContent:'center', margin:'0 auto 16px' }}>
            <Upload size={24} color="var(--amber)" />
          </div>
          <p style={{ fontWeight:700, marginBottom:6 }}>
            {isDragActive ? 'Drop here' : 'Drag & drop files'}
          </p>
          <p style={{ color:'var(--text-3)', fontSize:'0.82rem' }}>
            or click to browse · PDF, TXT, MD
          </p>
        </motion.div>
      </motion.div>

      {/* New files queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {files.map(({ file, status, progress, chunks, error }, i) => (
              <motion.div key={file.name+i}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.05 }}
                style={{ background:'var(--bg-2)', border:'1px solid var(--border)',
                         borderRadius:10, padding:'12px 14px',
                         display:'flex', alignItems:'center', gap:12 }}>
                <FileText size={16} color="var(--amber)" strokeWidth={1.8} style={{ flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:500, whiteSpace:'nowrap',
                                overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:2,
                                fontFamily:'var(--font-mono)' }}>
                    {(file.size/1024).toFixed(1)} KB
                    {status==='done'  && ` · ${chunks} chunks indexed`}
                    {status==='error' && ` · ${error}`}
                  </div>
                  {status==='uploading' && (
                    <div style={{ marginTop:6, height:3, background:'var(--bg-3)',
                                  borderRadius:2, overflow:'hidden' }}>
                      <motion.div animate={{ width:`${progress}%` }}
                        style={{ height:'100%', background:'var(--amber)', borderRadius:2 }} />
                    </div>
                  )}
                </div>
                {status==='done'  && <CheckCircle size={16} color="var(--success)" />}
                {status==='error' && <AlertCircle size={16} color="var(--error)" />}
                {status==='ready' && (
                  <button onClick={() => setFiles(p => p.filter(f => f.file!==file))}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
                    <X size={14} color="var(--text-3)" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.some(f => f.status==='ready') && (
        <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
          onClick={uploadAll} disabled={uploading}
          style={{ width:'100%', padding:'14px', background:'var(--amber)', border:'none',
                   borderRadius:12, fontFamily:'var(--font-display)', fontWeight:700,
                   fontSize:'0.95rem', color:'#0a0a0b',
                   cursor:uploading?'not-allowed':'pointer', opacity:uploading?0.7:1 }}>
          {uploading
            ? 'Uploading...'
            : `Upload ${files.filter(f=>f.status==='ready').length} file(s)`}
        </motion.button>
      )}
    </div>
  )
}

