import useMetrics from '../hooks/useMetrics.js'

const toneMap = {
  'strong-success': 'bg-primary text-white',
  weak: 'bg-primary/8 text-ink',
}

export default function ConfusionMatrix() {
  const [[tn, fp], [fn, tp]] = useMetrics().confusion_matrix
  const cells = [
    { value: tn, tone: 'strong-success' },
    { value: fp, tone: 'weak' },
    { value: fn, tone: 'weak' },
    { value: tp, tone: 'strong-success' },
  ]

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-sm font-semibold text-secondary">Model evaluation</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Confusion matrix
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            How predictions compared against actual labels on the held-out test set.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-900/8 bg-white p-6 sm:p-8">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3 text-sm">
            <div />
            <div className="text-center text-xs font-semibold text-muted pb-1">Predicted Fake</div>
            <div className="text-center text-xs font-semibold text-muted pb-1">Predicted Real</div>

            <div className="flex items-center text-xs font-semibold text-muted pr-2">Actual Fake</div>
            <MatrixCell value={cells[0].value} tone={cells[0].tone} />
            <MatrixCell value={cells[1].value} tone={cells[1].tone} />

            <div className="flex items-center text-xs font-semibold text-muted pr-2">Actual Real</div>
            <MatrixCell value={cells[2].value} tone={cells[2].tone} />
            <MatrixCell value={cells[3].value} tone={cells[3].tone} />
          </div>
          <p className="mt-6 text-xs text-muted">
            Values reflect performance on the reserved test split described above, not real-world accuracy.
          </p>
        </div>
      </div>
    </section>
  )
}

function MatrixCell({ value, tone }) {
  return (
    <div className={`rounded-xl py-6 text-center font-display font-bold text-lg ${toneMap[tone]}`}>
      {value.toLocaleString()}
    </div>
  )
}
