export function generateDescription(api: {
  title: string
  provider: string
  category: string
  auth: string
  pricing: string
  tier: string
  countries: string
  baseUrl: string | null
  docs: string | null
  description: string | null
}): string {
  if (api.description && api.description.length > 20) return api.description

  const parts: string[] = []

  parts.push(`${api.title} API`)

  if (api.provider && api.provider !== 'Unknown') {
    parts.push(`from ${api.provider}`)
  }

  if (api.category && api.category !== 'Uncategorized') {
    parts.push(`in the ${api.category} category`)
  }

  let countries: string[] = []
  try { countries = JSON.parse(api.countries) } catch {}
  if (countries.length > 0 && !countries.includes('global')) {
    const names: Record<string, string> = {
      MY: 'Malaysia', SG: 'Singapore', ID: 'Indonesia', TH: 'Thailand',
      VN: 'Vietnam', PH: 'Philippines', MM: 'Myanmar', BN: 'Brunei',
    }
    const mapped = countries.map(c => names[c] || c).filter(Boolean)
    if (mapped.length === 1) {
      parts.push(`serving ${mapped[0]}`)
    } else if (mapped.length > 1) {
      parts.push(`serving ${mapped.join(', ')}`)
    }
  } else if (countries.includes('global')) {
    parts.push('with global coverage')
  }

  const access: string[] = []
  if (api.pricing === 'free') access.push('free to use')
  else if (api.pricing === 'freemium') access.push('freemium')
  else access.push(api.pricing)
  if (api.auth === 'none') access.push('no auth required')
  else access.push(`${api.auth} auth`)
  parts.push(`— ${access.join(', ')}`)

  let result = parts.join(' ')
  if (result.length > 160) {
    result = result.slice(0, 157) + '...'
  }

  return result
}
