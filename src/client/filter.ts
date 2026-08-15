import type { Article, SearchQuery } from '../shared/article'

const normalize = (value: string): string => value.normalize('NFKC').trim().toLocaleLowerCase('ja')

const searchableText = (article: Article): string =>
  normalize(
    [
      article.title,
      article.summary.join(' '),
      article.source,
      article.genre,
      article.technologies.join(' '),
    ].join(' '),
  )

const matches = (article: Article, query: SearchQuery, keyword: string): boolean => {
  if (keyword && !searchableText(article).includes(keyword)) return false
  if (query.genre && article.genre !== query.genre) return false
  if (query.technology && !article.technologies.includes(query.technology)) return false
  if (query.source && article.source !== query.source) return false
  if (query.createdFrom && article.created_at < query.createdFrom) return false
  if (query.createdTo && article.created_at > query.createdTo) return false
  if (query.maxMinutes > 0 && article.reading_minutes > query.maxMinutes) return false
  return true
}

const compareArticles = (query: SearchQuery) => (left: Article, right: Article): number => {
  switch (query.sort) {
    case 'created-desc':
      return right.created_at.localeCompare(left.created_at) || left.id.localeCompare(right.id)
    case 'title-asc':
      return left.title.localeCompare(right.title, 'ja') || left.id.localeCompare(right.id)
    case 'updated-desc':
      return right.updated_at.localeCompare(left.updated_at) || left.id.localeCompare(right.id)
  }
}

export const filterArticles = (articles: Article[], query: SearchQuery): Article[] => {
  const keyword = normalize(query.keyword)
  return articles.filter((article) => matches(article, query, keyword)).sort(compareArticles(query))
}
