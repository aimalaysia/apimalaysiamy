import { db } from './connection.ts'
import { apis, categories, submissions } from './schema.ts'
import { like, or, eq, and, isNotNull, SQL, asc, sql } from 'drizzle-orm'

export interface SearchParams {
  q?: string
  category?: string
  country?: string
  tier?: string
  auth?: string
  pricing?: string
  free?: string
  noAuth?: string
  working?: string
  testable?: string
  limit?: number
  offset?: number
}

export function searchApis(params: SearchParams) {
  const conditions: SQL[] = []
  const { q, category, country, tier, auth, pricing, free, noAuth, working, testable } = params

  if (q) {
    const term = `%${q}%`
    conditions.push(
      or(
        like(apis.title, term),
        like(apis.description, term),
        like(apis.provider, term),
        like(apis.category, term),
      )
    )
  }

  if (category) conditions.push(eq(apis.category, category))
  if (country) conditions.push(like(apis.countries, `%${country}%`))
  if (tier) conditions.push(eq(apis.tier, tier))
  if (free === 'true') conditions.push(eq(apis.pricing, 'free'))
  else if (pricing) conditions.push(eq(apis.pricing, pricing))
  if (noAuth === 'true') conditions.push(eq(apis.auth, 'none'))
  else if (auth) conditions.push(eq(apis.auth, auth))
  if (working === 'true') conditions.push(isNotNull(apis.verifiedAt))
  if (testable === 'true') conditions.push(eq(apis.copyable, true))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const limit = Math.min(params.limit || 50, 200)
  const offset = params.offset || 0

  return db.select().from(apis).where(where).limit(limit).offset(offset).all()
}

export function countApis(params: SearchParams) {
  const conditions: SQL[] = []
  const { q, category, country, tier, auth, pricing, free, noAuth, working, testable } = params

  if (q) {
    const term = `%${q}%`
    conditions.push(
      or(
        like(apis.title, term),
        like(apis.description, term),
        like(apis.provider, term),
        like(apis.category, term),
      )
    )
  }

  if (category) conditions.push(eq(apis.category, category))
  if (country) conditions.push(like(apis.countries, `%${country}%`))
  if (tier) conditions.push(eq(apis.tier, tier))
  if (free === 'true') conditions.push(eq(apis.pricing, 'free'))
  else if (pricing) conditions.push(eq(apis.pricing, pricing))
  if (noAuth === 'true') conditions.push(eq(apis.auth, 'none'))
  else if (auth) conditions.push(eq(apis.auth, auth))
  if (working === 'true') conditions.push(isNotNull(apis.verifiedAt))
  if (testable === 'true') conditions.push(eq(apis.copyable, true))

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const result = db.select({ count: sql<number>`COUNT(*)` }).from(apis).where(where).get()
  return Number(result?.count || 0)
}

export function getApiById(id: string) {
  return db.select().from(apis).where(eq(apis.id, id)).get()
}

export function getApiBySlug(slug: string) {
  return db.select().from(apis).where(eq(apis.slug, slug)).get()
}

export function getAllCountries(): string[] {
  const rows = db.select({ countries: apis.countries }).from(apis).all()
  const set = new Set<string>()
  for (const row of rows) {
    try {
      const list: string[] = JSON.parse(row.countries)
      for (const c of list) set.add(c)
    } catch { /* skip malformed */ }
  }
  return [...set].sort()
}

export function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder)).all()
}

export function getAllApis() {
  return db.select().from(apis).orderBy(asc(apis.title)).all()
}

export function getSimilarApis(apiId: string, category: string, limit = 5) {
  return db.select()
    .from(apis)
    .where(and(eq(apis.category, category), eq(apis.id, apiId, true)))
    .limit(limit)
    .all()
}

export function createSubmission(data: string, submittedBy?: string) {
  return db.insert(submissions).values({ data, submittedBy, status: 'pending' }).returning().get()
}

export function getSubmissions(status?: string) {
  if (status) {
    return db.select().from(submissions).where(eq(submissions.status, status)).all()
  }
  return db.select().from(submissions).all()
}

export function updateSubmissionStatus(id: number, status: string, reviewedBy?: string) {
  return db.update(submissions)
    .set({ status, reviewedBy, reviewedAt: new Date().toISOString() })
    .where(eq(submissions.id, id))
    .returning()
    .get()
}
