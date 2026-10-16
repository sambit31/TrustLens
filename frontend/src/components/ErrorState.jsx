import { AlertCircle, RotateCcw } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center" role="alert">
      <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-danger" />
      </div>
      <h3 className="mt-5 font-display font-bold text-lg text-ink">Unable to analyze content</h3>
      <p className="mt-2 text-sm text-muted max-w-sm">
        {message || 'Make sure the TrustLens backend is running at the configured API URL.'}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-white text-sm font-semibold px-5 py-2.5 hover:bg-slate-800 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )
}
