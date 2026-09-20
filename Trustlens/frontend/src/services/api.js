import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL: API_URL,
  timeout: 120000,
})

export async function analyzeNews(text) {
  const response = await client.post('/predict', {
    text,
  })

  return response.data
}

export async function analyzeDocument(file) {
  const formData = new FormData()

  formData.append('file', file)

  const response = await client.post(
    '/analyze-document',
    formData
  )

  return response.data
}

export { API_URL }

export default client