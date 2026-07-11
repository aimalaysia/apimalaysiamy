import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Directory' },
  { path: '/playground', label: 'Playground' },
  { path: '/submit', label: 'Submit' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0e27]/80 border-b border-[#1e2440]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs font-bold">
              M
            </span>
            <span className="font-heading font-semibold text-base text-white">
              My<span className="text-amber-400">API</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1f3a]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
