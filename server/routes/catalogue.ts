import { Hono } from 'hono'
import { getAllApis } from '../db/queries.ts'

export const catalogueRoute = new Hono()

catalogueRoute.get('/', (c) => {
  const apis = getAllApis()
  return c.json({
    updated: new Date().toISOString().split('T')[0],
    count: apis.length,
    apis,
  })
})
