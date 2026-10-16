import { motion } from 'framer-motion'
import { FileText, Cog, BrainCircuit, FileCheck2 } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Input',
    description: 'You provide news text, a statement, or a headline to review.',
  },
  {
    icon: Cog,
    title: 'Preprocessing',
    description: 'The text is cleaned and transformed into a structured numerical form.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Analysis',
    description: 'TF-IDF and logistic regression evaluate learned linguistic patterns.',
  },
  {
    icon: FileCheck2,
    title: 'Result',
    description: 'TrustLens returns a classification with a full probability breakdown.',
  },
]

export default function HowItWorks({ compact = false }) {
  return (
    <section className={compact ? '' : 'py-20 sm:py-28'}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {!compact && (
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-semibold text-secondary">Pipeline</span>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              From raw text to a clear signal
            </h2>
          </div>
        )}

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative"
            >
              <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-display font-bold flex items-center justify-center text-lg shadow-[0_8px_20px_rgba(91,95,239,0.3)]">
                {i + 1}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <step.icon className="w-4.5 h-4.5 text-secondary" />
                <h3 className="font-display font-bold text-base text-ink">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted leading-relaxed pr-2">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
