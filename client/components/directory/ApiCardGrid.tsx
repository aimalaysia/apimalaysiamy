import { useFilterStore } from '../../stores/index.ts'
import { useSearch } from '../../hooks/useApi.ts'
import type { ApiEntry } from '../../types/index.ts'
import { SearchBar } from './SearchBar.tsx'
import { FilterBar } from './FilterBar.tsx'
import { ApiCard } from './ApiCard.tsx'

interface Props {
  onSelect: (api: ApiEntry) => void
}

export function ApiCardGrid({ onSelect }: Props) {
  const filters = useFilterStore()
  const { data, isLoading, error } = useSearch(filters)

  return (
    <div className="space-y-4 sm:space-y-5">
      <SearchBar />
      <FilterBar />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading APIs...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-900/30 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-rose-400 text-sm font-medium">Failed to load APIs</p>
          <p className="text-zinc-500 text-xs mt-1">Make sure the server is running</p>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-300 font-medium">{data.count}</span> API{data.count === 1 ? '' : 's'} found
              {filters.q && (
                <span> for "<span className="text-zinc-300">{filters.q}</span>"</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.apis.map(api => (
              <ApiCard key={api.id} api={api} onSelect={onSelect} />
            ))}
          </div>
          {data.apis.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm font-medium">No APIs match your filters</p>
              <p className="text-zinc-500 text-xs mt-1">Try a different search or clear filters</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
