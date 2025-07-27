import React from 'react'
import Link from 'next/link'
import { dataManager } from '@/lib/data'
import Header from '@/components/Header'
import ToolCard from '@/components/ToolCard'
import { Search, Grid, Users, Zap, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const stats = dataManager.getStats()
  const categories = dataManager.getCategories().slice(0, 6)
  const popularTools = dataManager.getAllTools().slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover the Best AI Tools
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Browse thousands of AI-powered tools for video creation, content generation, and more. 
              Find the perfect tool for your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools" className="btn-primary text-lg px-8 py-3">
                Browse All Tools
              </Link>
              <Link href="/categories" className="btn-secondary text-lg px-8 py-3">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalTools.toLocaleString()}
              </div>
              <div className="text-gray-600">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalCategories}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stats.totalTags}
              </div>
              <div className="text-gray-600">Tags</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round((stats.toolsWithLinks / stats.totalTools) * 100)}%
              </div>
              <div className="text-gray-600">With Links</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore AI tools by category. Find the perfect tool for your specific needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                className="card p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">
                      {category.count} tools available
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {category.count}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/categories" className="btn-primary">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured AI Tools
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover some of the most popular and innovative AI tools in our directory.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.map((tool) => (
              <ToolCard key={tool.tool_name} tool={tool} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/tools" className="btn-primary">
              View All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Video-IA.net?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your comprehensive directory for AI tools, designed to help you find the perfect solution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Discovery
              </h3>
              <p className="text-gray-600">
                Find the perfect AI tool with our advanced search and filtering system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comprehensive Directory
              </h3>
              <p className="text-gray-600">
                Browse thousands of AI tools across multiple categories and use cases.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-600">
                Get the latest information about new AI tools and industry trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect AI Tool?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Start exploring our comprehensive directory of AI tools today.
          </p>
          <Link href="/tools" className="btn-secondary text-lg px-8 py-3">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
} 