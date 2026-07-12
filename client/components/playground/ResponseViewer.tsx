import { useState, useMemo, useRef, useCallback } from 'react'
import { JsonTree } from './JsonTree.tsx'

type Tab = 'json' | 'preview' | 'raw'

interface ResponseMeta {
  status: number
  statusText: string
  contentType: string
  responseTime: number
  size: number
  endpoint: string
  method: string
}

interface Props {
  rawText: string
  meta: ResponseMeta | null
  error: string
  onRun: () => void
  loading: boolean
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function detectContentType(meta: ResponseMeta | null, rawText: string): Tab {
  if (!meta) return 'json'
  const ct = meta.contentType.toLowerCase()
  if (ct.includes('application/json') || ct.includes('+json')) return 'json'
  if (ct.includes('text/html')) return 'preview'
  if (ct.startsWith('image/')) return 'preview'
  if (ct.includes('text/')) return 'raw'
  try { JSON.parse(rawText); return 'json' } catch { return 'raw' }
}

export function ResponseViewer({ rawText, meta, error, onRun, loading }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('json')
  const [searchQuery, setSearchQuery] = useState('')
  const [allCollapsed, setAllCollapsed] = useState(false)
  const rawRef = useRef<HTMLPreElement>(null)

  const detectedTab = useMemo(() => detectContentType(meta, rawText), [meta, rawText])

  const hasContent = !!rawText

  const isHtml = useMemo(() => {
    if (!meta) return false
    return /html/i.test(meta.contentType)
  }, [meta])

  const isImage = useMemo(() => {
    if (!meta) return false
    return meta.contentType.startsWith('image/')
  }, [meta])

  const formattedJson = useMemo(() => {
    if (!rawText) return null
    try {
      const parsed = JSON.parse(rawText)
      return parsed
    } catch {
      return null
    }
  }, [rawText])

  const statusColor = meta
    ? meta.status < 300 ? 'text-emerald-400'
      : meta.status < 400 ? 'text-amber-400'
      : 'text-rose-400'
    : ''

  const handleCopy = useCallback(async () => {
    const text = activeTab === 'json' && formattedJson
      ? JSON.stringify(formattedJson, null, 2)
      : rawText
    if (text) await navigator.clipboard.writeText(text)
  }, [activeTab, formattedJson, rawText])

  const handleDownload = useCallback(() => {
    const text = activeTab === 'json' && formattedJson
      ? JSON.stringify(formattedJson, null, 2)
      : rawText
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response.${activeTab === 'json' ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeTab, formattedJson, rawText])

  const matchingLines = useMemo(() => {
    if (!searchQuery || !rawText) return 0
    const lower = searchQuery.toLowerCase()
    return rawText.toLowerCase().split('\n').filter(l => l.includes(lower)).length
  }, [searchQuery, rawText])

  if (!hasContent && !error) {
    return (
      <div className="flex-1 flex items-center justify-center h-[300px] sm:h-[400px] bg-[#080c1e] border border-[#1e2440] rounded-xl">
        <p className="text-zinc-600 text-sm">Hit Run to see the response</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#080c1e] border border-[#1e2440] rounded-xl overflow-hidden min-h-[300px] sm:min-h-[400px]">
      {meta && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 bg-[#11152e] border-b border-[#1e2440] text-xs font-mono">
          <span className={`font-semibold ${statusColor}`}>
            {meta.status} {meta.statusText}
          </span>
          <span className="text-zinc-500">{meta.method}</span>
          <span className="text-zinc-500 max-w-[200px] truncate" title={meta.endpoint}>{meta.endpoint}</span>
          <span className="text-zinc-500">{meta.responseTime}ms</span>
          <span className="text-zinc-500">{formatSize(meta.size)}</span>
          <span className="text-zinc-600 truncate max-w-[150px]" title={meta.contentType}>{meta.contentType}</span>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e2440] bg-[#0a0e27]">
        <div className="flex gap-0.5">
          {(['json', 'preview', 'raw'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'json' ? 'JSON' : tab === 'preview' ? 'Preview' : 'Raw'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'json' && formattedJson && (
            <>
              <button
                onClick={() => setAllCollapsed(c => !c)}
                className="text-[10px] px-2 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={allCollapsed ? 'Expand all' : 'Collapse all'}
              >
                {allCollapsed ? '▸▸' : '▾▾'}
              </button>
            </>
          )}
          {activeTab === 'raw' && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-[120px] bg-[#11152e] border border-[#1e2440] rounded px-2 py-0.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <span className="text-[10px] text-zinc-600">{matchingLines} hits</span>
              )}
            </div>
          )}
          {hasContent && (
            <>
              <button onClick={handleCopy} className="text-[10px] px-2 py-1 text-zinc-500 hover:text-zinc-300 transition-colors" title="Copy">Copy</button>
              <button onClick={handleDownload} className="text-[10px] px-2 py-1 text-zinc-500 hover:text-zinc-300 transition-colors" title="Download">DL</button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {error && !rawText && (
          <div className="p-4 text-sm font-mono">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-400 font-semibold text-xs uppercase tracking-wider">Error</span>
            </div>
            <p className="text-zinc-400 whitespace-pre-wrap break-words">{error}</p>
          </div>
        )}

        {activeTab === 'json' && (
          formattedJson ? (
            <div className="p-4 text-sm font-mono leading-6 whitespace-pre-wrap break-words overflow-x-hidden">
              <JsonTree
                data={formattedJson}
                initialCollapsed={allCollapsed}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm p-4">
              {isHtml
                ? 'This response is HTML. Switch to Preview or Raw tab.'
                : 'Response is not valid JSON'}
            </div>
          )
        )}

        {activeTab === 'preview' && (
          isHtml ? (
            <iframe
              srcDoc={rawText}
              className="w-full h-full min-h-[400px] border-0 bg-white"
              title="HTML Preview"
              sandbox="allow-same-origin"
            />
          ) : isImage ? (
            <div className="flex items-center justify-center p-4 h-full">
              <img src={`data:${meta?.contentType || 'image/png'};base64,${btoa(rawText)}`} alt="Response preview" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm p-4">
              No visual preview available for this response type.
            </div>
          )
        )}

        {activeTab === 'raw' && (
          <pre
            ref={rawRef}
            className="p-4 text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words overflow-x-hidden m-0"
          >
            {searchQuery
              ? rawText.split('\n').map((line, i) => {
                  const lower = line.toLowerCase()
                  const q = searchQuery.toLowerCase()
                  const idx = lower.indexOf(q)
                  if (idx === -1) return <div key={i}>{line}</div>
                  return (
                    <div key={i}>
                      {line.slice(0, idx)}
                      <span className="bg-amber-500/30 text-amber-200 rounded">{line.slice(idx, idx + q.length)}</span>
                      {line.slice(idx + q.length)}
                    </div>
                  )
                })
              : rawText
            }
          </pre>
        )}
      </div>
    </div>
  )
}
