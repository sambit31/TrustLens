import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { Activity, AlertTriangle, ShieldCheck, CircleHelp, RefreshCw, Newspaper, FileUp, Link2, Brain } from 'lucide-react'
import { getStats, getErrorMessage } from '../services/api.js'
import useMetrics from '../hooks/useMetrics.js'
import HistoryTable from '../components/HistoryTable.jsx'

const COLORS = { fake: '#EF4444', real: '#10B981', uncertain: '#5B5FEF', document: '#94A3B8' }

function StatCard({ icon: Icon, label, value, tone, note }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    danger: 'bg-danger/10 text-danger',
    success: 'bg-success/10 text-success',
    ink: 'bg-slate-900/5 text-ink',
  }
  return (
    <div className="rounded-2xl border border-slate-900/8 bg-white p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 font-display font-extrabold text-3xl text-ink tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
    </div>
  )
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-900/8 bg-white p-5 sm:p-6 ${className}`}>
      <h3 className="font-display font-bold text-base text-ink">{title}</h3>
      {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

const pct = (v) => (v == null ? '—' : `${(v * 100).toFixed(2)}%`)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [statsKey, setStatsKey] = useState(0) // bump to reload statistics
  const [tableKey, setTableKey] = useState(0) // bump to reload the history table
  const metrics = useMetrics()

  useEffect(() => {
    let active = true
    getStats(30)
      .then((data) => {
        if (!active) return
        setStats(data)
        setError('')
      })
      .catch((err) => active && setError(getErrorMessage(err)))
    return () => {
      active = false
    }
  }, [statsKey])

  const reloadStats = () => setStatsKey((k) => k + 1)
  const refresh = () => {
    reloadStats()
    setTableKey((k) => k + 1)
  }

  const verdicts = stats?.verdicts || { fake: 0, real: 0, uncertain: 0 }
  const totalVerdicts = verdicts.fake + verdicts.real + verdicts.uncertain
  const pieData = [
    { name: 'Likely Fake', value: verdicts.fake, color: COLORS.fake },
    { name: 'Likely Real', value: verdicts.real, color: COLORS.real },
    { name: 'Uncertain', value: verdicts.uncertain, color: COLORS.uncertain },
  ].filter((d) => d.value > 0)

  const timeline = (stats?.timeline || []).map((d) => ({
    ...d,
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  }))

  const inputs = stats?.by_input_type || { text: 0, url: 0, document: 0 }
  const maxInput = Math.max(inputs.text, inputs.url, inputs.document, 1)
  const inputRows = [
    { key: 'text', label: 'Text', icon: Newspaper },
    { key: 'url', label: 'URL', icon: Link2 },
    { key: 'document', label: 'PDF', icon: FileUp },
  ]

  return (
    <section className="grid-backdrop">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted">Every analysis you run is saved here, with usage trends and model performance.</p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-900/10 bg-white text-sm font-semibold text-ink hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">{error}</div>
        )}

        {stats && stats.total_analyses === 0 && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-sm text-ink">
            No analyses saved yet.{' '}
            <Link to="/analyze" className="font-semibold text-primary underline">Analyze some news</Link>{' '}
            and come back to see your statistics.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Activity} label="Total analyses" value={stats?.total_analyses ?? '…'} tone="ink"
            note={stats ? `${stats.articles_in_documents} articles inside PDFs` : null} />
          <StatCard icon={AlertTriangle} label="Likely fake" value={stats ? verdicts.fake : '…'} tone="danger"
            note={totalVerdicts ? `${((verdicts.fake / totalVerdicts) * 100).toFixed(0)}% of all verdicts` : null} />
          <StatCard icon={ShieldCheck} label="Likely real" value={stats ? verdicts.real : '…'} tone="success"
            note={totalVerdicts ? `${((verdicts.real / totalVerdicts) * 100).toFixed(0)}% of all verdicts` : null} />
          <StatCard icon={CircleHelp} label="Uncertain" value={stats ? verdicts.uncertain : '…'} tone="primary"
            note={totalVerdicts ? `${((verdicts.uncertain / totalVerdicts) * 100).toFixed(0)}% of all verdicts` : null} />
        </div>

        {/* Charts */}
        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <Panel title="Activity" subtitle="Analyses per day, last 30 days" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(91,95,239,0.06)' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="fake" name="Likely Fake" stackId="a" fill={COLORS.fake} />
                  <Bar dataKey="real" name="Likely Real" stackId="a" fill={COLORS.real} />
                  <Bar dataKey="uncertain" name="Uncertain" stackId="a" fill={COLORS.uncertain} />
                  <Bar dataKey="document" name="PDF" stackId="a" fill={COLORS.document} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Verdict breakdown" subtitle="Texts, URLs and every article inside PDFs">
            <div className="h-64">
              {pieData.length === 0 ? (
                <p className="text-sm text-muted pt-20 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid lg:grid-cols-3 gap-4">
          <Panel title="Input types" subtitle="How content was submitted">
            <ul className="space-y-4">
              {inputRows.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink"><Icon className="w-4 h-4 text-slate-500" /> {label}</span>
                    <span className="font-semibold tabular-nums">{inputs[key]}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(inputs[key] / maxInput) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Common fake signals" subtitle="Words that most often pushed results to “Likely Fake”">
            {stats?.top_fake_words?.length ? (
              <div className="flex flex-wrap gap-2">
                {stats.top_fake_words.map((w) => (
                  <span key={w.word} className="text-xs font-medium rounded-full px-3 py-1 bg-danger/10 text-danger">
                    {w.word} <span className="opacity-60">×{w.count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Appears after some results come out “Likely Fake”.</p>
            )}
          </Panel>

          <Panel title="Model performance" subtitle="TF-IDF + logistic regression, held-out test set">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-ink">{pct(metrics.accuracy)}</p>
                <p className="text-xs text-muted">accuracy</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Precision</dt><dd className="text-right font-semibold">{pct(metrics.precision)}</dd>
              <dt className="text-muted">Recall</dt><dd className="text-right font-semibold">{pct(metrics.recall)}</dd>
              <dt className="text-muted">F1 score</dt><dd className="text-right font-semibold">{pct(metrics.f1)}</dd>
              <dt className="text-muted">ROC-AUC</dt><dd className="text-right font-semibold">{pct(metrics.roc_auc)}</dd>
              <dt className="text-muted">Training articles</dt>
              <dd className="text-right font-semibold">{metrics.dataset_rows_after_cleaning?.toLocaleString() ?? '—'}</dd>
            </dl>
            {metrics.leak_check && (
              <p className="mt-4 text-xs text-muted leading-relaxed">
                Leak check: adding a “(Reuters)” dateline changes the real score from{' '}
                {metrics.leak_check.real_probability_plain}% to {metrics.leak_check.real_probability_with_reuters_dateline}%.
              </p>
            )}
          </Panel>
        </div>

        <div className="mt-4">
          <HistoryTable key={tableKey} onChange={reloadStats} />
        </div>
      </div>
    </section>
  )
}