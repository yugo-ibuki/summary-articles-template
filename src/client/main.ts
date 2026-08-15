import './style.css'

import type { Article, ArticleFacets, ArticleIndex, SearchQuery, SortOrder } from '../shared/article'
import { filterArticles } from './filter'
import { createArticleCard, renderDialog } from './render'

const required = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Required element is missing: ${selector}`)
  return element
}

const form = required<HTMLFormElement>('#search-form')
const grid = required<HTMLElement>('[data-article-grid]')
const dialog = required<HTMLDialogElement>('#article-dialog')
const notice = required<HTMLElement>('[data-notice]')
const sort = required<HTMLSelectElement>('#sort')
let allArticles: Article[] = []

const control = <T extends HTMLInputElement | HTMLSelectElement>(id: string): T => required<T>(id)

const readQuery = (): SearchQuery => ({
  keyword: control<HTMLInputElement>('#keyword').value,
  genre: control<HTMLSelectElement>('#genre').value,
  technology: control<HTMLSelectElement>('#technology').value,
  source: control<HTMLSelectElement>('#source').value,
  createdFrom: control<HTMLInputElement>('#created-from').value,
  createdTo: control<HTMLInputElement>('#created-to').value,
  maxMinutes: Number(control<HTMLSelectElement>('#max-minutes').value),
  sort: sort.value as SortOrder,
})

const openArticle = (article: Article): void => {
  renderDialog(dialog, article)
  dialog.showModal()
  dialog.scrollTo({ top: 0, behavior: 'instant' })
}

const renderConditions = (query: SearchQuery): void => {
  const target = required<HTMLElement>('[data-active-conditions]')
  const labels = [
    query.keyword && `検索: ${query.keyword}`,
    query.genre,
    query.technology,
    query.source,
    query.createdFrom && `作成日 ${query.createdFrom}〜`,
    query.createdTo && `作成日 〜${query.createdTo}`,
    query.maxMinutes > 0 && `${query.maxMinutes}分以内`,
  ].filter((label): label is string => Boolean(label))
  target.replaceChildren(
    ...labels.map((label) => {
      const span = document.createElement('span')
      span.textContent = label
      return span
    }),
  )
}

const render = (): void => {
  const query = readQuery()
  const articles = filterArticles(allArticles, query)
  grid.replaceChildren(...articles.map((article) => createArticleCard(article, openArticle)))
  required<HTMLElement>('[data-result-count]').textContent = `${articles.length} / ${allArticles.length}件`
  required<HTMLElement>('[data-filter-count]').textContent = `${articles.length}件`
  notice.textContent = articles.length === 0 ? '条件に合う記事がありません。' : ''
  notice.hidden = articles.length > 0
  renderConditions(query)
}

const fillSelect = (selector: string, values: string[]): void => {
  const select = control<HTMLSelectElement>(selector)
  for (const value of values) {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    select.append(option)
  }
}

const fillFacets = (facets: ArticleFacets): void => {
  fillSelect('#genre', facets.genres)
  fillSelect('#technology', facets.technologies)
  fillSelect('#source', facets.sources)
}

const loadArticles = async (): Promise<void> => {
  const response = await fetch('/api/articles')
  if (!response.ok) throw new Error(`記事の取得に失敗しました (${response.status})`)
  const index = (await response.json()) as ArticleIndex
  allArticles = index.articles
  fillFacets(index.facets)
  required<HTMLElement>('[data-total-count]').textContent = `収録 ${allArticles.length}件`
  render()
}

form.addEventListener('input', render)
sort.addEventListener('change', render)
form.addEventListener('reset', () => {
  window.setTimeout(render)
})
required<HTMLButtonElement>('.dialog-close').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close()
})

void loadArticles().catch((error: unknown) => {
  notice.hidden = false
  notice.textContent = error instanceof Error ? error.message : '記事の取得に失敗しました。'
})
