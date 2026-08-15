import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Article } from '../shared/article'
import { createArticleCard, renderDialog } from './render'

const article: Article = {
  id: 'rust-workers',
  url: 'https://example.com/rust',
  title: 'Cloudflare WorkersでRustを動かす',
  source: 'Zenn',
  genre: 'Web開発',
  technologies: ['Rust', 'WebAssembly'],
  reading_minutes: 8,
  created_at: '2026-08-14',
  updated_at: '2026-08-15',
  summary: ['概要です。', '詳しい説明です。'],
  ogp: { image_url: 'https://example.com/og.png' },
}

beforeEach(() => {
  document.body.replaceChildren()
})

describe('createArticleCard', () => {
  it('カード全体を押せるボタンとして記事情報を表示する', () => {
    const onOpen = vi.fn()
    const card = createArticleCard(article, onOpen)

    card.click()

    expect(card.tagName).toBe('BUTTON')
    expect(card.type).toBe('button')
    expect(card.textContent).toContain(article.title)
    expect(card.textContent).toContain('読了 8分')
    expect(card.querySelector('img')?.getAttribute('src')).toBe(article.ogp?.image_url)
    expect(onOpen).toHaveBeenCalledWith(article)
  })

  it('記事文字列をHTMLとして解釈しない', () => {
    const unsafe = { ...article, title: '<img src=x onerror=alert(1)>' }
    const card = createArticleCard(unsafe, () => undefined)

    expect(card.querySelectorAll('img')).toHaveLength(1)
    expect(card.textContent).toContain('<img src=x onerror=alert(1)>')
  })
})

describe('renderDialog', () => {
  it('記事情報を要約より上に置き、全要約段落を表示する', () => {
    const dialog = document.createElement('dialog')
    dialog.innerHTML = `
      <div data-dialog-meta></div><h2 data-dialog-title></h2>
      <div data-dialog-tags></div><div data-dialog-dates></div>
      <a data-dialog-source></a><div data-dialog-summary></div>
    `

    renderDialog(dialog, article)

    const meta = dialog.querySelector('[data-dialog-meta]')
    const summary = dialog.querySelector('[data-dialog-summary]')
    expect(meta?.textContent).toContain('Web開発')
    expect(meta?.textContent).toContain('読了 8分')
    expect(summary?.children).toHaveLength(2)
    expect(dialog.querySelector('[data-dialog-source]')?.getAttribute('href')).toBe(article.url)
    expect(dialog.querySelector('[data-dialog-title]')?.compareDocumentPosition(summary as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
