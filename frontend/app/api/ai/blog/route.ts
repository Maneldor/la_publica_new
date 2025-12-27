import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callBlogAI, parseAIResponse, BlogAIAction, BlogAIRequest } from '@/lib/ai/blog-ai-service'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CRM_CONTINGUT', 'ADMIN_GESTIO']

const VALID_ACTIONS: BlogAIAction[] = [
  'generate_article',
  'improve_text',
  'generate_title',
  'generate_excerpt',
  'suggest_tags',
  'fix_grammar',
  'translate_ca_es',
  'translate_es_ca',
  'expand_text',
  'simplify_text',
  'generate_outline'
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Accés denegat' }, { status: 403 })
    }

    const body = await request.json()
    const { action, input, context, options } = body

    // Validar acció
    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Acció invàlida. Accions vàlides: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar input
    if (!input?.trim()) {
      return NextResponse.json(
        { error: 'El camp "input" és obligatori' },
        { status: 400 }
      )
    }

    // Cridar IA
    const aiRequest: BlogAIRequest = {
      action,
      input: input.trim(),
      context,
      options
    }

    const response = await callBlogAI(aiRequest)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Error processant la sol·licitud' },
        { status: 500 }
      )
    }

    // Parsejar resposta si cal
    const parsedResult = parseAIResponse(action, response.result as string)

    return NextResponse.json({
      success: true,
      result: parsedResult,
      tokens: response.tokens
    })

  } catch (error) {
    console.error('Error en Blog AI API:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
