import { Hono } from 'hono'
import { z } from 'zod'
import { createSubmission } from '../db/queries.ts'

const submitSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  countries: z.array(z.string()).min(1),
  provider: z.string().min(1),
  tier: z.enum(['open', 'commercial', 'community']).default('community'),
  kind: z.string().default('api'),
  auth: z.string().default('none'),
  pricing: z.string().default('free'),
  docs: z.string().url().optional(),
  baseUrl: z.string().optional(),
  description: z.string().optional(),
  sourceUrl: z.string().optional(),
})

export const submitRoute = new Hono()

submitRoute.post('/submit', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = submitSchema.parse(body)
    const submission = createSubmission(JSON.stringify(parsed))
    return c.json({ success: true, id: submission.id, message: 'Submission received for review' }, 201)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: err.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})
