import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface ToolWithRelations {
  id: string
  name: string
  slug: string
  category: string
  link: string | null
  overview: string
  description: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  tags: {
    tag: {
      name: string
      slug: string
    }
  }[]
  features: {
    feature: string
  }[]
  useCases: {
    useCase: string
  }[]
  audiences: {
    audience: string
  }[]
}

export interface CategoryWithCount {
  name: string
  slug: string
  count: number
  tools: ToolWithRelations[]
}

export interface TagWithCount {
  name: string
  slug: string
  count: number
}

export interface SearchFilters {
  category?: string
  tags?: string[]
  audience?: string
  search?: string
}

export interface SiteStats {
  totalTools: number
  totalCategories: number
  totalTags: number
  lastUpdated: Date
}

class DatabaseManager {
  async getAllTools(): Promise<ToolWithRelations[]> {
    return await prisma.tool.findMany({
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  async getToolBySlug(slug: string): Promise<ToolWithRelations | null> {
    return await prisma.tool.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      }
    })
  }

  async getCategories(): Promise<CategoryWithCount[]> {
    const categories = await prisma.tool.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    })

    const result: CategoryWithCount[] = []
    
    for (const cat of categories) {
      const tools = await this.getToolsByCategory(cat.category)
      result.push({
        name: cat.category,
        slug: cat.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        count: cat._count.id,
        tools
      })
    }

    return result.sort((a, b) => b.count - a.count)
  }

  async getToolsByCategory(category: string): Promise<ToolWithRelations[]> {
    return await prisma.tool.findMany({
      where: { category },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  async getToolsByTag(tagName: string): Promise<ToolWithRelations[]> {
    return await prisma.tool.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tagName
            }
          }
        }
      },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  async searchTools(filters: SearchFilters): Promise<ToolWithRelations[]> {
    const where: any = {}

    if (filters.category) {
      where.category = {
        contains: filters.category,
        mode: 'insensitive'
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: filters.tags
            }
          }
        }
      }
    }

    if (filters.audience) {
      where.audiences = {
        some: {
          audience: {
            contains: filters.audience,
            mode: 'insensitive'
          }
        }
      }
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          overview: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    return await prisma.tool.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  async getPopularTags(limit: number = 20): Promise<TagWithCount[]> {
    const tags = await prisma.toolTag.groupBy({
      by: ['tagId'],
      _count: {
        toolId: true
      },
      orderBy: {
        _count: {
          toolId: 'desc'
        }
      },
      take: limit
    })

    const result: TagWithCount[] = []
    
    for (const tag of tags) {
      const tagData = await prisma.tag.findUnique({
        where: { id: tag.tagId }
      })
      
      if (tagData) {
        result.push({
          name: tagData.name,
          slug: tagData.slug,
          count: tag._count.toolId
        })
      }
    }

    return result
  }

  async getStats(): Promise<SiteStats> {
    const stats = await prisma.siteStats.findUnique({
      where: { id: 'main' }
    })

    if (stats) {
      return {
        totalTools: stats.totalTools,
        totalCategories: stats.totalCategories,
        totalTags: stats.totalTags,
        lastUpdated: stats.lastUpdated
      }
    }

    // Fallback: calculate stats manually
    const totalTools = await prisma.tool.count()
    const totalCategories = await prisma.category.count()
    const totalTags = await prisma.tag.count()

    return {
      totalTools,
      totalCategories,
      totalTags,
      lastUpdated: new Date()
    }
  }

  async getRandomTools(limit: number = 8): Promise<ToolWithRelations[]> {
    return await prisma.tool.findMany({
      take: limit,
      include: {
        tags: {
          include: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        features: {
          select: {
            feature: true
          }
        },
        useCases: {
          select: {
            useCase: true
          }
        },
        audiences: {
          select: {
            audience: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}

export const databaseManager = new DatabaseManager() 