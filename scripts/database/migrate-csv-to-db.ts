import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface CSVTool {
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

function parseCSVLine(line: string): CSVTool {
  const columns = line.split(';')
  return {
    tool_name: columns[0] || '',
    tool_category: columns[1] || '',
    tool_link: columns[2] || '',
    overview: columns[3] || '',
    tool_description: columns[4] || '',
    target_audience: columns[5] || '',
    key_features: columns[6] || '',
    use_cases: columns[7] || '',
    tags: columns[8] || '',
    image_url: columns[9] || '',
  }
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function splitAndClean(text: string): string[] {
  return text
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

async function migrateData() {
  try {
    console.log('🚀 Starting CSV to Database migration...')

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'working_database_rationalized_full.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // Skip header
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    console.log(`📊 Found ${dataLines.length} tools to migrate`)

    // Track unique categories and tags
    const categories = new Set<string>()
    const tags = new Set<string>()

    // First pass: collect all categories and tags
    for (const line of dataLines) {
      const tool = parseCSVLine(line)
      
      if (tool.tool_category) {
        categories.add(tool.tool_category)
      }
      
      if (tool.tags) {
        const toolTags = splitAndClean(tool.tags)
        toolTags.forEach(tag => tags.add(tag))
      }
    }

    console.log(`📂 Found ${categories.size} unique categories`)
    console.log(`🏷️  Found ${tags.size} unique tags`)

    // Create categories
    console.log('📂 Creating categories...')
    for (const categoryName of categories) {
      const slug = createSlug(categoryName)
      await prisma.category.upsert({
        where: { slug },
        update: { name: categoryName },
        create: {
          name: categoryName,
          slug,
          description: `AI tools in the ${categoryName} category`
        }
      })
    }

    // Create tags
    console.log('🏷️  Creating tags...')
    for (const tagName of tags) {
      const slug = createSlug(tagName)
      await prisma.tag.upsert({
        where: { slug },
        update: { name: tagName },
        create: {
          name: tagName,
          slug
        }
      })
    }

    // Create tools
    console.log('🛠️  Creating tools...')
    let successCount = 0
    let errorCount = 0

    for (const line of dataLines) {
      try {
        const tool = parseCSVLine(line)
        
        if (!tool.tool_name) {
          errorCount++
          continue
        }

        const slug = createSlug(tool.tool_name)

        // Create the tool
        const createdTool = await prisma.tool.upsert({
          where: { slug },
          update: {
            name: tool.tool_name,
            category: tool.tool_category,
            link: tool.tool_link || null,
            overview: tool.overview,
            description: tool.tool_description,
            imageUrl: tool.image_url || null,
          },
          create: {
            name: tool.tool_name,
            slug,
            category: tool.tool_category,
            link: tool.tool_link || null,
            overview: tool.overview,
            description: tool.tool_description,
            imageUrl: tool.image_url || null,
          }
        })

        // Create tool features
        if (tool.key_features) {
          const features = splitAndClean(tool.key_features)
          for (const feature of features) {
            await prisma.toolFeature.upsert({
              where: {
                id: `${createdTool.id}-${createSlug(feature)}`
              },
              update: { feature },
              create: {
                id: `${createdTool.id}-${createSlug(feature)}`,
                toolId: createdTool.id,
                feature
              }
            })
          }
        }

        // Create tool use cases
        if (tool.use_cases) {
          const useCases = splitAndClean(tool.use_cases)
          for (const useCase of useCases) {
            await prisma.toolUseCase.upsert({
              where: {
                id: `${createdTool.id}-${createSlug(useCase)}`
              },
              update: { useCase },
              create: {
                id: `${createdTool.id}-${createSlug(useCase)}`,
                toolId: createdTool.id,
                useCase
              }
            })
          }
        }

        // Create tool audiences
        if (tool.target_audience) {
          const audiences = splitAndClean(tool.target_audience)
          for (const audience of audiences) {
            await prisma.toolAudience.upsert({
              where: {
                id: `${createdTool.id}-${createSlug(audience)}`
              },
              update: { audience },
              create: {
                id: `${createdTool.id}-${createSlug(audience)}`,
                toolId: createdTool.id,
                audience
              }
            })
          }
        }

        // Create tool tags
        if (tool.tags) {
          const toolTags = splitAndClean(tool.tags)
          for (const tagName of toolTags) {
            const tag = await prisma.tag.findUnique({
              where: { name: tagName }
            })
            
            if (tag) {
              await prisma.toolTag.upsert({
                where: {
                  toolId_tagId: {
                    toolId: createdTool.id,
                    tagId: tag.id
                  }
                },
                update: {},
                create: {
                  toolId: createdTool.id,
                  tagId: tag.id
                }
              })
            }
          }
        }

        successCount++
        
        if (successCount % 100 === 0) {
          console.log(`✅ Processed ${successCount} tools...`)
        }

      } catch (error) {
        console.error(`❌ Error processing tool: ${error}`)
        errorCount++
      }
    }

    // Update site stats
    const totalTools = await prisma.tool.count()
    const totalCategories = await prisma.category.count()
    const totalTags = await prisma.tag.count()

    await prisma.siteStats.upsert({
      where: { id: 'main' },
      update: {
        totalTools,
        totalCategories,
        totalTags,
        lastUpdated: new Date()
      },
      create: {
        id: 'main',
        totalTools,
        totalCategories,
        totalTags
      }
    })

    console.log('\n🎉 Migration completed successfully!')
    console.log(`✅ Successfully migrated: ${successCount} tools`)
    console.log(`❌ Errors: ${errorCount} tools`)
    console.log(`📊 Final stats:`)
    console.log(`   - Tools: ${totalTools}`)
    console.log(`   - Categories: ${totalCategories}`)
    console.log(`   - Tags: ${totalTags}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateData() 