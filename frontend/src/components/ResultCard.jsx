import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Percent, Gauge, Info, CircleHelp, FileText } from 'lucide-react'
import ProbabilityChart from './ProbabilityChart.jsx'
import ConfidenceCard from './ConfidenceCard.jsx'
import ExplanationCard from './ExplanationCard.jsx'

function verdictStyle(prediction = '') {
  const p = prediction.toLowerCase()
  if (p.includes('fake')) return { tone: 'danger', badge: 'bg-danger/10 text-danger' }
  if (p.includes('real')) return { tone: 'success', badge: 'bg-success/10 text-success' }
  return { tone: 'primary', badge: 'bg-primary/10 text-primary' }
}

export default function ResultCard({ result }) {
  const prediction = result?.prediction || 'Unknown'
  const isDocument = Array.isArray(result?.articles)
  const fakeProbability = Number(result?.fake_probability ?? 0)
  const realProbability = Number(result?.real_probability ?? 0)
  const isFake = prediction.toLowerCase().includes('fake')
  const isUncertain = !isDocument && prediction.toLowerCase().includes('uncertain')
  const { tone } = verdictStyle(prediction)

  const Icon = isDocument ? FileText : isUncertain ? CircleHelp : isFake ? AlertTriangle : ShieldCheck
  const panel = isDocument || isUncertain
    ? 'bg-primary/6 border-primary/20'
    : isFake ? 'bg-danger/6 border-danger/20' : 'bg-success/6 border-success/20'
  const iconBox = isDocument || isUncertain
    ? 'bg-primary/15 text-primary'
    : isFake ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'

  const description = isDocument
    ? `${result.article_count} article${result.article_count === 1 ? '' : 's'} found in ${result.filename || 'the document'}. Each one was classified separately.`
    : result?.description || 'Review the model signal and verify important claims independently.'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-8">
      <div className={`rounded-2xl p-6 sm:p-7 border ${panel}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${iconBox}`}><Icon className="w-6 h-6" /></div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Analysis complete</span>
            <h3 className="mt-1 font-display font-extrabold text-2xl text-ink">{prediction}</h3>
            <p className="mt-2 text-sm text-muted max-w-xl">{description}</p>
          </div>
        </div>
      </div>

      {result?.title && !isDocument && (
        <div className="rounded-xl bg-slate-50 border border-slate-900/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Extracted article</p>
          <p className="mt-1 font-semibold text-ink">{result.title}</p>
        </div>
      )}

      {!isDocument && result?.fake_probability !== undefined && (
        <>
          <div>
            <h4 className="font-display font-bold text-base text-ink mb-4">Model output</h4>
            <ProbabilityChart fake={fakeProbability} real={realProbability} />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-ink mb-4">Analysis breakdown</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <ConfidenceCard icon={Gauge} label="Classification" value={prediction} tone={tone} />
              <ConfidenceCard icon={AlertTriangle} label="Fake-class probability" value={`${fakeProbability.toFixed(2)}%`} tone="danger" />
              <ConfidenceCard icon={Percent} label="Real-class probability" value={`${realProbability.toFixed(2)}%`} tone="success" />
            </div>
          </div>
           <ExplanationCard explanation={result.explanation} sourceText={result.source_text} />
        </>
      )}

      {isDocument && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <ConfidenceCard icon={AlertTriangle} label="Likely fake" value={result.fake_count ?? 0} tone="danger" />
            <ConfidenceCard icon={ShieldCheck} label="Likely real" value={result.real_count ?? 0} tone="success" />
            <ConfidenceCard icon={CircleHelp} label="Uncertain" value={result.uncertain_count ?? 0} tone="primary" />
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-ink mb-4">Document articles ({result.articles.length})</h4>
            <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
              {result.articles.map((article) => {
                const style = verdictStyle(article.prediction)
                return (
                  <div key={`${article.index}-${article.page}`} className="rounded-xl border border-slate-900/8 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-sm text-ink">{article.index}. {article.title}</p>
                      <span className={`text-xs font-semibold whitespace-nowrap rounded-full px-2.5 py-1 ${style.badge}`}>
                        {article.prediction}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted line-clamp-3">{article.text_preview}</p>
                      {article.explanation?.fake_words?.length > 0 && (
                      <p className="mt-2 text-[11px] text-danger">
                        Fake signals: {article.explanation.fake_words.slice(0, 4).map((w) => w.word).join(', ')}
                      </p>
                    )}
                    {article.explanation?.real_words?.length > 0 && (
                      <p className="mt-1 text-[11px] text-success">
                        Real signals: {article.explanation.real_words.slice(0, 4).map((w) => w.word).join(', ')}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-slate-400">
                      {article.page ? `Page ${article.page} · ` : ''}
                      Fake {Number(article.fake_probability ?? 0).toFixed(1)}% · Real {Number(article.real_probability ?? 0).toFixed(1)}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {result?.disclaimer && (
        <div className="flex gap-3 rounded-xl bg-slate-50 border border-slate-900/8 p-4 text-xs text-muted leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <p>{result.disclaimer}</p>
        </div>
      )}
    </motion.div>
  )
}
