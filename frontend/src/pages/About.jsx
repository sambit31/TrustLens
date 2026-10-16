import { motion } from 'framer-motion'
import { AlertCircle, Lightbulb, Cpu, Rocket } from 'lucide-react'

const sections = [
  {
    icon: AlertCircle,
    title: 'Problem',
    body: 'Misinformation spreads quickly, and readers rarely have a fast, consistent way to gauge how trustworthy a piece of text looks before deciding what to do with it.',
  },
  {
    icon: Lightbulb,
    title: 'Solution',
    body: 'TrustLens is an AI/ML-based academic project designed to analyze news text and document signals using machine-learning techniques, returning a transparent classification and confidence score.',
  },
  {
    icon: Cpu,
    title: 'Technology',
    body: 'A FastAPI backend serves a scikit-learn pipeline: text is vectorized with TF-IDF and classified with logistic regression, and the React frontend presents the result with full probability breakdowns.',
  },
]

const futureScope = [
  'Transformer-based models',
  'Source credibility analysis',
  'URL analysis',
  'OCR for scanned documents',
  'PDF and DOCX document analysis',
  'Explainable AI attributions',
  'Analysis history',
  'Document authenticity risk analysis',
]

export default function About() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-primary">About the project</span>
          <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Building better signals for digital trust
          </h1>
        </motion.div>

        <div className="mt-12 space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-900/8 bg-white p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h2 className="font-display font-bold text-lg text-ink">{s.title}</h2>
              </div>
              <p className="text-sm text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-900/8 bg-white p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Rocket className="w-4.5 h-4.5 text-accent" />
            </div>
            <h2 className="font-display font-bold text-lg text-ink">Future scope</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {futureScope.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
