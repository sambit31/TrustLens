import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Sends article/statement text to the TrustLens ML backend and returns
 * the raw prediction payload:
 * { prediction, fake_probability, real_probability }
 */
export async function analyzeNews(text) {
  const response = await client.post('/predict', { text })
  return response.data
}

export { API_URL }
export default client
