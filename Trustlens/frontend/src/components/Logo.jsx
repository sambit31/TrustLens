import { ShieldCheck } from 'lucide-react'

export default function Logo({ size = 'md' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const text = size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${dims} rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-[0_4px_16px_rgba(91,95,239,0.35)]`}>
        <ShieldCheck className="w-[58%] h-[58%] text-white" strokeWidth={2.4} />
        <span className="absolute w-2 h-2 rounded-full bg-white/90 top-1.5 right-1.5" />
      </div>
      <div className="leading-none">
        <span className={`font-display font-extrabold tracking-tight text-ink ${text}`}>
          Trust<span className="gradient-text">Lens</span>
        </span>
      </div>
    </div>
  )
}
