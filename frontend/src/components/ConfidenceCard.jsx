export default function ConfidenceCard({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    danger: 'bg-danger/10 text-danger',
    success: 'bg-success/10 text-success',
  }

  return (
    <div className="rounded-2xl border border-slate-900/8 bg-white p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="mt-3 text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-display font-bold text-lg text-ink">{value}</p>
    </div>
  )
}
