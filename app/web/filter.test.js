import assert from 'node:assert/strict'
import test from 'node:test'

import { compareArticles, matchesArticle, normalize, resultMessage } from './filter.js'

const rust = {
  id: 'rust-workers',
  title: 'Cloudflare WorkersでＲｕｓｔを動かす',
  searchable: 'Cloudflare WorkersでＲｕｓｔを動かす Zenn Web開発 Rust WebAssembly エッジ実行',
  source: 'Zenn',
  genre: 'Web開発',
  technologies: ['Rust', 'WebAssembly'],
  readingMinutes: 8,
  createdAt: '2026-08-14',
  updatedAt: '2026-08-15',
}

const api = {
  id: 'api-design',
  title: '小さなAPIを設計する',
  searchable: '小さなAPIを設計する Qiita API設計 Hono TypeScript',
  source: 'Qiita',
  genre: 'API設計',
  technologies: ['Hono', 'TypeScript'],
  readingMinutes: 12,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-10',
}

const emptyQuery = () => ({
  keyword: '',
  genre: '',
  technology: '',
  source: '',
  createdFrom: '',
  createdTo: '',
  maxMinutes: 0,
  sort: 'updated-desc',
})

test('NFKCで正規化してキーワードを検索する', () => {
  assert.equal(normalize(' ＲＵＳＴ '), 'rust')
  assert.equal(matchesArticle(rust, { ...emptyQuery(), keyword: 'rust' }), true)
  assert.equal(matchesArticle(api, { ...emptyQuery(), keyword: 'rust' }), false)
})

test('指定した条件をすべてANDで適用する', () => {
  const query = {
    ...emptyQuery(),
    genre: 'Web開発',
    technology: 'Rust',
    source: 'Zenn',
    createdFrom: '2026-08-01',
    createdTo: '2026-08-15',
    maxMinutes: 10,
  }

  assert.equal(matchesArticle(rust, query), true)
  assert.equal(matchesArticle(api, query), false)
})

test('更新日、作成日、タイトルの指定順で比較する', () => {
  assert.deepEqual([api, rust].sort(compareArticles('updated-desc')).map(({ id }) => id), [
    'rust-workers',
    'api-design',
  ])
  assert.deepEqual([rust, api].sort(compareArticles('created-desc')).map(({ id }) => id), [
    'rust-workers',
    'api-design',
  ])
  assert.deepEqual([rust, api].sort(compareArticles('title-asc')).map(({ id }) => id), [
    'rust-workers',
    'api-design',
  ])
})

test('空の保管庫と検索結果ゼロを区別する', () => {
  assert.equal(resultMessage(0, 0), '記事がまだありません。')
  assert.equal(resultMessage(10, 0), '条件に合う記事がありません。')
  assert.equal(resultMessage(10, 1), '')
})
