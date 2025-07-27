import { Tool, Category, SearchFilters } from './types'

// Données statiques pour le développement
const toolsData: Tool[] = [
  {
    tool_name: "CassetteAI",
    tool_category: "Music",
    tool_link: "https://cassetteai.com/",
    overview: "Generate royalty-free music tracks.",
    tool_description: "Copilot Music Creation is an AI-powered tool that utilizes advanced machine learning algorithms based on latent diffus model (LDMS) to generate high-quality, royalty-free music tracks tailored to specific needs and preferences.",
    target_audience: "Musicians looking for inspiration, Content creators needing background music, Gamers creating custom game soundtracks, Music teachers seeking educational resources",
    key_features: "Music creation, Royalty-free music tracks, Tailored to specific needs and preferences, Easy-to-use interface",
    use_cases: "Create background music for videos, Generate music for podcasts, Produce original music tracks for commercial use",
    tags: "Music",
    image_url: "https://statics.topai.tools/img/tools/cassetteai.webp"
  },
  {
    tool_name: "SteosVoice",
    tool_category: "Audio generation",
    tool_link: "https://cybervoice.io/",
    overview: "Generate high-quality AI voices for audio content.",
    tool_description: "Steosvoice is an AI tool that offers high-quality neural voice artificial intelligence for various uses. It can be used for creating unique content such as dubbing videos, creating podcasts or generating audio for books, among others.",
    target_audience: "Content creators, Podcasters, Marketers, Business owners",
    key_features: "Video dubbing, Podcast creation, Audio generation for books, Over 50 voice options",
    use_cases: "Dubbing videos, Creating podcasts, Generating audio for books",
    tags: "Text-to-Speech",
    image_url: "https://statics.topai.tools/img/tools/steosvoice.webp"
  },
  {
    tool_name: "AItoZee",
    tool_category: "AI Assistant",
    tool_link: "https://app.ecomdimes.com/",
    overview: "Simplifies content creation and boosts productivity.",
    tool_description: "Aitozee offers a versatile AI toolkit for various creative needs, including AI writing, image generation, coding assistance, transcribing spoken words, and voiceover capabilities.",
    target_audience: "Content creators, Digital artists, Programmers, Transcriptionists",
    key_features: "AI writing, Image generation, Coding assistance, Transcribing spoken words",
    use_cases: "Generate engaging blog post content, Transform textual descriptions into visually appealing images, Increase productivity and efficiency by transcribing spoken words",
    tags: "AI Assistant",
    image_url: "https://statics.topai.tools/img/tools/aitozee.webp"
  },
  {
    tool_name: "Unmixr",
    tool_category: "Text-to-speech",
    tool_link: "https://unmixr.com/",
    overview: "AI-powered content creation and editing services.",
    tool_description: "Unmixr is an AI-powered tool with multiple functionalities including text-to-speech, dubbing, chat, and copywriting. It offers various features such as AI chatbot with multiple chat engines, AI image generator, and an AI editor.",
    target_audience: "Digital content creators, Video editors, Language learners, Translation agencies",
    key_features: "Text-to-speech, Dubbing, Chat, Copywriting",
    use_cases: "Generate high-quality voiceovers, Create video dubbings in multiple languages, Generate audio and video transcripts for content repurposing",
    tags: "Text-to-speech, Transcriber",
    image_url: "https://statics.topai.tools/img/tools/unmixr.webp"
  },
  {
    tool_name: "ChatGPT",
    tool_category: "AI Assistant",
    tool_link: "https://chat.openai.com/",
    overview: "Advanced AI language model for conversation and content creation.",
    tool_description: "ChatGPT is a large language model that can engage in conversations, answer questions, and help with various tasks including writing, coding, analysis, and creative content generation.",
    target_audience: "Students, Professionals, Content creators, Developers",
    key_features: "Natural language processing, Code generation, Creative writing, Problem solving",
    use_cases: "Writing assistance, Code debugging, Learning new topics, Creative brainstorming",
    tags: "AI Assistant, Language Model",
    image_url: "https://statics.topai.tools/img/tools/chatgpt.webp"
  }
]

class DataManager {
  private tools: Tool[] = toolsData
  private categories: Map<string, Tool[]> = new Map()
  private tags: Map<string, Tool[]> = new Map()

  constructor() {
    this.buildIndexes()
  }

  private buildIndexes() {
    // Build category index
    this.categories.clear()
    this.tools.forEach(tool => {
      if (tool.tool_category) {
        if (!this.categories.has(tool.tool_category)) {
          this.categories.set(tool.tool_category, [])
        }
        this.categories.get(tool.tool_category)!.push(tool)
      }
    })

    // Build tags index
    this.tags.clear()
    this.tools.forEach(tool => {
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
    return this.tools
  }

  getToolBySlug(slug: string): Tool | undefined {
    return this.tools.find(tool => 
      tool.tool_name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
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
    let results = this.tools

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
    
    this.tools.forEach(tool => {
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
      totalTools: this.tools.length,
      totalCategories: this.categories.size,
      totalTags: this.tags.size,
      toolsWithLinks: this.tools.filter(t => t.tool_link).length,
      toolsWithImages: this.tools.filter(t => t.image_url).length,
    }
  }
}

// Singleton instance
export const dataManager = new DataManager() 