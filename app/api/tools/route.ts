import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Lire le fichier CSV
    const csvPath = path.join(process.cwd(), 'working_database_rationalized_full.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    
    // Parser le CSV
    const lines = csvData.split('\n')
    const headers = lines[0].split(';')
    const tools = lines.slice(1).map(line => {
      const values = line.split(';')
      const tool: any = {}
      headers.forEach((header, index) => {
        tool[header.trim()] = values[index] || ''
      })
      return tool
    }).filter(tool => tool.tool_name) // Filtrer les lignes vides
    
    // Filtrer par catégorie si spécifiée
    let filteredTools = tools
    if (category && category !== 'all') {
      filteredTools = tools.filter(tool => 
        tool.tool_category?.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    // Filtrer par recherche si spécifiée
    if (search) {
      filteredTools = filteredTools.filter(tool =>
        tool.tool_name?.toLowerCase().includes(search.toLowerCase()) ||
        tool.overview?.toLowerCase().includes(search.toLowerCase()) ||
        tool.tool_description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTools = filteredTools.slice(startIndex, endIndex)
    
    return NextResponse.json({
      tools: paginatedTools,
      total: filteredTools.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTools.length / limit)
    })
    
  } catch (error) {
    console.error('Error reading tools:', error)
    return NextResponse.json(
      { error: 'Failed to load tools' },
      { status: 500 }
    )
  }
} 