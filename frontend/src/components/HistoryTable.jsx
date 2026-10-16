import { useCallback, useEffect, useState } from 'react'
import { Search, Eye, Trash2, X, Newspaper, FileUp, Link2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getHistory, getAnalysis, deleteAnalysis, getErrorMessage } from '../services/api.js'
import ResultCard from './ResultCard.jsx'

const PAGE_SIZE = 10
const typeIcons = { text: Newspaper, document: FileUp, url: Link2 }

function verdictBadge(prediction = '') {
  const p = prediction.toLowerCase()
  if (p.includes('fake')) return 'bg-danger/10 text-danger'
  if (p.includes('real')) return 'bg-success/10 text-success'
  return 'bg-primary/10 text-primary'
}

function formatDate(iso) {
  if (!iso) return ''
  // SQLite returns times without a timezone; they are stored in UTC
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`)
  return date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function HistoryTable({ onChange }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [inputType, setInputType] = useState('')
  const [prediction, setPrediction] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getHistory({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: search.trim() || undefined,
        input_type: inputType || undefined,
        prediction: prediction || undefined,
      })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, search, inputType, prediction])

  // Small delay so typing in the search box doesn't send a request per key
  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const openItem = async (id) => {
    try {
      setSelected(await getAnalysis(id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const removeItem = async (id) => {
    if (!window.confirm('Delete this analysis from history?')) return
    try {
      await deleteAnalysis(id)
      await load()
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="rounded-2xl border border-slate-900/8 bg-white p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-ink">Analysis history</h3>
          <p className="text-xs text-muted">{total} saved {total === 1 ? 'analysis' : 'analyses'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search title or text"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-900/10 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={inputType}
            onChange={(e) => { setInputType(e.target.value); setPage(0) }}
            className="px-3 py-2 rounded-lg border border-slate-900/10 text-sm bg-white"
          >
            <option value="">All inputs</option>
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="document">PDF</option>
          </select>
          <select
            value={prediction}
            onChange={(e) => { setPrediction(e.target.value); setPage(0) }}
            className="px-3 py-2 rounded-lg border border-slate-900/10 text-sm bg-white"
          >
            <option value="">All results</option>
            <option value="Likely Fake">Likely Fake</option>
            <option value="Likely Real">Likely Real</option>
            <option value="Uncertain">Uncertain</option>
            <option value="Document analyzed">PDF documents</option>
          </select>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-slate-900/8">
              <th className="py-2 pr-3 font-semibold">Date</th>
              <th className="py-2 pr-3 font-semibold">Type</th>
              <th className="py-2 pr-3 font-semibold">Title</th>
              <th className="py-2 pr-3 font-semibold">Result</th>
              <th className="py-2 pr-3 font-semibold text-right">Fake %</th>
              <th className="py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-muted">No analyses found.</td></tr>
            )}
            {items.map((item) => {
              const Icon = typeIcons[item.input_type] || Newspaper
              return (
                <tr key={item.id} className="border-b border-slate-900/5 hover:bg-slate-50">
                  <td className="py-3 pr-3 whitespace-nowrap text-muted">{formatDate(item.created_at)}</td>
                  <td className="py-3 pr-3"><Icon className="w-4 h-4 text-slate-500" aria-label={item.input_type} /></td>
                  <td className="py-3 pr-3 max-w-xs">
                    <p className="truncate font-medium text-ink" title={item.title}>{item.title}</p>
                    {item.input_type === 'document' && (
                      <p className="text-xs text-muted">
                        {item.article_count} articles · {item.fake_count} fake · {item.real_count} real
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${verdictBadge(item.prediction)}`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">
                    {item.fake_probability != null ? `${item.fake_probability.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button onClick={() => openItem(item.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary" aria-label="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 text-sm text-muted">
        <span>Page {page + 1} of {pages}</span>
        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg border border-slate-900/10 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg border border-slate-900/10 disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs text-muted mb-4">
              Saved {formatDate(selected.created_at)}{selected.source ? ` · ${selected.source}` : ''}
            </p>
            <ResultCard result={selected.result} />
          </div>
        </div>
      )}
    </div>
  )
}