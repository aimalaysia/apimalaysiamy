export function Footer() {
  return (
    <footer className="border-t border-[#1e2440] py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs font-bold">
              M
            </span>
            <span className="text-sm font-heading font-semibold text-zinc-300">
              My<span className="text-amber-400">API</span>
            </span>
          </div>
          <p className="text-sm text-zinc-500 text-center">
          Open-source API directory for Southeast Asia — built with React + Hono + SQLite
          </p>
          <p className="text-xs text-zinc-600">Open source — MIT License</p>
        </div>
      </div>
    </footer>
  )
}
