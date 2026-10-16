import { motion } from 'framer-motion'
import { FileText, Sparkles, Sigma, BrainCircuit, TrendingUp, MessageSquareText } from 'lucide-react'
import HowItWorks from '../components/HowItWorks.jsx'

const pipeline = [
  { icon: FileText, title: 'Input', body: 'You paste news text, a headline, or a statement into the analyzer.' },
  { icon: Sparkles, title: 'Text Cleaning', body: 'The text is normalized: lowercased, stripped of noise, and tokenized.' },
  { icon: Sigma, title: 'TF-IDF', body: 'Cleaned text is converted into a weighted numerical vector of term importance.' },
  { icon: BrainCircuit, title: 'Machine Learning Model', body: 'A logistic regression model, trained on labeled articles, scores the vector.' },
  { icon: TrendingUp, title: 'Prediction', body: 'The model outputs a class label: Fake News or Real News.' },
  { icon: MessageSquareText, title: 'Probability', body: 'Alongside the label, TrustLens returns fake and real probability percentages.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <section className="pt-16 sm:pt-24 pb-4">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-sm font-semibold text-primary">The pipeline</span>
            <h1 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              How TrustLens analyzes content
            </h1>
            <p className="mt-4 text-muted leading-relaxed max-w-xl mx-auto">
              A straightforward pipeline turns raw text into a classification and a confidence breakdown.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 grid sm:grid-cols-2 gap-5">
          {pipeline.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-slate-900/8 bg-white p-6 flex gap-4"
            >
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-bold">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <step.icon className="w-4 h-4 text-secondary" />
                  <h3 className="font-display font-bold text-ink">{step.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <HowItWorks compact />
      <div className="pb-20" />
    </>
  )
}
