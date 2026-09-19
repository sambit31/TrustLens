import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { label: 'Accuracy', value: 98.36 },
  { label: 'Precision', value: 98.01 },
  { label: 'Recall', value: 99.02 },
  { label: 'F1 Score', value: 98.51 },
]

function Counter({ target }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame
    const start = performance.now()
    const duration = 1200
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(target * progress)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target])

  return (
    <span ref={ref} className="font-display font-extrabold text-4xl sm:text-5xl gradient-text">
      {value.toFixed(2)}%
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 sm:py-28 bg-ink text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-backdrop opacity-[0.08]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-accent">Evaluation on held-out test data</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
            Measured against data the model never trained on
          </h2>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-xl">
            These figures describe performance on a reserved test split, not real-world accuracy across every
            possible article. Treat them as a benchmark of model quality, not a guarantee.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <Counter target={s.value} />
              <p className="mt-2 text-sm text-slate-300">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
