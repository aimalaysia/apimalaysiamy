import { Hono } from 'hono'

export const proxyRoute = new Hono()

proxyRoute.all('/', async (c) => {
  const url = c.req.query('url')
  if (!url) return c.json({ error: 'Missing url parameter' }, 400)

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'APIMalaysia.my/1.0 (+https://apimalaysia.my)',
    }

    if (c.req.method === 'POST' || c.req.method === 'PUT' || c.req.method === 'PATCH') {
      const body = await c.req.text()
      const res = await fetch(url, {
        method: c.req.method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(15000),
      })
      const text = await res.text()
      return c.newResponse(text, res.status, {
        'Content-Type': res.headers.get('Content-Type') || 'text/plain',
        'X-Proxied-By': 'APIMalaysia.my',
      })
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
    })
    const text = await res.text()
    return c.newResponse(text, res.status, {
      'Content-Type': res.headers.get('Content-Type') || 'text/plain',
      'X-Proxied-By': 'APIMalaysia.my',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return c.json({ error: msg, url }, 502)
  }
})
