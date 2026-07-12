import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchApiById } from '../services/api.ts'
import { useMeta } from '../hooks/useMeta.ts'
import { ResponseViewer } from '../components/playground/ResponseViewer.tsx'

const DEFAULT_CODE = `// Paste or select an API, then edit the request below
fetch('/api/apis/example')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error)`

export function PlaygroundPage() {
  useMeta('API Playground', 'Test and experiment with Southeast Asian APIs directly in your browser. Send requests, view responses, and debug API integrations interactively.')
  const [searchParams] = useSearchParams()
  const apiId = searchParams.get('api')

  const [code, setCode] = useState(DEFAULT_CODE)
  const [rawText, setRawText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState<{
    status: number
    statusText: string
    contentType: string
    responseTime: number
    size: number
    endpoint: string
    method: string
  } | null>(null)

  const [splitPos, setSplitPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const handleSelectApi = useCallback(async () => {
    if (!apiId) return
    setLoading(true)
    setError('')
    setRawText('')
    setMeta(null)
    try {
      const api = await fetchApiById(apiId)
      const snippet = `// ${api.title}
// Auth: ${api.auth} | Pricing: ${api.pricing}
const response = await fetch('${api.baseUrl || api.docs || api.sourceUrl || '/api/apis/' + api.id}');
const data = await response.json();
console.log(data);`
      setCode(snippet)
    } catch {
      setError('Error loading API details')
    }
    setLoading(false)
  }, [apiId])

  const proxyUrl = useCallback((url: string) => {
    return `/api/proxy?url=${encodeURIComponent(url)}&_t=${Date.now()}`
  }, [])

  const handleRun = useCallback(async () => {
    setLoading(true)
    setRawText('')
    setError('')
    setMeta(null)
    const startTime = performance.now()

    try {
      const lines = code.split('\n')
      const rewritten = lines.map(line => {
        const match = line.match(/fetch\s*\(\s*['"]([^'"]+)['"]/)
        if (match) {
          const originalUrl = match[1]
          if (!originalUrl.startsWith('/api/')) {
            return line.replace(match[1], proxyUrl(originalUrl))
          }
        }
        return line
      }).join('\n')

      const fetchMatch = rewritten.match(/fetch\s*\(\s*['"]([^'"]+)['"]/)
      if (!fetchMatch) {
        setError('No fetch() call found in the code')
        setLoading(false)
        return
      }

      const url = fetchMatch[1]
      const methodMatch = rewritten.match(/method\s*:\s*['"]([^'"]+)['"]/)
      const method = (methodMatch ? methodMatch[1].toUpperCase() : 'GET')

      const res = await fetch(url, {
        method,
        signal: AbortSignal.timeout(30000),
      })
      const endTime = performance.now()
      const text = await res.text()

      setMeta({
        status: res.status,
        statusText: res.statusText || statusMessage(res.status),
        contentType: res.headers.get('Content-Type') || 'text/plain',
        responseTime: Math.round(endTime - startTime),
        size: new Blob([text]).size,
        endpoint: url.replace(/\/api\/proxy\?url=([^&]+).*/, (_, u) => decodeURIComponent(u)),
        method,
      })
      setRawText(text)
    } catch (err) {
      const endTime = performance.now()
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Timeout after 30 seconds')
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error — the server may be unreachable')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
      setMeta(prev => prev ? { ...prev, responseTime: Math.round(performance.now() - startTime) } : null)
    }
    setLoading(false)
  }, [code, proxyUrl])

  const handleMouseDown = useCallback(() => {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPos(Math.max(25, Math.min(75, pct)))
    }
    const handleMouseUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black text-base font-bold shadow-lg shadow-amber-500/20">
            P
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">API Playground</h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
          Test API calls right in your browser. Edit the code, then hit Run.
        </p>
      </div>

      {apiId && (
        <button
          onClick={handleSelectApi}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0a0e27] rounded-lg text-sm font-semibold disabled:opacity-50 transition-all duration-200"
        >
          Load {apiId} snippet
        </button>
      )}

      <div ref={containerRef} className="flex flex-col lg:flex-row gap-0 lg:gap-0 relative">
        <div className="flex-1 flex flex-col lg:min-w-0" style={{ width: '100%' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Request</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setCode(DEFAULT_CODE); setRawText(''); setError(''); setMeta(null) }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={handleRun}
                disabled={loading}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 text-[#0a0e27] rounded text-xs font-semibold transition-all duration-200"
              >
                {loading ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[250px] sm:h-[350px] bg-[#080c1e] border border-[#1e2440] rounded-xl p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all duration-200 whitespace-pre-wrap break-words"
            spellCheck={false}
          />
        </div>

        <div className="hidden lg:flex items-center justify-center w-3 cursor-col-resize shrink-0 group" onMouseDown={handleMouseDown}>
          <div className="w-0.5 h-8 rounded-full bg-zinc-700 group-hover:bg-amber-500/50 transition-colors" />
        </div>

        <div className="flex-1 flex flex-col lg:min-w-0 mt-4 lg:mt-0">
          <ResponseViewer
            rawText={rawText}
            meta={meta}
            error={error}
            onRun={handleRun}
            loading={loading}
          />
        </div>
      </div>

      <div className="mt-6 p-4 sm:p-5 bg-[#11152e] border border-[#1e2440] rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Tips</p>
        </div>
        <ul className="text-xs text-zinc-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-400/60 mt-0.5">•</span>
            <span>Use <code className="text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">fetch('URL')</code> to make requests</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400/60 mt-0.5">•</span>
            <span>Select an API from the <Link to="/" className="text-amber-400 hover:underline">directory</Link> or use the playground link in the detail panel</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400/60 mt-0.5">•</span>
            <span>External URLs are auto-proxied to avoid CORS; <strong>JSON</strong> tab has syntax-highlighted collapsible trees, <strong>Preview</strong> renders HTML live, <strong>Raw</strong> has search</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function statusMessage(code: number): string {
  const m: Record<number, string> = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 405: 'Method Not Allowed', 408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable', 504: 'Gateway Timeout',
  }
  return m[code] || 'Unknown'
}
