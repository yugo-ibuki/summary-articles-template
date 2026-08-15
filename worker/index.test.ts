import { describe, expect, it } from 'vitest'

import { app } from './index'

describe('Worker API', () => {
  it('ヘルスチェックを返す', async () => {
    const response = await app.request('/api/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('キャッシュ可能な記事索引を返す', async () => {
    const response = await app.request('/api/articles')
    const body = (await response.json()) as { articles: unknown[] }

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('public, max-age=300')
    expect(Array.isArray(body.articles)).toBe(true)
  })

  it('存在しないAPIはJSONの404を返す', async () => {
    const response = await app.request('/api/missing')

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not Found' })
  })
})
