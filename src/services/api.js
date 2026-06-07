import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 600000 })

// prevent browser caching GET requests (fixes 304 stale stats)
api.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  }
  return config
})

export const uploadDocument = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
    onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round(e.loaded * 100 / e.total)),
  })
}
export const queryRAG   = (question)   => api.post('/query',  { question }, { timeout: 300000 })
export const getLogs    = (limit = 50) => api.get(`/logs?limit=${limit}`)
export const getStats   = ()           => api.get('/stats')
export const runEval    = (pairs = []) => api.post('/eval',   { pairs }, { timeout: 300000 })
export const resetStore = ()           => api.delete('/reset')