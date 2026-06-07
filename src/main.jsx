import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-right" toastOptions={{
      style: { background:'#18181c', color:'#f0ede8', border:'1px solid #2a2a32',
               fontFamily:'Syne,sans-serif', fontSize:'0.85rem' },
      success: { iconTheme: { primary:'#5cb88a', secondary:'#0a0a0b' } },
      error:   { iconTheme: { primary:'#e05a5a', secondary:'#0a0a0b' } },
    }} />
  </React.StrictMode>
)
