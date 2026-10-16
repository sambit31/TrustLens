import { useEffect, useState } from 'react'
import { getMetrics } from '../services/api.js'

// Shown until the backend answers (or if it is offline).
// Values from the leak-fixed model in ml/artifacts/metrics.json.
export const FALLBACK_METRICS = {
  accuracy: 0.9799,
  precision: 0.9802,
  recall: 0.9833,
  f1: 0.9818,
  confusion_matrix: [[3333, 83], [70, 4117]],
}

export default function useMetrics() {
  const [metrics, setMetrics] = useState(FALLBACK_METRICS)

  useEffect(() => {
    let active = true
    getMetrics()
      .then((data) => {
        if (active && data?.accuracy) setMetrics(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return metrics
}
