import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, FileUp, Link2, Sparkles, Eraser, SearchCheck, ScanEye } from 'lucide-react'
import { analyzeNews } from '../services/api.js'
import LoadingState from './LoadingState.jsx'
import ErrorState from './ErrorState.jsx'
import ResultCard from './ResultCard.jsx'

const tabs = [
  { id: 'text', label: 'News Text', icon: Newspaper },
  { id: 'document', label: 'Document', icon: FileUp },
  { id: 'url', label: 'URL', icon: Link2 },
]

const examples = [
  {
    label: 'Example 1',
    text: 'BREAKING: Scientists announced a fictional discovery that drinking lemon water at midnight instantly cures all diseases, according to unnamed anonymous sources with no official study attached.',
  },
  {
    label: 'Example 2',
    text: 'Local city council confirmed today that the annual downtown fictional street festival will proceed next month, with road closures announced in advance and coordination from the transportation department.',
  },
  {
    label: 'Example 3',
    text: 'A fictional viral post claims a popular household spice can replace all prescribed medication overnight, urging readers to stop taking doctor-prescribed treatment immediately without evidence.',
  },
]

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setStatus('error')
      setErrorMsg('Please paste some text before analyzing.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const data = await analyzeNews(text.trim())
      setResult(data)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || !err.response) {
        setErrorMsg('Make sure the TrustLens backend is running.')
      } else {
        setErrorMsg('The backend returned an unexpected response. Please try again.')
      }
    }
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
  }

  const fillExample = (exampleText) => {
    setText(exampleText)
    setResult(null)
    setStatus('idle')
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Input card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)]">
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100/80 mb-6" role="tablist" aria-label="Analysis type">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab !== 'text' ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
            <ScanEye className="w-9 h-9 text-slate-300" />
            <p className="mt-4 font-display font-semibold text-ink">Coming Soon</p>
            <p className="mt-1 text-sm text-muted max-w-xs">
              {activeTab === 'document' ? 'Document' : 'URL'} analysis is planned for a future release of TrustLens.
            </p>
          </div>
        ) : (
          <>
            <label htmlFor="analyzer-textarea" className="sr-only">
              Article, headline, or statement to analyze
            </label>
            <textarea
              id="analyzer-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the article, headline, or statement you want to analyze..."
              rows={10}
              className="w-full resize-none rounded-2xl border border-slate-900/10 bg-white p-4 text-sm leading-relaxed text-ink placeholder:text-slate-400 focus:border-primary/40 transition-colors"
            />
            <div className="mt-2 text-xs text-muted">{text.length.toLocaleString()} characters</div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAnalyze}
                disabled={status === 'loading'}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-semibold px-6 py-3.5 shadow-[0_10px_24px_rgba(91,95,239,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <SearchCheck className="w-4.5 h-4.5" />
                {status === 'loading' ? 'Analyzing...' : 'Analyze Content'}
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 px-6 py-3.5 font-semibold text-ink hover:bg-slate-50 transition-colors"
              >
                <Eraser className="w-4 h-4" />
                Clear
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-900/8">
              <p className="text-xs font-semibold text-muted mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => fillExample(ex.text)}
                    className="text-xs font-medium rounded-full border border-slate-900/10 px-3.5 py-2 text-muted hover:text-primary hover:border-primary/30 transition-colors"
                    title="Demo Example"
                  >
                    {ex.label}
                    <span className="ml-1.5 text-[10px] text-slate-400">(Demo Example)</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results card */}
      <div className="rounded-3xl border border-slate-900/8 bg-white p-6 sm:p-8 min-h-[420px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
                <ScanEye className="w-7 h-7 text-primary" />
              </div>
              <p className="mt-4 font-display font-semibold text-ink">Your analysis will appear here</p>
              <p className="mt-1 text-sm text-muted max-w-xs">
                Paste content on the left and run an analysis to see a full trust breakdown.
              </p>
            </motion.div>
          )}

          {status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={errorMsg} onRetry={handleAnalyze} />
            </motion.div>
          )}

          {status === 'success' && result && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultCard result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
