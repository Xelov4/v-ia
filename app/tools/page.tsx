'use client'

import React, { useState, useEffect } from 'react'
import { dataManager } from '@/lib/data'
import { SearchFilters } from '@/lib/types'
import Header from '@/components/Header'
import ToolCard from '@/components/ToolCard'
import { Filter, Search, Grid, List } from 'lucide-react'

export default function ToolsPage() {
  const [tools, setTools] = useState(dataManager.getAllTools())
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const itemsPerPage = 20
  const totalPages = Math.ceil(tools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTools = tools.slice(startIndex, endIndex)

  const categories = dataManager.getCategories()
  const popularTags = dataManager.getPopularTags(10)

  useEffect(() => {
    const filteredTools = dataManager.searchTools(filters)
    setTools(filteredTools)
    setCurrentPage(1)
  }, [filters])

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }))
  }

  const handleTagFilter = (tag: string) => {
    setFilters(prev => ({ 
      ...prev, 
      tags: prev.tags ? [...prev.tags, tag] : [tag] 
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Tools Directory
          </h1>
          <p className="text-gray-600">
            Discover {tools.length.toLocaleString()} AI tools across {categories.length} categories
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.slice(0, 10).map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryFilter(category.name)}
                        className="block text-left text-sm text-gray-600 hover:text-primary-600"
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => handleTagFilter(tag)}
                        className="badge badge-secondary text-xs"
                      >
                        {tag} ({count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, tools.length)} of {tools.length} tools
            </p>
            {Object.keys(filters).length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category && (
                  <span className="badge badge-primary text-xs">{filters.category}</span>
                )}
                {filters.tags?.map(tag => (
                  <span key={tag} className="badge badge-secondary text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Tools Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {currentTools.map((tool) => (
              <ToolCard key={tool.tool_name} tool={tool} />
            ))}
          </div>

          {currentTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No tools found matching your criteria.</p>
              <button onClick={clearFilters} className="btn-primary mt-4">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      currentPage === page 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 