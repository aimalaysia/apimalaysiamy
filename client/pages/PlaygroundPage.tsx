import { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchApiById } from '../services/api.ts'
import { useMeta } from '../hooks/useMeta.ts'

const DEFAULT_CODE = `// Paste or select an API, then edit the request below
fetch('/api/apis/example')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error)`

type ResponseTab = 'json' | 'preview' | 'raw'

export function PlaygroundPage() {
  useMeta('API Playground', 'Test and experiment with Southeast Asian APIs directly in your browser. Send requests, view responses, and debug API integrations interactively.')
  const [searchParams] = useSearchParams()
  const apiId = searchParams.get('api')

  const [code, setCode] = useState(DEFAULT_CODE)
  const [rawText, setRawText] = useState('')
  const [contentType, setContentType] = useState('')
  const [activeTab, setActiveTab] = useState<ResponseTab>('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isHtml = /html/i.test(contentType)

  const handleSelectApi = async () => {
    if (!apiId) return
    setLoading(true)
    setError('')
    try {
      const api = await fetchApiById(apiId)
      const snippet = `// ${api.title}
// Auth: ${api.auth} | Pricing: ${api.pricing}
const response = await fetch('${api.baseUrl || api.docs || api.sourceUrl || '/api/apis/' + api.id}');
const data = await response.json();
console.log(data);`
      setCode(snippet)
      setRawText('')
      setContentType('')
      setActiveTab('json')
    } catch {
      setError('Error loading API details')
    }
    setLoading(false)
  }

  function proxyUrl(url: string): string {
    return `/api/proxy?url=${encodeURIComponent(url)}&_t=${Date.now()}`
  }

  const handleRun = async () => {
    setLoading(true)
    setRawText('')
    setContentType('')
    setError('')
    setActiveTab('json')
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
      if (fetchMatch) {
        const url = fetchMatch[1]
        const res = await fetch(url)
        const text = await res.text()
        setRawText(text)
        setContentType(res.headers.get('Content-Type') || '')
        if (isHtml) setActiveTab('preview')
      } else {
        setError('No fetch() call found in the code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
    setLoading(false)
  }

  const formattedJson = (() => {
    try { return JSON.stringify(JSON.parse(rawText), null, 2) } catch { return '' }
  })()

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

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Request</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(DEFAULT_CODE)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
              >
                Reset
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
            className="w-full h-[300px] sm:h-[400px] bg-[#080c1e] border border-[#1e2440] rounded-xl p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all duration-200"
            spellCheck={false}
          />
        </div>

        <div className="flex-1 space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-[#11152e] border border-[#1e2440] rounded-lg p-0.5">
              {(['json', 'preview', 'raw'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'json' ? 'JSON' : tab === 'preview' ? 'Preview' : 'Raw'}
                </button>
              ))}
            </div>
            {contentType && (
              <span className="text-[10px] text-zinc-600 truncate max-w-[200px] text-right">{contentType}</span>
            )}
          </div>

          <div className="flex-1 min-h-[300px] sm:min-h-[400px] bg-[#080c1e] border border-[#1e2440] rounded-xl overflow-hidden">
            {!rawText && !error && (
              <div className="flex items-center justify-center h-[300px] sm:h-[400px] text-zinc-600 text-sm">
                Hit Run to see the response
              </div>
            )}

            {error && !rawText && (
              <div className="p-4 text-sm font-mono text-rose-400 whitespace-pre-wrap break-words">
                {error}
              </div>
            )}

            {rawText && activeTab === 'json' && (
              <pre className="w-full h-[300px] sm:h-[400px] p-4 overflow-auto text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words m-0">
                {formattedJson || rawText}
              </pre>
            )}

            {rawText && activeTab === 'raw' && (
              <pre className="w-full h-[300px] sm:h-[400px] p-4 overflow-auto text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words m-0">
                {rawText}
              </pre>
            )}

            {rawText && activeTab === 'preview' && (
              isHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={rawText}
                  className="w-full h-[300px] sm:h-[400px] border-0 bg-white"
                  title="HTML Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <pre className="w-full h-[300px] sm:h-[400px] p-4 overflow-auto text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words m-0">
                  {formattedJson || rawText}
                </pre>
              )
            )}
          </div>
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
            <span>External URLs are automatically proxied through the server to avoid CORS issues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400/60 mt-0.5">•</span>
            <span>HTML responses render live in the <strong>Preview</strong> tab; JSON auto-formats in the <strong>JSON</strong> tab</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
