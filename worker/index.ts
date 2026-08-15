import { Hono } from 'hono'

import articleIndex from '../public/data/articles.json'

const app = new Hono()

app.get('/api/health', (context) => context.json({ ok: true }))

app.get('/api/articles', (context) => {
  context.header('Cache-Control', 'public, max-age=300')
  return context.json(articleIndex)
})

app.notFound((context) => context.json({ error: 'Not Found' }, 404))

export { app }
export default app
