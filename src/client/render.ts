import type { Article } from '../shared/article'

const textElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tagName)
  element.className = className
  element.textContent = text
  return element
}

const formatDate = (date: string): string => date.replaceAll('-', '.')

const createVisual = (article: Article): HTMLElement => {
  const visual = document.createElement('div')
  visual.className = 'visual'

  const fallback = document.createElement('div')
  fallback.className = 'visual-fallback'
  fallback.append(
    textElement('span', 'visual-source', article.source),
    textElement('strong', 'visual-title', article.ogp?.title || article.title),
    textElement('span', 'visual-tech', article.technologies.slice(0, 3).join('　/　')),
  )
  visual.append(fallback)

  if (article.ogp?.image_url) {
    const image = document.createElement('img')
    image.className = 'visual-image'
    image.src = article.ogp.image_url
    image.alt = ''
    image.loading = 'lazy'
    image.addEventListener('error', () => image.remove(), { once: true })
    visual.append(image)
  }

  return visual
}

const createTags = (technologies: string[], className = 'tags'): HTMLElement => {
  const tags = document.createElement('div')
  tags.className = className
  for (const technology of technologies) tags.append(textElement('span', '', technology))
  return tags
}

export const createArticleCard = (article: Article, onOpen: (article: Article) => void): HTMLButtonElement => {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'article-card'
  card.dataset.articleId = article.id
  card.setAttribute('aria-label', `${article.title}の要約を開く`)

  const meta = document.createElement('div')
  meta.className = 'card-meta'
  meta.append(textElement('span', 'card-genre', article.genre), textElement('span', '', `読了 ${article.reading_minutes}分`))

  const dates = document.createElement('div')
  dates.className = 'dates'
  dates.append(
    textElement('span', '', `作成 ${formatDate(article.created_at)}`),
    textElement('span', '', `更新 ${formatDate(article.updated_at)}`),
  )

  card.append(
    createVisual(article),
    meta,
    textElement('h3', 'title', article.title),
    textElement('p', 'card-summary', article.summary[0] ?? ''),
    createTags(article.technologies),
    dates,
  )
  card.addEventListener('click', () => onOpen(article))
  return card
}

const required = <T extends Element>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector)
  if (!element) throw new Error(`Required element is missing: ${selector}`)
  return element
}

export const renderDialog = (dialog: HTMLDialogElement, article: Article): void => {
  const meta = required<HTMLElement>(dialog, '[data-dialog-meta]')
  meta.replaceChildren(
    textElement('span', '', article.genre),
    textElement('span', '', `読了 ${article.reading_minutes}分`),
    textElement('span', '', article.source),
  )

  required<HTMLElement>(dialog, '[data-dialog-title]').textContent = article.title
  required<HTMLElement>(dialog, '[data-dialog-tags]').replaceChildren(...createTags(article.technologies).children)

  const dates = required<HTMLElement>(dialog, '[data-dialog-dates]')
  dates.replaceChildren(
    textElement('span', '', `作成 ${formatDate(article.created_at)}`),
    textElement('span', '', `更新 ${formatDate(article.updated_at)}`),
  )

  const source = required<HTMLAnchorElement>(dialog, '[data-dialog-source]')
  source.href = article.url
  source.target = '_blank'
  source.rel = 'noopener noreferrer'

  const summary = required<HTMLElement>(dialog, '[data-dialog-summary]')
  summary.replaceChildren(
    ...article.summary.map((paragraph, index) =>
      textElement('p', index >= 2 ? 'dialog-summary-line' : '', paragraph),
    ),
  )
}
