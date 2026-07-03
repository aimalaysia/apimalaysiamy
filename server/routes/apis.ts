import { Hono } from 'hono'
import { getApiById, getApiBySlug } from '../db/queries.ts'

export const apisRoute = new Hono()

apisRoute.get('/:id', (c) => {
  const { id } = c.req.param()
  const api = getApiById(id) || getApiBySlug(id)
  if (!api) return c.json({ error: 'API not found' }, 404)
  return c.json(api)
})
