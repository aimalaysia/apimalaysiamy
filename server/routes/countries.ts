import { Hono } from 'hono'
import { getAllCountries } from '../db/queries.ts'

export const countriesRoute = new Hono()

countriesRoute.get('/', (c) => {
  const countries = getAllCountries()
  return c.json({ count: countries.length, countries })
})
