import { Hono } from 'hono'
import { searchApis, countApis } from '../db/queries.ts'

export const searchRoute = new Hono()

searchRoute.get('/', (c) => {
  const q = c.req.query('q') || undefined
  const category = c.req.query('category') || undefined
  const country = c.req.query('country') || undefined
  const tier = c.req.query('tier') || undefined
  const auth = c.req.query('auth') || undefined
  const pricing = c.req.query('pricing') || undefined
  const free = c.req.query('free') || undefined
  const noAuth = c.req.query('no_auth') || undefined
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  const apis = searchApis({ q, category, country, tier, auth, pricing, free, noAuth, limit, offset })
  const count = countApis({ q, category, country, tier, auth, pricing, free, noAuth })

  return c.json({ query: q || '', count, apis })
})
