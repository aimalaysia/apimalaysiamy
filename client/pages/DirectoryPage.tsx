import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ApiEntry } from '../types/index.ts'
import { fetchApiById } from '../services/api.ts'
import { useMeta } from '../hooks/useMeta.ts'
import { ApiCardGrid } from '../components/directory/ApiCardGrid.tsx'
import { DetailPanel } from '../components/detail/DetailPanel.tsx'

export function DirectoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ApiEntry | null>(null)

  const metaTitle = selected
    ? `${selected.title} — MyAPI`
    : undefined
  const metaDesc = selected
    ? `Explore the ${selected.title} API by ${selected.provider}. ${selected.auth === 'none' ? 'No authentication required. ' : `${selected.auth} authentication. `}${selected.pricing === 'free' ? 'Free to use.' : `${selected.pricing} pricing.`}`
    : 'Browse 1,400+ APIs from Malaysia, Singapore, Indonesia, Thailand, and Southeast Asia. Filter by category, country, authentication, pricing, and more.'
  useMeta(metaTitle, metaDesc)

  useEffect(() => {
    if (!slug) { setSelected(null); return }
    fetchApiById(slug).then(setSelected).catch(() => {})
  }, [slug])

  const handleSelect = useCallback((api: ApiEntry) => {
    setSelected(api)
    window.history.replaceState(null, '', `/api/${api.slug}`)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelected(null)
    navigate('/', { replace: true })
  }, [navigate])

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
        <p className="text-zinc-400 text-sm sm:text-base max-w-3xl leading-relaxed">
          Discover, explore, and test APIs from across Southeast Asia, including Malaysia, Singapore, Indonesia, Thailand, and other neighbouring countries. Access a curated collection of reliable, testable APIs for education, research, rapid prototyping, and regional application development. This platform is intended for <span className="text-zinc-300">educational and learning purposes only</span>, helping developers understand, evaluate, and integrate APIs from the Southeast Asian ecosystem.
        </p>
      </div>
      <ApiCardGrid onSelect={handleSelect} />
      {selected && (
        <DetailPanel api={selected} onClose={handleCloseDetail} />
      )}
    </div>
  )
}
