import { useState, useCallback } from 'react'
import type { ApiEntry } from '../types/index.ts'
import { ApiCardGrid } from '../../components/directory/ApiCardGrid.tsx'
import { DetailPanel } from '../../components/detail/DetailPanel.tsx'

export function DirectoryPage() {
  const [selected, setSelected] = useState<ApiEntry | null>(null)

  const handleSelect = useCallback((api: ApiEntry) => {
    setSelected(api)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black text-lg font-bold shadow-lg shadow-amber-500/20">
            M
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              My<span className="text-amber-400">API</span> Directory
            </h1>
          </div>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
          Discover and test APIs from across Southeast Asia — Malaysia, Singapore, Indonesia & Thailand.
          Every API you need to build regionally.
        </p>
      </div>
      <ApiCardGrid onSelect={handleSelect} />
      {selected && (
        <DetailPanel api={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
