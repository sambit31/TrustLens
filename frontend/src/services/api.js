import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL: API_URL,
  timeout: 120000,
})

export async function analyzeNews(text) {
  return (await client.post('/predict', { text })).data
}

export async function analyzeDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  return (await client.post('/analyze-document', formData)).data
}

export async function analyzeURL(url) {
  return (await client.post('/analyze-url', { url })).data
}

export async function getMetrics() {
  return (await client.get('/metrics')).data
}

// ---------- Dashboard ----------

export async function getStats(days = 30) {
  return (await client.get('/stats', { params: { days } })).data
}

export async function getHistory(params = {}) {
  return (await client.get('/history', { params })).data
}

export async function getAnalysis(id) {
  return (await client.get(`/history/${id}`)).data
}

export async function deleteAnalysis(id) {
  return (await client.delete(`/history/${id}`)).data
}
/**
 * Turn any axios / FastAPI error into a readable string.
 * FastAPI's `detail` can be a string, an object, or a list of
 * validation errors — rendering an object directly would crash React.
 */
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.code === 'ECONNABORTED') {
    return 'The request timed out. The file may be too large, or the backend is busy.'
  }
  if (!err?.response) {
    return `Cannot reach the TrustLens backend at ${API_URL}. Make sure it is running.`
  }

  const detail = err.response.data?.detail

  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
        return field && field !== 'body' ? `${field}: ${d.msg}` : d.msg
      })
      .join(' ')
  }
  if (detail && typeof detail === 'object') {
    return detail.error || detail.message || JSON.stringify(detail)
  }
  return fallback
}

export { API_URL }
export default client
