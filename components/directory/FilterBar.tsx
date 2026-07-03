import { useFilterStore } from '../../client/stores/index.ts'
import { useCategories } from '../../client/hooks/useApi.ts'
import { COUNTRIES, COUNTRY_NAMES, AUTH_TYPES, PRICING_TIERS } from '../../client/services/api.ts'

export function FilterBar() {
  const { category, country, auth, pricing, free, noAuth, setFilter, resetFilters } = useFilterStore()
  const { data: catData } = useCategories()
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
        >
          <option value="">All Countries</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
          ))}
        </select>

        <select
          value={auth || ''}
          onChange={e => setFilter('auth', e.target.value || undefined)}
          className={selectClass}
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
        >
          <option value="">All Pricing</option>
          {PRICING_TIERS.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-zinc-400 cursor-pointer px-3 py-2 rounded-lg border border-[#1e2440] hover:border-[#2e3460] transition-colors whitespace-nowrap">
          <input
            type="checkbox"
            checked={free === 'true'}
            onChange={e => setFilter('free', e.target.checked ? 'true' : undefined)}
            className="rounded border-[#2e3460] bg-[#11152e] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
          />
          Free
        </label>

        <label className="flex items-center gap-1.5 text-sm text-zinc-400 cursor-pointer px-3 py-2 rounded-lg border border-[#1e2440] hover:border-[#2e3460] transition-colors whitespace-nowrap">
          <input
            type="checkbox"
            checked={noAuth === 'true'}
            onChange={e => setFilter('noAuth', e.target.checked ? 'true' : undefined)}
            className="rounded border-[#2e3460] bg-[#11152e] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
          />
          No Auth
        </label>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-zinc-500 hover:text-amber-400 transition-colors ml-1 px-2 py-1"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
