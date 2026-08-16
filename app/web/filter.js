export const normalize = (value) => value.normalize('NFKC').trim().toLocaleLowerCase('ja')

export const matchesArticle = (article, query) => {
  const keyword = normalize(query.keyword)
  if (keyword && !normalize(article.searchable).includes(keyword)) return false
  if (query.genre && article.genre !== query.genre) return false
  if (query.technology && !article.technologies.includes(query.technology)) return false
  if (query.source && article.source !== query.source) return false
  if (query.createdFrom && article.createdAt < query.createdFrom) return false
  if (query.createdTo && article.createdAt > query.createdTo) return false
  if (query.maxMinutes > 0 && article.readingMinutes > query.maxMinutes) return false
  return true
}

export const compareArticles = (sort) => (left, right) => {
  if (sort === 'created-desc') {
    return right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id)
  }
  if (sort === 'title-asc') {
    return left.title.localeCompare(right.title, 'ja') || left.id.localeCompare(right.id)
  }
  return right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id)
}

export const resultMessage = (total, matched) => {
  if (total === 0) return '記事がまだありません。'
  if (matched === 0) return '条件に合う記事がありません。'
  return ''
}
