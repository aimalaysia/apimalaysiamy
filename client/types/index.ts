export interface ApiEntry {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  group: string
  countries: string
  provider: string
  source: string | null
  sourceUrl: string | null
  tier: string
  kind: string
  auth: string
  copyable: boolean | number | null
  pricing: string
  docs: string | null
  baseUrl: string | null
  frequency: string | null
  coverage: string | null
  note: string | null
  attributes: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  groupName: string
  icon: string | null
  sortOrder: number
}

export interface CatalogueResponse {
  updated: string
  count: number
  apis: ApiEntry[]
}

export interface SearchResponse {
  query: string
  count: number
  apis: ApiEntry[]
}

export interface CategoriesResponse {
  count: number
  categories: Category[]
}

export interface SearchFilters {
  q?: string
  category?: string
  country?: string
  tier?: string
  auth?: string
  pricing?: string
  free?: string
  noAuth?: string
  limit?: number
  offset?: number
}

export interface SubmissionPayload {
  title: string
  category: string
  countries: string[]
  provider: string
  tier: string
  kind: string
  auth: string
  pricing: string
  docs?: string
  baseUrl?: string
  description?: string
  sourceUrl?: string
}
