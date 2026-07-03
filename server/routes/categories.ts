import { Hono } from 'hono'
import { getAllCategories } from '../db/queries.ts'

export const categoriesRoute = new Hono()

categoriesRoute.get('/', (c) => {
  const cats = getAllCategories()
  return c.json({ count: cats.length, categories: cats })
})
