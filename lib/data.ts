import { Tool, Category, SearchFilters } from './types'

// Données statiques pour développement
const toolsData: Tool[] = [
  {
    tool_name: "ChatGPT",
    tool_category: "AI Assistant",
    tool_link: "https://chat.openai.com",
    overview: "Assistant IA conversationnel",
    tool_description: "ChatGPT est un modèle de langage développé par OpenAI qui peut comprendre et générer du texte humain. Il peut être utilisé pour la rédaction, la programmation, l'analyse et la conversation.",
    target_audience: "Professionnels, étudiants, créateurs",
    key_features: "Conversation naturelle, génération de texte, assistance",
    use_cases: "Rédaction, programmation, brainstorming",
    tags: "AI, chatbot, texte, assistant",
    image_url: "https://statics.topai.tools/chatgpt.png"
  },
  {
    tool_name: "Midjourney",
    tool_category: "Image Generation",
    tool_link: "https://midjourney.com",
    overview: "Générateur d'images IA",
    tool_description: "Midjourney est un outil de génération d'images par IA qui permet de créer des visuels artistiques à partir de descriptions textuelles.",
    target_audience: "Artistes, designers, créateurs",
    key_features: "Génération d'images, styles artistiques, haute qualité",
    use_cases: "Art digital, design, illustrations",
    tags: "AI, image, art, génération",
    image_url: "https://statics.topai.tools/midjourney.png"
  },
  {
    tool_name: "GitHub Copilot",
    tool_category: "Code Assistant",
    tool_link: "https://github.com/features/copilot",
    overview: "Assistant de programmation IA",
    tool_description: "GitHub Copilot est un assistant de programmation alimenté par l'IA qui aide les développeurs à écrire du code plus rapidement et plus efficacement.",
    target_audience: "Développeurs, programmeurs",
    key_features: "Autocomplétion, suggestions de code, intégration IDE",
    use_cases: "Développement, debugging, documentation",
    tags: "AI, code, développement, assistant",
    image_url: "https://statics.topai.tools/copilot.png"
  }
]

export class DataManager {
  private categories: Map<string, Tool[]> = new Map()
  private tags: Map<string, Tool[]> = new Map()

  constructor() {
    this.buildIndexes()
  }

  private buildIndexes() {
    // Build category index
    this.categories.clear()
    toolsData.forEach(tool => {
      if (tool.tool_category) {
        if (!this.categories.has(tool.tool_category)) {
          this.categories.set(tool.tool_category, [])
        }
        this.categories.get(tool.tool_category)!.push(tool)
      }
    })

    // Build tags index
    this.tags.clear()
    toolsData.forEach(tool => {
      if (tool.tags) {
        const tagList = tool.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        tagList.forEach(tag => {
          if (!this.tags.has(tag)) {
            this.tags.set(tag, [])
          }
          this.tags.get(tag)!.push(tool)
        })
      }
    })
  }

  getAllTools(): Tool[] {
    return toolsData
  }

  getToolBySlug(slug: string): Tool | undefined {
    return toolsData.find(tool => 
      tool.tool_name.toLowerCase().replace(/\s+/g, '-') === slug
    )
  }

  getCategories(): Category[] {
    return Array.from(this.categories.entries()).map(([name, tools]) => ({
      name,
      count: tools.length,
      tools
    })).sort((a, b) => b.count - a.count)
  }

  getToolsByCategory(category: string): Tool[] {
    return this.categories.get(category) || []
  }

  getToolsByTag(tag: string): Tool[] {
    return this.tags.get(tag) || []
  }

  searchTools(filters: SearchFilters): Tool[] {
    let results = toolsData

    if (filters.category) {
      results = results.filter(tool => 
        tool.tool_category.toLowerCase().includes(filters.category!.toLowerCase())
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(tool => {
        const toolTags = tool.tags.toLowerCase().split(',').map(t => t.trim())
        return filters.tags!.some(tag => 
          toolTags.some(toolTag => toolTag.includes(tag.toLowerCase()))
        )
      })
    }

    if (filters.audience) {
      results = results.filter(tool =>
        tool.target_audience.toLowerCase().includes(filters.audience!.toLowerCase())
      )
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      results = results.filter(tool =>
        tool.tool_name.toLowerCase().includes(searchTerm) ||
        tool.overview.toLowerCase().includes(searchTerm) ||
        tool.tool_description.toLowerCase().includes(searchTerm) ||
        tool.key_features.toLowerCase().includes(searchTerm) ||
        tool.use_cases.toLowerCase().includes(searchTerm)
      )
    }

    return results
  }

  getPopularTags(limit: number = 20): { tag: string; count: number }[] {
    const tagCounts = new Map<string, number>()
    
    toolsData.forEach(tool => {
      if (tool.tags) {
        const tags = tool.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getStats() {
    return {
      totalTools: toolsData.length,
      totalCategories: this.categories.size,
      totalTags: this.tags.size,
      toolsWithLinks: toolsData.filter(t => t.tool_link).length,
      toolsWithImages: toolsData.filter(t => t.image_url).length,
    }
  }
}

export const dataManager = new DataManager() 