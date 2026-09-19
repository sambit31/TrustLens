import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-slate-900/8 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 grid sm:grid-cols-3 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted max-w-xs">
            See beyond the story. AI-powered signals for digital trust.
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-ink mb-3">Navigate</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/analyze" className="hover:text-primary">Analyze</Link></li>
            <li><Link to="/how-it-works" className="hover:text-primary">How It Works</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-sm text-ink mb-3">Project</h4>
          <p className="text-sm text-muted leading-relaxed">
            TrustLens is an academic AI/ML project. It provides ML-based classification, not independent
            fact verification.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-900/8 py-5 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} TrustLens &middot; Built for academic demonstration
      </div>
    </footer>
  )
}
