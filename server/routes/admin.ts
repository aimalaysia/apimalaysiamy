import { Hono } from 'hono'
import { db } from '../db/connection.ts'
import { apis } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import { generateDescription } from '../db/descriptions.ts'

export const adminRoute = new Hono()

adminRoute.post('/validate', async (c) => {
  const slug = c.req.query('slug')
  const all = c.req.query('all')

  if (slug) {
    const api = db.select().from(apis).where(eq(apis.slug, slug)).get()
    if (!api) return c.json({ error: 'API not found' }, 404)
    const desc = generateDescription(api)
    if (desc !== api.description) {
      db.update(apis).set({ description: desc, updatedAt: new Date().toISOString() }).where(eq(apis.slug, slug)).run()
      return c.json({ slug, description: desc, updated: true })
    }
    return c.json({ slug, description: desc, updated: false })
  }

  if (all) {
    const rows = db.select({
      id: apis.id, slug: apis.slug, title: apis.title,
      description: apis.description, category: apis.category,
      provider: apis.provider, auth: apis.auth, pricing: apis.pricing,
      tier: apis.tier, countries: apis.countries,
      baseUrl: apis.baseUrl, docs: apis.docs,
    }).from(apis).all()

    let count = 0
    for (const a of rows) {
      if (a.description && a.description.length > 20) continue
      const desc = generateDescription(a)
      db.update(apis).set({ description: desc, updatedAt: new Date().toISOString() }).where(eq(apis.slug, a.slug)).run()
      count++
    }
    return c.json({ message: `Generated descriptions for ${count} APIs` })
  }

  return c.json({ error: 'Specify ?slug= or ?all=true' }, 400)
})
