import { useFilterStore } from '../../stores/index.ts'
import { useCategories, useCountries } from '../../hooks/useApi.ts'
import { countryFlag, COUNTRY_NAMES, AUTH_TYPES, PRICING_TIERS } from '../../services/api.ts'

export function FilterBar() {
  const { category, country, auth, pricing, free, noAuth, working, testable, setFilter, resetFilters } = useFilterStore()
  const { data: catData } = useCategories()
  const { data: countriesData } = useCountries()
  const hasFilters = category || country || auth || pricing || free || noAuth

  const selectClass =
    'bg-[#11152e] border border-[#1e2440] rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors appearance-none cursor-pointer min-w-[130px]'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <select
          value={category || ''}
          onChange={e => setFilter('category', e.target.value || undefined)}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {catData?.categories.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={country || ''}
          onChange={e => setFilter('country', e.target.value || undefined)}
          className={selectClass}
          aria-label="Filter by country"
        >
          <option value="">All Countries</option>
          {(countriesData?.countries ?? []).map(c => (
            <option key={c} value={c}>
              {c === 'global' ? '\uD83C\uDF10 ' : `${countryFlag(c)} `}{COUNTRY_NAMES[c] || c}
            </option>
          ))}
        </select>

        <select
          value={auth || ''}
          onChange={e => setFilter('auth', e.target.value || undefined)}
          className={selectClass}
          aria-label="Filter by authentication type"
        >
          <option value="">All Auth Types</option>
          {AUTH_TYPES.map(a => (
            <option key={a} value={a}>{a === 'none' ? 'No Auth' : a}</option>
          ))}
        </select>

        <select
          value={pricing || ''}
          onChange={e => setFilter('pricing', e.target.value || undefined)}
          className={selectClass}
          aria-label="Filter by pricing tier"
        >
          <option value="">All Pricing</option>
          {PRICING_TIERS.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-zinc-400 cursor-pointer px-3 py-2 rounded-lg border border-[#1e2440] hover:border-[#2e3460] transition-colors whitespace-nowrap has-checked:border-emerald-600/50 has-checked:bg-emerald-900/20">
          <input
            type="checkbox"
            checked={free === 'true'}
            onChange={e => setFilter('free', e.target.checked ? 'true' : undefined)}
            className="rounded border-[#2e3460] bg-[#11152e] text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
            aria-label="Filter free APIs only"
          />
          Free
        </label>

        <label className="flex items-center gap-1.5 text-sm text-zinc-400 cursor-pointer px-3 py-2 rounded-lg border border-[#1e2440] hover:border-[#2e3460] transition-colors whitespace-nowrap has-checked:border-sky-600/50 has-checked:bg-sky-900/20">
          <input
            type="checkbox"
            checked={noAuth === 'true'}
            onChange={e => setFilter('noAuth', e.target.checked ? 'true' : undefined)}
            className="rounded border-[#2e3460] bg-[#11152e] text-sky-500 focus:ring-sky-500/30 focus:ring-offset-0"
            aria-label="Filter no authentication APIs only"
          />
          No Auth
        </label>

        <label className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer px-3 py-2 rounded-lg border border-emerald-700/50 bg-emerald-900/15 has-checked:bg-emerald-900/30 transition-colors whitespace-nowrap">
          <input
            type="checkbox"
            checked={working !== 'false'}
            onChange={e => setFilter('working', e.target.checked ? 'true' : 'false')}
            className="rounded border-[#2e3460] bg-[#11152e] text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
            aria-label="Show only verified working APIs"
          />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Working
        </label>

        <label className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer px-3 py-2 rounded-lg border border-amber-600/50 bg-amber-900/15 has-checked:bg-amber-900/30 transition-colors whitespace-nowrap">
          <input
            type="checkbox"
            checked={testable !== 'false'}
            onChange={e => setFilter('testable', e.target.checked ? 'true' : 'false')}
            className="rounded border-[#2e3460] bg-[#11152e] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
            aria-label="Show only testable copyable APIs"
          />
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Testable
        </label>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-zinc-500 hover:text-amber-400 transition-colors ml-1 px-2 py-1"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
