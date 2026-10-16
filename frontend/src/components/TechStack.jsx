import { Code2, Server, Cpu, Sigma, GitBranch, Atom, Palette, Database } from 'lucide-react'

const techs = [
  { name: 'Python', icon: Code2 },
  { name: 'FastAPI', icon: Server },
  { name: 'scikit-learn', icon: Cpu },
  { name: 'TF-IDF', icon: Sigma },
  { name: 'Logistic Regression', icon: GitBranch },
  { name: 'React', icon: Atom },
  { name: 'Tailwind CSS', icon: Palette },
  { name: 'MongoDB', icon: Database },
]

export default function TechStack() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-semibold text-primary">Under the hood</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Built with modern AI engineering
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {techs.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-900/8 bg-white p-5 flex flex-col items-center justify-center gap-3 text-center hover:border-primary/30 hover:shadow-[0_10px_24px_-8px_rgba(91,95,239,0.18)] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <t.icon className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium text-ink">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
