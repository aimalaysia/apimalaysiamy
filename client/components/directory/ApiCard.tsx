import type { ApiEntry } from '../../types/index.ts'
import { useFavoritesStore } from '../../stores/index.ts'
import { countryFlag, COUNTRY_NAMES } from '../../services/api.ts'

const tierStyles: Record<string, { label: string; classes: string }> = {
  open: { label: 'Open', classes: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50' },
  commercial: { label: 'Commercial', classes: 'bg-amber-900/40 text-amber-300 border-amber-800/50' },
}

const authLabels: Record<string, string> = {
  none: 'No Auth',
  apiKey: 'API Key',
  oauth: 'OAuth',
  bearer: 'Bearer',
  token: 'Token',
  basic: 'Basic',
}

interface Props {
  api: ApiEntry
  onSelect: (api: ApiEntry) => void
}

function parseCountries(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ApiCard({ api, onSelect }: Props) {
  const { toggle, isFavorite } = useFavoritesStore()
  const fav = isFavorite(api.id)
  const countries = parseCountries(api.countries)
  const isWorking = !!api.verifiedAt
  const isTestable = api.copyable === true || api.copyable === 1

  return (
    <article
      onClick={() => onSelect(api)}
      className="group relative bg-[#11152e] border border-[#1e2440] rounded-xl p-4 sm:p-5 cursor-pointer hover:border-amber-500/40 hover:bg-[#1a1f3a] transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(api) } }}
      aria-label={`View details for ${api.title}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400/20 to-violet-500/20 border border-[#1e2440] flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
            {api.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
              {api.title}
            </h3>
            <p className="text-xs text-zinc-500 truncate">{api.provider}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggle(api.id) }}
          className={`shrink-0 text-lg transition-all duration-200 ${fav ? 'text-rose-400 scale-110' : 'text-zinc-600 hover:text-rose-400/60'}`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed min-h-[2.5em]">
        {api.description || 'No description available'}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {isWorking && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Working
          </span>
        )}
        {isTestable && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-900/30 text-amber-400 border border-amber-800/50 font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Testable
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tierStyles[api.tier] && (
          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${tierStyles[api.tier].classes}`}>
            {tierStyles[api.tier].label}
          </span>
        )}
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1e2440] text-zinc-400 border border-[#2e3460]">
          {authLabels[api.auth] || api.auth}
        </span>
        {api.pricing && (
          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
            api.pricing === 'free'
              ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'
              : api.pricing === 'freemium'
              ? 'bg-blue-900/30 text-blue-400 border-blue-800/50'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            {api.pricing}
          </span>
        )}
        {countries.map(c => (
          <span key={c} className="inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded-md bg-[#1e2440] border border-[#2e3460]" title={COUNTRY_NAMES[c] || c}>
            <span className="text-sm leading-none">{c === 'global' ? '\uD83C\uDF10' : countryFlag(c)}</span>
          </span>
        ))}
      </div>
    </article>
  )
}
