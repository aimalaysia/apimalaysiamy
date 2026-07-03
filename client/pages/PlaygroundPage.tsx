import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchApiById } from '../services/api.ts'

const DEFAULT_CODE = `// Paste or select an API, then edit the request below
fetch('/api/apis/example')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error)`

export function PlaygroundPage() {
  const [searchParams] = useSearchParams()
  const apiId = searchParams.get('api')

  const [code, setCode] = useState(DEFAULT_CODE)
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSelectApi = async () => {
    if (!apiId) return
    setLoading(true)
    try {
      const api = await fetchApiById(apiId)
      const snippet = `// ${api.title}
// Auth: ${api.auth} | Pricing: ${api.pricing}
const response = await fetch('${api.baseUrl || api.docs || api.sourceUrl || '/api/apis/' + api.id}');
const data = await response.json();
console.log(data);`
      setCode(snippet)
      setResponse('')
    } catch {
      setResponse('// Error loading API details')
    }
    setLoading(false)
  }

  const handleRun = async () => {
    setLoading(true)
    setResponse('// Running...')
    try {
      const match = code.match(/fetch\s*\(\s*['"]([^'"]+)['"]/)
      if (match) {
        const url = match[1]
        const res = await fetch(url)
        const text = await res.text()
        try {
          setResponse(JSON.stringify(JSON.parse(text), null, 2))
        } catch {
          setResponse(text)
        }
      } else {
        setResponse('// No fetch() call found in the code')
      }
    } catch (err) {
      setResponse(`// Error: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
    setLoading(false)
  }

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

        <div className="flex-1 space-y-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Response</label>
          <pre className="w-full h-[300px] sm:h-[400px] bg-[#080c1e] border border-[#1e2440] rounded-xl p-4 overflow-auto text-sm font-mono text-zinc-300">
            <code>{response || '// Hit Run to see the response'}</code>
          </pre>
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
            <span>CORS-restricted endpoints may not work from the browser playground</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
