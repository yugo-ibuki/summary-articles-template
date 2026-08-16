import { compareArticles, matchesArticle, resultMessage } from './filter.js'

const required = (selector, root = document) => {
  const element = root.querySelector(selector)
  if (!element) throw new Error(`Required element is missing: ${selector}`)
  return element
}

const form = required('#search-form')
const grid = required('[data-article-grid]')
const dialog = required('#article-dialog')
const notice = required('[data-notice]')
const sort = required('#sort')

const records = Array.from(grid.querySelectorAll('.article-item')).map((element) => ({
  element,
  id: element.dataset.articleId ?? '',
  url: element.dataset.articleUrl ?? '',
  title: element.dataset.title ?? '',
  searchable: element.dataset.search ?? '',
  source: element.dataset.source ?? '',
  genre: element.dataset.genre ?? '',
  technologies: Array.from(element.querySelectorAll('[data-card-tech]'), (tag) => tag.textContent ?? ''),
  readingMinutes: Number(element.dataset.readingMinutes ?? 0),
  createdAt: element.dataset.createdAt ?? '',
  updatedAt: element.dataset.updatedAt ?? '',
}))

const control = (selector) => required(selector)
const readQuery = () => ({
  keyword: control('#keyword').value,
  genre: control('#genre').value,
  technology: control('#technology').value,
  source: control('#source').value,
  createdFrom: control('#created-from').value,
  createdTo: control('#created-to').value,
  maxMinutes: Number(control('#max-minutes').value),
  sort: sort.value,
})

const renderConditions = (query) => {
  const labels = [
    query.keyword && `検索: ${query.keyword}`,
    query.genre,
    query.technology,
    query.source,
    query.createdFrom && `作成日 ${query.createdFrom}〜`,
    query.createdTo && `作成日 〜${query.createdTo}`,
    query.maxMinutes > 0 && `${query.maxMinutes}分以内`,
  ].filter(Boolean)
  required('[data-active-conditions]').replaceChildren(
    ...labels.map((label) => Object.assign(document.createElement('span'), { textContent: label })),
  )
}

const render = () => {
  const query = readQuery()
  const matches = records.filter((record) => matchesArticle(record, query))
  const matchIds = new Set(matches.map(({ id }) => id))
  for (const record of [...records].sort(compareArticles(query.sort))) {
    record.element.hidden = !matchIds.has(record.id)
    grid.append(record.element)
  }
  required('[data-result-count]').textContent = `${matches.length} / ${records.length}件`
  required('[data-filter-count]').textContent = `${matches.length}件`
  notice.textContent = resultMessage(records.length, matches.length)
  notice.hidden = notice.textContent === ''
  renderConditions(query)
}

const addText = (root, text) => {
  const span = document.createElement('span')
  span.textContent = text
  root.append(span)
}
const formatDate = (date) => date.replaceAll('-', '.')

const openArticle = (record) => {
  const meta = required('[data-dialog-meta]', dialog)
  meta.replaceChildren()
  addText(meta, record.genre)
  addText(meta, `読了 ${record.readingMinutes}分`)
  addText(meta, record.source)
  required('[data-dialog-title]', dialog).textContent = record.title
  required('[data-dialog-tags]', dialog).replaceChildren(
    ...record.technologies.map((technology) =>
      Object.assign(document.createElement('span'), { textContent: technology }),
    ),
  )
  const dates = required('[data-dialog-dates]', dialog)
  dates.replaceChildren()
  addText(dates, `作成 ${formatDate(record.createdAt)}`)
  addText(dates, `更新 ${formatDate(record.updatedAt)}`)
  required('[data-dialog-source]', dialog).href = record.url
  const template = required('[data-article-summary]', record.element)
  required('[data-dialog-summary]', dialog).replaceChildren(template.content.cloneNode(true))
  dialog.showModal()
  dialog.scrollTo({ top: 0, behavior: 'instant' })
}

for (const record of records) {
  required('.article-card', record.element).addEventListener('click', () => openArticle(record))
  const image = record.element.querySelector('.visual-image')
  image?.addEventListener('error', () => image.remove(), { once: true })
}

form.addEventListener('input', render)
form.addEventListener('change', render)
sort.addEventListener('change', render)
form.addEventListener('reset', () => window.setTimeout(render))
required('.dialog-close', dialog).addEventListener('click', () => dialog.close())
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close()
})
render()
