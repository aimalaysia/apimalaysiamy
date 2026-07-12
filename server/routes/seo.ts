import { Hono } from 'hono'
import { getApiBySlug, getAllApis } from '../db/queries.ts'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const indexPath = join(__dirname, '../../client/dist/index.html')

export const seoRoute = new Hono()

seoRoute.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Sitemap: https://apimalaysia.my/sitemap.xml
`)
})

seoRoute.get('/sitemap.xml', (c) => {
  const apis = getAllApis()
  const pages = [
    { loc: 'https://apimalaysia.my/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://apimalaysia.my/playground', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://apimalaysia.my/submit', priority: '0.5', changefreq: 'monthly' },
  ]

  for (const api of apis) {
    pages.push({
      loc: `https://apimalaysia.my/api/${api.slug}`,
      priority: '0.8',
      changefreq: 'weekly' as const,
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`

  return c.newResponse(xml, 200, { 'Content-Type': 'application/xml' })
})

seoRoute.get('/api/:slug', (c) => {
  const slug = c.req.param('slug')
  const api = getApiBySlug(slug)
  if (!api) return c.redirect('/')

  const title = `${api.title} — APIMalaysia.my | Southeast Asia API Directory`
  const description = api.description
    ? api.description.slice(0, 160)
    : `Explore the ${api.title} API by ${api.provider}. ${api.auth === 'none' ? 'No authentication required. ' : `${api.auth} authentication. `}${api.pricing === 'free' ? 'Free to use. ' : `${api.pricing} pricing. `}Part of the APIMalaysia.my directory of Southeast Asian APIs.`

  let countries: string[] = []
  try { countries = JSON.parse(api.countries) } catch {}

  const img = 'https://apimalaysia.my/favicon.svg'

  let html = readFileSync(indexPath, 'utf-8')

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="https://apimalaysia.my/api/${api.slug}" />`,
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="https://apimalaysia.my/api/${api.slug}" />`,
    )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: api.title,
    description: description,
    url: `https://apimalaysia.my/api/${api.slug}`,
    provider: { '@type': 'Organization', name: api.provider },
    documentation: api.docs || undefined,
    termsOfService: api.docs || undefined,
    areaServed: countries.map((c: string) => ({ '@type': 'Country', name: c })),
  }

  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`)

  return c.html(html)
})

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
