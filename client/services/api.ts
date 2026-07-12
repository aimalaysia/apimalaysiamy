import type { ApiEntry, SearchFilters, CatalogueResponse, SearchResponse, CategoriesResponse, SubmissionPayload } from '../types'

const BASE_URL = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function fetchCatalogue(): Promise<CatalogueResponse> {
  return fetchJson(`${BASE_URL}/catalogue`)
}

export function searchApis(filters: SearchFilters): Promise<SearchResponse> {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.country) params.set('country', filters.country)
  if (filters.tier) params.set('tier', filters.tier)
  if (filters.auth) params.set('auth', filters.auth)
  if (filters.pricing) params.set('pricing', filters.pricing)
  if (filters.free) params.set('free', filters.free)
  if (filters.noAuth) params.set('no_auth', filters.noAuth)
  if (filters.working) params.set('working', filters.working)
  if (filters.testable) params.set('testable', filters.testable)
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.offset) params.set('offset', String(filters.offset))

  const qs = params.toString()
  return fetchJson(`${BASE_URL}/search${qs ? `?${qs}` : ''}`)
}

export function fetchCategories(): Promise<CategoriesResponse> {
  return fetchJson(`${BASE_URL}/categories`)
}

export function fetchApiById(id: string): Promise<ApiEntry> {
  return fetchJson(`${BASE_URL}/apis/${id}`)
}

export function fetchCountries(): Promise<{ count: number; countries: string[] }> {
  return fetchJson(`${BASE_URL}/countries`)
}

export function submitApi(payload: SubmissionPayload): Promise<{ success: boolean; id: number; message: string }> {
  return fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json())
}

export function countryFlag(code: string): string {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

export const COUNTRY_NAMES: Record<string, string> = {
  MY: 'Malaysia', SG: 'Singapore', ID: 'Indonesia', TH: 'Thailand',
  VN: 'Vietnam', PH: 'Philippines', MM: 'Myanmar', BN: 'Brunei',
  LA: 'Laos', KH: 'Cambodia', TL: 'East Timor',
  AU: 'Australia', NZ: 'New Zealand', IN: 'India', CN: 'China',
  JP: 'Japan', KR: 'South Korea', US: 'United States', GB: 'United Kingdom',
  DE: 'Germany', FR: 'France', NL: 'Netherlands',
  global: 'Global',
}
export const COUNTRIES = Object.keys(COUNTRY_NAMES).filter(c => c !== 'global').sort()

export const AUTH_TYPES = ['none', 'apiKey', 'oauth', 'bearer', 'token', 'basic'] as const
export const PRICING_TIERS = ['free', 'freemium', 'paid'] as const
export const TIERS = ['open', 'commercial'] as const
