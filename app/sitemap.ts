import { dataManager } from '@/lib/data'

export default function sitemap() {
  const baseUrl = 'https://www.video-ia.net'
  
  // Pages statiques
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Pages des outils
  const tools = dataManager.getAllTools()
  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}/tool/${tool.tool_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Pages des catégories
  const categories = dataManager.getCategories()
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...toolPages, ...categoryPages]
} 