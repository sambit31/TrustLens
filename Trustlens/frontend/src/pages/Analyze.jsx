import { motion } from 'framer-motion'
import Analyzer from '../components/Analyzer.jsx'

export default function Analyze() {
  return (
    <section className="grid-backdrop">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-10"
        >
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Analyze content
          </h1>
          <p className="mt-3 text-muted leading-relaxed">
           Paste a news article, headline, or statement. TrustLens analyzes
text patterns learned from its training dataset and provides an ML-based classification.
          </p>
        </motion.div>

        <Analyzer />
      </div>
    </section>
  )
}
