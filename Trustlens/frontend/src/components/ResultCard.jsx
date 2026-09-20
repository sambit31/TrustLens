import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Percent, Gauge, Info } from 'lucide-react'
import ProbabilityChart from './ProbabilityChart.jsx'
import ConfidenceCard from './ConfidenceCard.jsx'

export default function ResultCard({ result }) {
 const prediction = result?.prediction || 'Unknown'

const fake_probability = Number(result?.fake_probability || 0)

const real_probability = Number(result?.real_probability || 0)
const isFake = prediction.toLowerCase().includes('fake')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div
        className={`rounded-2xl p-6 sm:p-7 border ${
          isFake ? 'bg-danger/6 border-danger/20' : 'bg-success/6 border-success/20'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
              isFake ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
            }`}
          >
            {isFake ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Analysis complete</span>
            <h3 className="mt-1 font-display font-extrabold text-2xl text-ink">
               ML Classification: {prediction}
            </h3>
            <span
              className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                isFake ? 'bg-danger/12 text-danger' : 'bg-success/12 text-success'
              }`}
            >
             {isFake ? 'Suspicious Pattern Detected' : 'Lower Risk Pattern'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-display font-bold text-base text-ink mb-4">Model Prediction Confidence</h4>
        <ProbabilityChart fake={fake_probability} real={real_probability} />
      </div>

      <div>
        <h4 className="font-display font-bold text-base text-ink mb-4">Analysis breakdown</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <ConfidenceCard icon={Gauge} label="Model Classification" value={prediction} tone={isFake ? 'danger' : 'success'} />
          <ConfidenceCard icon={AlertTriangle} label="Fake Probability" value={`${fake_probability.toFixed(2)}%`} tone="danger" />
          <ConfidenceCard icon={Percent} label="Real Probability" value={`${real_probability.toFixed(2)}%`} tone="success" />
        </div>
      </div>

      <div className="flex gap-3 rounded-xl bg-slate-50 border border-slate-900/8 p-4 text-xs text-muted leading-relaxed">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p>
          The result represents a machine-learning classification based on patterns learned from the training
          dataset. TrustLens provides a machine-learning based classification. It does not independently verify
          facts or guarantee the authenticity of information.
        </p>
      </div>
    </motion.div>
  )
}
