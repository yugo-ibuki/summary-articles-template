export type Ogp = {
  image_url?: string
  title?: string
  description?: string
}

export type Article = {
  id: string
  url: string
  title: string
  source: string
  genre: string
  technologies: string[]
  reading_minutes: number
  created_at: string
  updated_at: string
  summary: string[]
  ogp?: Ogp
}

export type ArticleFacets = {
  genres: string[]
  technologies: string[]
  sources: string[]
}

export type ArticleIndex = {
  generated_at: string
  articles: Article[]
  facets: ArticleFacets
}

export type SortOrder = 'updated-desc' | 'created-desc' | 'title-asc'

export type SearchQuery = {
  keyword: string
  genre: string
  technology: string
  source: string
  createdFrom: string
  createdTo: string
  maxMinutes: number
  sort: SortOrder
}

export const emptySearchQuery = (): SearchQuery => ({
  keyword: '',
  genre: '',
  technology: '',
  source: '',
  createdFrom: '',
  createdTo: '',
  maxMinutes: 0,
  sort: 'updated-desc',
})
