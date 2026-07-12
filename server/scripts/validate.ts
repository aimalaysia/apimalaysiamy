import { db } from '../db/connection.ts'
import { apis } from '../db/schema.ts'
import { eq, sql, isNotNull } from 'drizzle-orm'
import { generateDescription } from '../db/descriptions.ts'

const CONCURRENCY = 5
const TIMEOUT_MS = 10000

interface ValidationResult {
  slug: string
  id: string
  verifiedAt: string | null
  description: string | null
  title: string
  baseUrl: string | null
  docs: string | null
  changed: boolean
}

function pickUrl(api: { baseUrl: string | null; docs: string | null; sourceUrl: string | null }): string | null {
  return api.baseUrl || api.docs || api.sourceUrl || null
}

async function validateOne(api: {
  slug: string
  id: string
  title: string
  verifiedAt: string | null
  description: string | null
  baseUrl: string | null
  docs: string | null
  sourceUrl: string | null
  provider: string
  category: string
  auth: string
  pricing: string
  tier: string
  countries: string
}): Promise<ValidationResult> {
  const result: ValidationResult = {
    slug: api.slug,
    id: api.id,
    verifiedAt: api.verifiedAt,
    description: api.description,
    title: api.title,
    baseUrl: api.baseUrl,
    docs: api.docs,
    changed: false,
  }

  const url = pickUrl(api)
  let isAlive = false

  if (url) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'APIMalaysia.my/1.0 Validator' },
      })
      clearTimeout(timer)
      isAlive = res.status < 500
    } catch {
      isAlive = false
    }
  }

  const now = new Date().toISOString()
  if (isAlive && !api.verifiedAt) {
    result.verifiedAt = now
    result.changed = true
  } else if (!isAlive && api.verifiedAt) {
    if (api.verifiedAt) {
      const lastCheck = new Date(api.verifiedAt).getTime()
      const daysSinceCheck = (Date.now() - lastCheck) / 86400000
      if (daysSinceCheck > 30) {
        result.verifiedAt = null
        result.changed = true
      }
    }
  }

  const newDesc = generateDescription(api)
  if (newDesc !== (api.description || '')) {
    result.description = newDesc
    result.changed = true
  }

  return result
}

async function validateAll() {
  console.log('Starting incremental validation...')

  const rows = db.select({
    id: apis.id,
    slug: apis.slug,
    title: apis.title,
    description: apis.description,
    category: apis.category,
    provider: apis.provider,
    auth: apis.auth,
    pricing: apis.pricing,
    tier: apis.tier,
    countries: apis.countries,
    baseUrl: apis.baseUrl,
    docs: apis.docs,
    sourceUrl: apis.sourceUrl,
    verifiedAt: apis.verifiedAt,
  }).from(apis).all()

  console.log(`Loaded ${rows.length} APIs for validation`)

  let validated = 0
  let updated = 0
  let alive = 0
  let dead = 0

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(validateOne))

    for (const r of results) {
      validated++
      if (!r.changed) continue

      const updateFields: Record<string, unknown> = {}
      if (r.verifiedAt !== null || r.changed) {
        const row = rows.find(x => x.slug === r.slug)
        if (r.verifiedAt !== row?.verifiedAt) {
          updateFields.verifiedAt = r.verifiedAt
        }
      }
      if (r.description !== null) {
        const row = rows.find(x => x.slug === r.slug)
        if (r.description !== row?.description) {
          updateFields.description = r.description
        }
      }

      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date().toISOString()
        db.update(apis).set(updateFields).where(eq(apis.slug, r.slug)).run()
        updated++
      }

      if (r.verifiedAt) alive++
      else dead++
    }

    if ((i + CONCURRENCY) % 50 === 0 || i + CONCURRENCY >= rows.length) {
      console.log(`Progress: ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length} — ${updated} updated so far`)
    }
  }

  console.log(`
╔══════════════════════════════════════╗
║ Validation Complete                   ║
╠══════════════════════════════════════╣
║ Total validated: ${String(validated).padEnd(22)}║
║ Records updated:  ${String(updated).padEnd(22)}║
║ Alive (verified):  ${String(alive).padEnd(22)}║
║ Dead (unverified): ${String(dead).padEnd(22)}║
╚══════════════════════════════════════╝
  `)
}

const isMain = process.argv[1]?.endsWith('validate.ts')
if (isMain) {
  validateAll().catch((err) => {
    console.error('Validation failed:', err)
    process.exit(1)
  })
}
