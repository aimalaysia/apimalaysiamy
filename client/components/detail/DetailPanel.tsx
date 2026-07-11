import type { ApiEntry } from '../../types/index.ts'
import { useFavoritesStore } from '../../stores/index.ts'
import { COUNTRY_NAMES } from '../../services/api.ts'

const authDescriptions: Record<string, string> = {
  none: 'No Auth Required',
  apiKey: 'API Key',
  oauth: 'OAuth 2.0',
  bearer: 'Bearer Token',
  token: 'Token',
  basic: 'HTTP Basic',
}

interface Props {
  api: ApiEntry
  onClose: () => void
}

export function DetailPanel({ api, onClose }: Props) {
  const countries: string[] = JSON.parse(api.countries || '[]')
  const { toggle, isFavorite } = useFavoritesStore()
  const fav = isFavorite(api.id)
  const isWorking = !!api.verifiedAt
  const isTestable = api.copyable === true || api.copyable === 1

  const snippets = [
    {
      label: 'cURL',
      code: `curl '${api.baseUrl || api.docs || api.sourceUrl || ''}'`,
    },
    {
      label: 'JavaScript',
      code: `fetch('${api.baseUrl || api.docs || api.sourceUrl || ''}')\n  .then(r => r.json())\n  .then(console.log)`,
    },
    {
      label: 'Python',
      code: `import requests\n\nr = requests.get('${api.baseUrl || api.docs || api.sourceUrl || ''}')\nprint(r.json())`,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-[#0a0e27] border sm:border-l border-[#1e2440] sm:h-full max-h-[85vh] sm:max-h-full overflow-y-auto shadow-2xl rounded-t-2xl sm:rounded-none">
        <div className="sticky top-0 bg-[#0a0e27]/95 backdrop-blur border-b border-[#1e2440] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-violet-500/20 border border-[#1e2440] flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
              {api.title.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base sm:text-lg font-heading font-semibold text-white truncate">{api.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); toggle(api.id) }}
              className={`p-2 rounded-lg transition-all ${fav ? 'text-rose-400' : 'text-zinc-500 hover:text-rose-400/60'}`}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1a1f3a] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              api.tier === 'open'
                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50'
                : 'bg-amber-900/40 text-amber-300 border-amber-800/50'
            }`}>
              {api.tier === 'open' ? 'Open Data' : 'Commercial'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50">
              {api.kind}
            </span>
            {isWorking && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Working
              </span>
            )}
            {isTestable && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/50 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Testable
              </span>
            )}
            {countries.map(c => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-[#1e2440] text-zinc-400 border border-[#2e3460]">
                {COUNTRY_NAMES[c] || c}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Provider</p>
              <p className="text-zinc-200">{api.provider}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Auth</p>
              <p className="text-zinc-200">{authDescriptions[api.auth] || api.auth}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Pricing</p>
              <p className="text-zinc-200 capitalize">{api.pricing}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Category</p>
              <p className="text-zinc-200">{api.category}</p>
            </div>
          </div>

          {api.description && (
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Description</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{api.description}</p>
            </div>
          )}

          {api.note && (
            <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 sm:p-4 text-sm text-amber-300">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{api.note}</span>
              </div>
            </div>
          )}

          {api.frequency && (
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1 font-medium">Update Frequency</p>
              <p className="text-zinc-300 text-sm">{api.frequency}</p>
            </div>
          )}

          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-medium">Quick Start</p>
            <div className="space-y-2">
              {snippets.map(({ label, code }) => (
                <div key={label} className="relative group">
                  <div className="flex items-center justify-between bg-[#080c1e] rounded-t-lg px-3 py-1.5 border border-[#1e2440] border-b-0">
                    <span className="text-xs text-zinc-500 font-mono">{label}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-xs text-zinc-600 hover:text-amber-400 transition-colors font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-[#080c1e] rounded-b-lg px-3 py-3 overflow-x-auto text-xs text-zinc-300 font-mono border border-[#1e2440] leading-relaxed">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {api.docs && (
              <a
                href={api.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0a0e27] rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20"
              >
                View Documentation
              </a>
            )}
            <a
              href={`/playground?api=${api.id}`}
              className="flex-1 text-center px-4 py-2.5 border border-[#1e2440] hover:border-amber-500/50 text-zinc-300 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#1a1f3a]"
            >
              Try in Playground
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
