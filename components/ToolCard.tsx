'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Tag, Users, Zap } from 'lucide-react'
import { Tool } from '@/lib/types'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  const getSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  }

  const formatTags = (tags: string) => {
    return tags.split(',').slice(0, 3).map(tag => tag.trim())
  }

  const formatAudience = (audience: string) => {
    return audience.split(',').slice(0, 2).map(a => a.trim())
  }

  return (
    <div className="card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {tool.tool_name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {tool.overview}
          </p>
        </div>
        {tool.image_url && (
          <div className="ml-4 flex-shrink-0">
            <Image
              src={tool.image_url}
              alt={tool.tool_name}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Category */}
      {tool.tool_category && (
        <div className="mb-3">
          <span className="badge badge-primary">
            {tool.tool_category}
          </span>
        </div>
      )}

      {/* Tags */}
      {tool.tags && (
        <div className="mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <Tag className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Tags</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {formatTags(tool.tags).map((tag, index) => (
              <span key={index} className="badge badge-secondary text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audience */}
      {tool.target_audience && (
        <div className="mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">For</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {formatAudience(tool.target_audience).map((audience, index) => (
              <span key={index} className="text-xs text-gray-600">
                {audience}
                {index < formatAudience(tool.target_audience).length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {tool.key_features && (
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-1">
            <Zap className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Features</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {tool.key_features.split(',').slice(0, 2).join(', ')}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex space-x-2">
        <Link
          href={`/tool/${getSlug(tool.tool_name)}`}
          className="btn-primary text-sm flex-1 text-center"
        >
          View Details
        </Link>
        {tool.tool_link && (
          <a
            href={tool.tool_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center justify-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Visit</span>
          </a>
        )}
      </div>
    </div>
  )
} 