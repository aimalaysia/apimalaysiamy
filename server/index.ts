import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { catalogueRoute } from './routes/catalogue.ts'
import { searchRoute } from './routes/search.ts'
import { categoriesRoute } from './routes/categories.ts'
import { apisRoute } from './routes/apis.ts'
import { submitRoute } from './routes/submit.ts'

const app = new Hono()

app.use('/*', cors())

app.route('/api/catalogue', catalogueRoute)
app.route('/api/search', searchRoute)
app.route('/api/categories', categoriesRoute)
app.route('/api/apis', apisRoute)
app.route('/api', submitRoute)

app.get('/api', (c) => c.json({
  name: 'MyAPI',
  description: 'MyAPI — Every API in Southeast Asia. Government open data + curated commercial APIs.',
  count: 0,
  endpoints: ['/api/catalogue', '/api/search?q=', '/api/categories', '/api/apis/:id'],
  mcp: '/mcp',
}))

app.get('/mcp', (c) => c.json({
  tools: [
    { name: 'search_sea_apis', description: 'Search APIs by query, category, country, free, no_auth' },
    { name: 'get_sea_api', description: 'Full details for one API id + snippet' },
    { name: 'list_api_categories', description: 'All categories with counts' },
  ],
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

const port = parseInt(process.env.PORT || '3001')

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API server running at http://localhost:${info.port}`)
})
