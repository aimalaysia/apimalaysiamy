import { db, sqlite } from './connection.ts'
import { apis, categories } from './schema.ts'
import fs from 'fs'
import path from 'path'

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS apis (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'Build',
    countries TEXT NOT NULL DEFAULT '[]',
    provider TEXT NOT NULL,
    source TEXT,
    source_url TEXT,
    tier TEXT NOT NULL DEFAULT 'open',
    kind TEXT NOT NULL DEFAULT 'api',
    auth TEXT NOT NULL DEFAULT 'none',
    copyable INTEGER DEFAULT 1,
    pricing TEXT NOT NULL DEFAULT 'free',
    docs TEXT,
    base_url TEXT,
    frequency TEXT,
    coverage TEXT,
    note TEXT,
    attributes TEXT,
    created_at TEXT NOT NULL DEFAULT (current_timestamp),
    updated_at TEXT NOT NULL DEFAULT (current_timestamp),
    submitted_by TEXT,
    verified_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category);
  CREATE INDEX IF NOT EXISTS idx_apis_tier ON apis(tier);
  CREATE INDEX IF NOT EXISTS idx_apis_auth ON apis(auth);
  CREATE INDEX IF NOT EXISTS idx_apis_pricing ON apis(pricing);

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    group_name TEXT NOT NULL DEFAULT 'Build',
    icon TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS api_tags (
    api_id TEXT NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_by TEXT,
    submitted_at TEXT NOT NULL DEFAULT (current_timestamp),
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_notes TEXT
  );

  CREATE TABLE IF NOT EXISTS api_snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_id TEXT NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL
  );
`)

const existing = db.select({ id: apis.id }).from(apis).limit(1).get()
if (existing) {
  console.log('Database already seeded, skipping.')
  process.exit(0)
}

const raw = fs.readFileSync(path.join(import.meta.dirname, 'pasar-raw.json'), 'utf-8')
const wrapper: { apis: any[] } = JSON.parse(raw)
const pasarApis = wrapper.apis
console.log(`Loaded ${pasarApis.length} APIs from pasar-raw.json`)

const catMap = new Map<string, { name: string; slug: string; groupName: string; icon: string; sortOrder: number }>()
let sortOrder = 0

for (const p of pasarApis) {
  const catName = p.category || 'Uncategorized'
  if (!catMap.has(catName)) {
    sortOrder++
    catMap.set(catName, {
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized',
      groupName: p.group || 'Build',
      icon: 'folder',
      sortOrder,
    })
  }
}

const catValues = [...catMap.values()]
db.insert(categories).values(catValues).run()
console.log(`Inserted ${catValues.length} categories`)

const batchSize = 100
let inserted = 0

for (let i = 0; i < pasarApis.length; i += batchSize) {
  const batch = pasarApis.slice(i, i + batchSize)
  const values: Record<string, unknown>[] = []

  for (const p of batch) {
    const copyable = typeof p.copyable === 'boolean' ? (p.copyable ? 1 : 0) : 1
    const countries = JSON.stringify(p.country || [])
    let verifiedAt: string | null = null
    if (p.lastVerified || (p.trust && p.trust.verified)) {
      verifiedAt = new Date().toISOString()
    }

    values.push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.note || null,
      category: p.category || 'Uncategorized',
      group: p.group || 'Build',
      countries,
      provider: p.provider || 'Unknown',
      source: p.source || null,
      source_url: p.sourceUrl || null,
      tier: p.tier || 'open',
      kind: p.kind || 'api',
      auth: p.auth || 'none',
      copyable,
      pricing: p.pricing || 'free',
      docs: p.docs || null,
      base_url: p.baseUrl || null,
      frequency: p.frequency || null,
      coverage: p.coverage || null,
      note: p.note || null,
      attributes: p.setup ? JSON.stringify(p.setup) : null,
      verified_at: verifiedAt,
    })
  }

  db.insert(apis).values(values).run()
  inserted += values.length
  console.log(`Inserted ${inserted}/${pasarApis.length} APIs`)
}

console.log(`Seed complete! ${inserted} APIs across ${catValues.length} categories.`)
process.exit(0)
