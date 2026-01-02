import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// API pública per obtenir les CSS variables del Design System
// No requereix autenticació ja que les variables són públiques

export async function GET() {
  try {
    // Obtenir tots els tokens actius amb cssVariable definit
    const tokens = await prisma.designToken.findMany({
      where: {
        isActive: true,
        cssVariable: {
          not: null,
        },
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    })

    // Si no hi ha tokens, retornar CSS buit
    if (tokens.length === 0) {
      return new NextResponse(':root {\n  /* No design tokens configured */\n}', {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      })
    }

    // Agrupar per categoria per generar comentaris
    const tokensByCategory: Record<string, typeof tokens> = {}
    for (const token of tokens) {
      if (!tokensByCategory[token.category]) {
        tokensByCategory[token.category] = []
      }
      tokensByCategory[token.category].push(token)
    }

    // Generar CSS amb comentaris per categoria
    const cssLines: string[] = []

    for (const [category, categoryTokens] of Object.entries(tokensByCategory)) {
      cssLines.push(`  /* ${category} */`)
      for (const token of categoryTokens) {
        if (token.cssVariable) {
          cssLines.push(`  ${token.cssVariable}: ${token.value};`)
        }
      }
      cssLines.push('')
    }

    const css = `:root {\n${cssLines.join('\n')}\n}`

    return new NextResponse(css, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error generating CSS variables:', error)
    // En cas d'error, retornar CSS buit per no trencar la web
    return new NextResponse(':root {\n  /* Error loading design tokens */\n}', {
      headers: {
        'Content-Type': 'text/css',
      },
    })
  }
}
