import { useRef } from 'react'
import { useFilterStore } from '../../stores/index.ts'

export function SearchBar() {
  const { q, setFilter } = useFilterStore()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={e => setFilter('q', e.target.value)}
          placeholder="Search APIs by name, category, provider..."
          className="w-full pl-12 pr-10 py-3 bg-[#11152e] border border-[#1e2440] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200 text-sm"
        />
        {q && (
          <button
            onClick={() => { setFilter('q', ''); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
