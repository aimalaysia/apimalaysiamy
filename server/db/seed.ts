import { db, sqlite } from './connection.ts'
import { apis } from './schema.ts'
import { ingest } from '../scripts/ingest.ts'

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
  console.log('Database already populated, skipping seed.')
  process.exit(0)
}

console.log('Database empty — ingesting from upstream catalogue...')
await ingest()
console.log('Seed complete!')
process.exit(0)
