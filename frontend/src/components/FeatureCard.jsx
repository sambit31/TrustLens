import { motion } from 'framer-motion'

export default function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl bg-white border border-slate-900/8 p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_32px_-8px_rgba(15,23,42,0.12)] transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${gradient}`}
      >
        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <h3 className="font-display font-bold text-lg text-ink mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </motion.div>
  )
}
