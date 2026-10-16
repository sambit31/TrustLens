import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, PlayCircle, ShieldCheck, Eye } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden grid-backdrop">
      {/* floating gradient blobs */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-10 right-0 w-[28rem] h-[28rem] rounded-full bg-accent/15 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Trust &amp; Verification
          </span>

          <h1 className="mt-6 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-ink">
            Know what to <span className="gradient-text">trust.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted leading-relaxed">
            Analyze news and documents with AI-powered linguistic analysis, confidence scoring, and transparent risk insights.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-semibold px-7 py-3.5 shadow-[0_10px_28px_rgba(91,95,239,0.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(91,95,239,0.45)] transition-all"
            >
              Analyze Content
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-7 py-3.5 font-semibold text-ink hover:border-slate-900/20 hover:bg-slate-50 transition-colors"
            >
              <PlayCircle className="w-4.5 h-4.5 text-secondary" />
              How It Works
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="relative glass-card rounded-3xl p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] overflow-hidden">
            <div className="scan-line" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-display font-bold text-sm tracking-wide text-ink">Trust Analysis</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live scan
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#trustGrad)" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={264}
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 * (1 - 0.92) }}
                    transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
                  />
                  <defs>
                    <linearGradient id="trustGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5B5FEF" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-extrabold text-xl text-ink">92%</span>
                  <span className="text-[10px] text-muted">confidence</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <MetricRow label="Content Signal" value="LOW RISK" color="text-success" />
                <MetricRow label="Source Pattern" value="NORMAL" color="text-primary" />
                <MetricRow label="Text Consistency" value="HIGH" color="text-accent" />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-900/8 flex items-center gap-2 text-xs text-muted">
              <Eye className="w-3.5 h-3.5" />
              Sample visualization &middot; results vary by content analyzed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function MetricRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}
