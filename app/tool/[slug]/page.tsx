import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { dataManager } from '@/lib/data'
import Header from '@/components/Header'
import { ExternalLink, Tag, Users, Zap, ArrowLeft, Globe, Image as ImageIcon } from 'lucide-react'
import { notFound } from 'next/navigation'

interface ToolPageProps {
  params: {
    slug: string
  }
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = dataManager.getToolBySlug(params.slug)

  if (!tool) {
    notFound()
  }

  const formatTags = (tags: string) => {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  }

  const formatAudience = (audience: string) => {
    return audience.split(',').map(a => a.trim()).filter(a => a)
  }

  const formatFeatures = (features: string) => {
    return features.split(',').map(feature => feature.trim()).filter(feature => feature)
  }

  const formatUseCases = (useCases: string) => {
    return useCases.split(',').map(useCase => useCase.trim()).filter(useCase => useCase)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/tools" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </nav>

        {/* Tool Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {tool.image_url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={tool.image_url}
                      alt={tool.tool_name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {tool.tool_name}
                  </h1>
                  {tool.tool_category && (
                    <span className="badge badge-primary text-sm">
                      {tool.tool_category}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-6">
                {tool.overview}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {tool.tool_link && (
                  <a
                    href={tool.tool_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                  </a>
                )}
                <Link href="/tools" className="btn-secondary text-center">
                  Browse More Tools
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About {tool.tool_name}
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {tool.tool_description}
                </p>
              </div>
            </div>

            {/* Key Features */}
            {tool.key_features && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary-600" />
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formatFeatures(tool.key_features).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {tool.use_cases && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Use Cases
                </h2>
                <div className="space-y-3">
                  {formatUseCases(tool.use_cases).map((useCase, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Target Audience */}
            {tool.target_audience && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-600" />
                  Target Audience
                </h3>
                <div className="space-y-2">
                  {formatAudience(tool.target_audience).map((audience, index) => (
                    <span key={index} className="badge badge-secondary block text-center">
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {tool.tags && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {formatTags(tool.tags).map((tag, index) => (
                    <span key={index} className="badge badge-secondary text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/tools" 
                  className="block text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Browse All Tools
                </Link>
                {tool.tool_category && (
                  <Link 
                    href={`/category/${tool.tool_category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="block text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    More {tool.tool_category} Tools
                  </Link>
                )}
                <Link 
                  href="/categories" 
                  className="block text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 