import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const messages = ['Scanning linguistic patterns...', 'Generating model prediction...']

export default function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, messages.length - 1)), 1100)
    return () => clearTimeout(t)
  }, [step])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status" aria-live="polite">
      <Loader2 className="w-9 h-9 text-primary animate-spin" />
      <p className="mt-5 font-display font-semibold text-ink">Analyzing content...</p>
      <p className="mt-1 text-sm text-muted">{messages[step]}</p>
    </div>
  )
}
