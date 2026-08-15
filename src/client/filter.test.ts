import { describe, expect, it } from 'vitest'

import type { Article } from '../shared/article'
import { emptySearchQuery } from '../shared/article'
import { filterArticles } from './filter'

const articles: Article[] = [
  {
    id: 'rust-workers',
    url: 'https://example.com/rust',
    title: 'Cloudflare WorkersでRustを動かす',
    source: 'Zenn',
    genre: 'Web開発',
    technologies: ['Rust', 'WebAssembly'],
    reading_minutes: 8,
    created_at: '2026-08-14',
    updated_at: '2026-08-15',
    summary: ['エッジ環境でRustを利用する方法を解説します。'],
  },
  {
    id: 'hono-api',
    url: 'https://example.com/hono',
    title: 'Honoで作るAPI',
    source: 'Qiita',
    genre: 'API設計',
    technologies: ['Hono', 'TypeScript'],
    reading_minutes: 12,
    created_at: '2026-08-01',
    updated_at: '2026-08-10',
    summary: ['Web標準のAPI設計を整理します。'],
  },
]

describe('filterArticles', () => {
  it('キーワードを大文字小文字を区別せず全フィールドから検索する', () => {
    const result = filterArticles(articles, { ...emptySearchQuery(), keyword: 'RUST' })

    expect(result.map(({ id }) => id)).toEqual(['rust-workers'])
  })

  it('すべての指定条件をANDで適用する', () => {
    const result = filterArticles(articles, {
      ...emptySearchQuery(),
      genre: 'Web開発',
      technology: 'Rust',
      source: 'Zenn',
      createdFrom: '2026-08-01',
      createdTo: '2026-08-15',
      maxMinutes: 10,
    })

    expect(result).toEqual([articles[0]])
  })

  it('元配列を変更せず指定順に並べる', () => {
    const result = filterArticles(articles, { ...emptySearchQuery(), sort: 'title-asc' })

    expect(result.map(({ id }) => id)).toEqual(['rust-workers', 'hono-api'])
    expect(articles.map(({ id }) => id)).toEqual(['rust-workers', 'hono-api'])
  })
})
