import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Generar CSS variables des dels tokens de la BD
async function generateCSSFromTokens(): Promise<string> {
  const tokens = await prisma.designToken.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })

  // Agrupar per categoria
  const grouped: Record<string, typeof tokens> = {}
  for (const token of tokens) {
    if (!grouped[token.category]) {
      grouped[token.category] = []
    }
    grouped[token.category].push(token)
  }

  // Generar CSS
  let css = `/* ============================================= */
/* DESIGN SYSTEM - LA PÚBLICA                   */
/* Variables CSS generades automàticament       */
/* NO EDITAR MANUALMENT - Usar panel admin      */
/* ============================================= */

:root {
`

  // Colors
  if (grouped.colors) {
    css += `  /* Colors */\n`
    for (const token of grouped.colors) {
      css += `  --${token.name}: ${token.value};${token.description ? ` /* ${token.description} */` : ''}\n`
    }
    css += '\n'
  }

  // Typography
  if (grouped.typography) {
    css += `  /* Typography */\n`
    for (const token of grouped.typography) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  // Radius
  if (grouped.radius) {
    css += `  /* Border Radius */\n`
    for (const token of grouped.radius) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  // Shadows
  if (grouped.shadows) {
    css += `  /* Shadows */\n`
    for (const token of grouped.shadows) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  // Spacing
  if (grouped.spacing) {
    css += `  /* Spacing */\n`
    for (const token of grouped.spacing) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  // Cards
  if (grouped.cards) {
    css += `  /* Cards */\n`
    for (const token of grouped.cards) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  // Components (afegir altres categories)
  const otherCategories = Object.keys(grouped).filter(
    c => !['colors', 'typography', 'radius', 'shadows', 'spacing', 'cards'].includes(c)
  )
  for (const category of otherCategories) {
    css += `  /* ${category.charAt(0).toUpperCase() + category.slice(1)} */\n`
    for (const token of grouped[category]) {
      css += `  --${token.name}: ${token.value};\n`
    }
    css += '\n'
  }

  css += `}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    /* Els colors de mode fosc es poden definir aquí */
    --color-background: #0F172A;
    --color-surface: #1E293B;
    --color-text-primary: #F1F5F9;
    --color-text-secondary: #94A3B8;
    --color-border: #334155;
  }
}
`

  return css
}

export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autoritzat' },
        { status: 401 }
      )
    }

    // Generar CSS
    const css = await generateCSSFromTokens()

    // Escriure a fitxer design-tokens.css
    const tokensFilePath = path.join(process.cwd(), 'app', 'design-tokens.css')
    fs.writeFileSync(tokensFilePath, css, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'CSS guardat correctament a design-tokens.css',
      path: tokensFilePath,
    })
  } catch (error) {
    console.error('Error saving CSS:', error)
    return NextResponse.json(
      { error: 'Error guardant el CSS: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autoritzat' },
        { status: 401 }
      )
    }

    // Generar i retornar el CSS (preview)
    const css = await generateCSSFromTokens()

    return new NextResponse(css, {
      headers: {
        'Content-Type': 'text/css',
      }
    })
  } catch (error) {
    console.error('Error generating CSS:', error)
    return NextResponse.json(
      { error: 'Error generant el CSS' },
      { status: 500 }
    )
  }
}
