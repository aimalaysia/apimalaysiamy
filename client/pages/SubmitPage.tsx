import { useState } from 'react'
import { submitApi } from '../services/api.ts'

export function SubmitPage() {
  const [form, setForm] = useState({
    title: '', category: '', provider: '', tier: 'community',
    kind: 'api', auth: 'none', pricing: 'free', docs: '', baseUrl: '',
    description: '', countries: [] as string[],
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const result = await submitApi({ ...form, countries: form.countries.length > 0 ? form.countries : ['MY'] })
      if (result.success) {
        setStatus('success')
        setMessage(`Submission received! ID: ${result.id}`)
        setForm({ title: '', category: '', provider: '', tier: 'community', kind: 'api', auth: 'none', pricing: 'free', docs: '', baseUrl: '', description: '', countries: [] })
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  const toggleCountry = (code: string) => {
    setForm(prev => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter(c => c !== code)
        : [...prev.countries, code],
    }))
  }

  const inputClass = "w-full bg-[#11152e] border border-[#1e2440] rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
  const labelClass = "block text-xs text-zinc-500 uppercase tracking-wider mb-1.5 font-medium"

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black text-base font-bold shadow-lg shadow-amber-500/20">
            S
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">Submit an API</h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base">
          Know an API that should be in the directory? Submit it for review.
        </p>
      </div>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-rose-900/30 border border-rose-700/50 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[#11152e] border border-[#1e2440] rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>API Name *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Malaysia Weather API"
              className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={labelClass}>Category *</label>
              <input type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Weather"
                className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Provider *</label>
              <input type="text" required value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                placeholder="e.g. MET Malaysia"
                className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Auth Type</label>
              <select value={form.auth} onChange={(e) => setForm({ ...form, auth: e.target.value })}
                className={inputClass}>
                <option value="none">No Auth</option>
                <option value="apiKey">API Key</option>
                <option value="oauth">OAuth</option>
                <option value="bearer">Bearer</option>
                <option value="token">Token</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Pricing</label>
              <select value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })}
                className={inputClass}>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Countries</label>
            <div className="flex flex-wrap gap-3">
              {['MY', 'SG', 'ID', 'TH'].map(code => (
                <label key={code} className="flex items-center gap-1.5 text-sm text-zinc-400 cursor-pointer px-3 py-2 rounded-lg border border-[#1e2440] hover:border-[#2e3460] transition-colors has-checked:border-amber-500/50 has-checked:bg-amber-500/5">
                  <input type="checkbox" checked={form.countries.includes(code)} onChange={() => toggleCountry(code)}
                    className="rounded border-[#2e3460] bg-[#11152e] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0" />
                  {code}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Documentation URL</label>
            <input type="url" value={form.docs} onChange={(e) => setForm({ ...form, docs: e.target.value })}
              placeholder="https://docs.example.com"
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Base URL</label>
            <input type="text" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              placeholder="Tell us what this API does..."
              className={inputClass + " resize-none"} />
          </div>
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-[#0a0e27] rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20">
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0a0e27] border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : 'Submit API'}
        </button>
      </form>
    </div>
  )
}
