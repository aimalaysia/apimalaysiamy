import { db } from '../db/connection.ts'
import { apis, categories } from '../db/schema.ts'
import { eq, sql } from 'drizzle-orm'

interface RawApiEntry {
  id: string
  slug: string
  title: string
  category: string
  group: string
  country: string[]
  provider: string
  source: string | null
  sourceUrl: string | null
  tier: string
  kind: string
  auth: string
  copyable: boolean
  pricing: string
  docs: string | null
  baseUrl: string | null
  frequency: string | null
  coverage: string | null
  lastVerified: string | null
  note: string | null
  trust: {
    level: string
    label: string
    verified: boolean
    lastChecked: string | null
  } | null
  setup: Record<string, unknown> | null
}

const API = 'https://pasarapi.xyz/api/catalogue' /* internal catalogue source */
const BATCH = 100

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized'
}

function mapWorking(p: RawApiEntry): string | null {
  if (p.lastVerified) return new Date().toISOString()
  if (p.trust?.level === 'copy-paste') return new Date().toISOString()
  if (p.trust?.verified) return new Date().toISOString()
  return null
}

function mapTestable(p: RawApiEntry): boolean {
  return p.copyable === true
}

export async function ingest() {
  console.log(`Fetching ${API}...`)
  const res = await fetch(API)
  const body: { apis: RawApiEntry[] } = await res.json()
  const list = body.apis
  console.log(`Fetched ${list.length} APIs`)

  const catMap = new Map<string, { name: string; slug: string; groupName: string; icon: string; sortOrder: number }>()
  let sortOrder = 0

  const now = new Date().toISOString()
  let inserted = 0
  let updated = 0

  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH)

    for (const p of batch) {
      const catName = p.category || 'Uncategorized'
      if (!catMap.has(catName)) {
        sortOrder++
        catMap.set(catName, {
          name: catName,
          slug: slugify(catName),
          groupName: p.group || 'Build',
          icon: 'folder',
          sortOrder,
        })
      }
    }

    const vals: (typeof apis.$inferInsert)[] = batch.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.note || null,
      category: p.category || 'Uncategorized',
      group: p.group || 'Build',
      countries: JSON.stringify(p.country || []),
      provider: p.provider || 'Unknown',
      source: p.source || null,
      sourceUrl: p.sourceUrl || null,
      tier: p.tier || 'open',
      kind: p.kind || 'api',
      auth: p.auth || 'none',
      copyable: mapTestable(p),
      pricing: p.pricing || 'free',
      docs: p.docs || null,
      baseUrl: p.baseUrl || null,
      frequency: p.frequency || null,
      coverage: p.coverage || null,
      note: p.note || null,
      attributes: p.setup ? JSON.stringify(p.setup) : null,
      verifiedAt: mapWorking(p),
      updatedAt: now,
    }))

    for (const v of vals) {
      const existing = db.select({ id: apis.id }).from(apis).where(eq(apis.slug, v.slug)).get()
      if (existing) {
        db.update(apis).set(v).where(eq(apis.slug, v.slug)).run()
        updated++
      } else {
        db.insert(apis).values({ ...v, createdAt: now }).run()
        inserted++
      }
    }
  }

  const catValues = [...catMap.values()]
  db.delete(categories).run()
  db.insert(categories).values(catValues).run()

  const total = db.select({ count: sql<number>`COUNT(*)` }).from(apis).get()
  const verified = db.select({ count: sql<number>`COUNT(*)` }).from(apis).where(sql`verified_at IS NOT NULL`).get()
  const copyableCount = db.select({ count: sql<number>`COUNT(*)` }).from(apis).where(eq(apis.copyable, true as any)).get()

  console.log(`
╔══════════════════════════════════╗
║ Ingestion Complete               ║
╠══════════════════════════════════╣
║ Total in catalogue: ${String(list.length).padEnd(18)}║
║ Inserted:          ${String(inserted).padEnd(18)}║
║ Updated:           ${String(updated).padEnd(18)}║
║ Categories:        ${String(catValues.length).padEnd(18)}║
║ Total in DB:       ${String(total?.count ?? 0).padEnd(18)}║
║ Verified (Working):${String(verified?.count ?? 0).padEnd(18)}║
║ Copyable (Test):   ${String(copyableCount?.count ?? 0).padEnd(18)}║
╚══════════════════════════════════╝
  `)
}

const isMain = process.argv[1]?.endsWith('ingest.ts')
if (isMain) {
  ingest().catch((err) => {
    console.error('Ingestion failed:', err)
    process.exit(1)
  })
}
