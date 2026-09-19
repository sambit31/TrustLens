import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(15,23,42,0.06)]' : 'bg-white/60 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between" aria-label="Primary">
        <Link to="/" aria-label="TrustLens home">
          <Logo />
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/8' : 'text-muted hover:text-ink hover:bg-slate-900/5'
                  }`
                }
                end={l.to === '/'}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/analyze"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-5 py-2.5 shadow-[0_6px_18px_rgba(91,95,239,0.32)] hover:shadow-[0_8px_22px_rgba(91,95,239,0.42)] hover:-translate-y-0.5 transition-all"
        >
          Analyze Now
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          className="md:hidden p-2 rounded-lg text-ink hover:bg-slate-900/5"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-900/5 bg-white/95 backdrop-blur-md px-5 pb-5 pt-2">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-base font-medium ${
                      isActive ? 'text-primary bg-primary/8' : 'text-ink hover:bg-slate-900/5'
                    }`
                  }
                  end={l.to === '/'}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/analyze"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-5 py-3 w-full"
          >
            Analyze Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  )
}
