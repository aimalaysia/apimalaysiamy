import { useState, useCallback } from 'react'

interface JsonTreeProps {
  data: unknown
  initialCollapsed?: boolean
  depth?: number
  keyName?: string
  searchQuery?: string
}

function highlightSearch(text: string, query: string | undefined) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return text.slice(0, idx) + '▍' + text.slice(idx, idx + query.length) + '▍' + text.slice(idx + query.length)
}

export function JsonTree({ data, initialCollapsed = false, depth = 0, keyName, searchQuery }: JsonTreeProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed && depth > 0)
  const toggle = useCallback(() => setCollapsed(c => !c), [])

  if (data === null) return <span className="text-violet-400">null</span>
  if (data === undefined) return <span className="text-zinc-600">undefined</span>

  const t = typeof data

  if (t === 'string') {
    const display = JSON.stringify(data)
    const highlighted = highlightSearch(display, searchQuery)
    return <span className="text-emerald-300 break-all">{highlighted}</span>
  }

  if (t === 'number') return <span className="text-sky-400">{String(data)}</span>
  if (t === 'boolean') return <span className="text-amber-400">{String(data)}</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-zinc-500">[]</span>
    const isSimple = data.length <= 5 && data.every(v => typeof v !== 'object' || v === null)
    const prefix = `[${data.length}]`

    if (collapsed) {
      return (
        <span className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-600 text-xs">{prefix}</span>
          <span className="text-zinc-500">[</span>
          <span className="text-zinc-500 text-xs">...</span>
          <span className="text-zinc-500">]</span>
          <span className="text-zinc-600 text-xs ml-1">{data.length} item{data.length !== 1 ? 's' : ''}</span>
        </span>
      )
    }

    return (
      <>
        <span className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-500">[</span>
          <span className="text-zinc-600 text-xs ml-1">{prefix}</span>
        </span>
        <div className="ml-4 pl-3 border-l border-zinc-800">
          {data.map((item, i) => (
            <div key={i} className="leading-6 hover:bg-zinc-900/50 rounded px-1">
              {isSimple ? (
                <>
                  <JsonTree data={item} depth={depth + 1} searchQuery={searchQuery} />
                  {i < data.length - 1 && <span className="text-zinc-600">,</span>}
                </>
              ) : (
                <>
                  <span className="text-zinc-600 text-xs mr-2 select-none">{i}</span>
                  <JsonTree data={item} depth={depth + 1} searchQuery={searchQuery} />
                  {i < data.length - 1 && <span className="text-zinc-600">,</span>}
                </>
              )}
            </div>
          ))}
        </div>
        <span className="cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-500">]</span>
        </span>
      </>
    )
  }

  if (t === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)
    if (entries.length === 0) return <span className="text-zinc-500">{'{}'}</span>
    const prefix = `{${entries.length}}`

    if (collapsed) {
      return (
        <span className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-600 text-xs">{prefix}</span>
          <span className="text-zinc-500">{'{'}</span>
          <span className="text-zinc-500 text-xs">...</span>
          <span className="text-zinc-500">{'}'}</span>
          <span className="text-zinc-600 text-xs ml-1">{entries.length} key{entries.length !== 1 ? 's' : ''}</span>
        </span>
      )
    }

    return (
      <>
        <span className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-500">{'{'}</span>
          <span className="text-zinc-600 text-xs ml-1">{prefix}</span>
        </span>
        <div className="ml-4 pl-3 border-l border-zinc-800">
          {entries.map(([key, val]) => (
            <div key={key} className="leading-6 hover:bg-zinc-900/50 rounded px-1">
              <span className="text-zinc-100 mr-2 select-none break-all">{highlightSearch(JSON.stringify(key), searchQuery)}</span>
              <span className="text-zinc-600">: </span>
              <JsonTree data={val} keyName={key} depth={depth + 1} searchQuery={searchQuery} />
            </div>
          ))}
        </div>
        <span className="cursor-pointer hover:opacity-80" onClick={toggle}>
          <span className="text-zinc-500">{'}'}</span>
        </span>
      </>
    )
  }

  return <span>{String(data)}</span>
}
