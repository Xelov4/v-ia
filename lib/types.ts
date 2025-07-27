export interface Tool {
  tool_name: string
  tool_category: string
  tool_link: string
  overview: string
  tool_description: string
  target_audience: string
  key_features: string
  use_cases: string
  tags: string
  image_url: string
}

export interface Category {
  name: string
  count: number
  tools: Tool[]
}

export interface SearchFilters {
  category?: string
  tags?: string[]
  audience?: string
  search?: string
} 