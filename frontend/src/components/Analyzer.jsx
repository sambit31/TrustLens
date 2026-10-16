import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, FileUp, Link2, Sparkles, Eraser, SearchCheck, ScanEye } from 'lucide-react'
import { analyzeNews, analyzeDocument, analyzeURL, getErrorMessage } from '../services/api.js'
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
  const [url, setUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
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
      setResult({ ...data, source_text: text.trim() })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(getErrorMessage(err, 'The backend returned an unexpected response. Please try again.'))
    }
  }

  const handleURLAnalyze = async () => {
    if (!url.trim()) {
      setStatus('error')
      setErrorMsg('Please enter a news article URL.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const data = await analyzeURL(url.trim())
      setResult(data)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(getErrorMessage(err, 'The URL could not be analyzed. Check the URL and try again.'))
    }
  }

  const handleDocumentAnalyze = async () => {
  if (!selectedFile) {
    setStatus('error')
    setErrorMsg('Please select a PDF file first.')
    return
  }

  setStatus('loading')
  setErrorMsg('')

  try {
    const data = await analyzeDocument(selectedFile)

    if (data.error) {
      setStatus('error')
      setErrorMsg(data.error)
      return
    }

    setResult(data)
    setStatus('success')
  } catch (err) {
    setStatus('error')
    setErrorMsg(getErrorMessage(err, 'The document could not be analyzed. Please try again.'))
  }
}

  // "Try again" must re-run the analysis for the tab the user is on
  const handleRetry = () => {
    if (activeTab === 'document') return handleDocumentAnalyze()
    if (activeTab === 'url') return handleURLAnalyze()
    return handleAnalyze()
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (status === 'error') {
      setStatus(result ? 'success' : 'idle')
      setErrorMsg('')
    }
  }

  const handleClear = () => {
    setText('')
    setUrl('')
    setSelectedFile(null)
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
              onClick={() => handleTabChange(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'document' ? (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">

    <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
      <FileUp className="w-7 h-7 text-primary" />
    </div>

    <p className="mt-4 font-display font-semibold text-ink">
      Upload a Document
    </p>

    <p className="mt-1 text-sm text-muted max-w-sm">
      Upload a PDF document and TrustLens will extract its text and analyze it.
    </p>

    <label
      htmlFor="document-upload"
      className="mt-6 cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-semibold px-6 py-3.5 shadow-[0_10px_24px_rgba(91,95,239,0.3)] hover:-translate-y-0.5 transition-all"
    >
      <FileUp className="w-4 h-4" />
      Choose PDF
    </label>

    <input
      id="document-upload"
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0]

        e.target.value = ''

        if (file) {
          setSelectedFile(file)
          setResult(null)
          setStatus('idle')
          setErrorMsg('')
        }
      }}
    />

    {selectedFile && (
      <div className="mt-5 w-full max-w-sm rounded-xl bg-slate-50 border border-slate-200 p-4 text-left">

        <p className="text-sm font-semibold text-ink truncate">
          {selectedFile.name}
        </p>

        <p className="mt-1 text-xs text-muted">
          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        </p>

      </div>
    )}

    <button
      onClick={handleDocumentAnalyze}
      disabled={!selectedFile || status === 'loading'}
      className="mt-4 w-full max-w-sm inline-flex items-center justify-center gap-2 rounded-full bg-ink text-white font-semibold px-6 py-3.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <SearchCheck className="w-4 h-4" />
      {status === 'loading' ? 'Analyzing Document...' : 'Analyze Document'}
    </button>

  </div>

 ) : activeTab === 'url' ? (
          <div className="flex flex-col py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
              <Link2 className="w-7 h-7 text-primary" />
            </div>
            <p className="mt-4 font-display font-semibold text-ink">Analyze a news URL</p>
            <p className="mt-1 text-sm text-muted">TrustLens extracts the article text from the page and runs the ML classifier.</p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && status !== 'loading') handleURLAnalyze()
              }}
              placeholder="https://example.com/news/article"
              className="mt-6 w-full rounded-xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary/40"
            />
            <button
              onClick={handleURLAnalyze}
              disabled={status === 'loading'}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-semibold px-6 py-3.5 disabled:opacity-50"
            >
              <SearchCheck className="w-4 h-4" />
              {status === 'loading' ? 'Analyzing URL...' : 'Analyze URL'}
            </button>
            <p className="mt-4 text-xs text-muted">Only publicly accessible HTML pages are supported in this version.</p>
          </div>
)  : (
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
              <ErrorState message={errorMsg} onRetry={handleRetry} />
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
