import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCSSVariables } from '@/lib/actions/design-system-actions'

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

    // Generar las variables CSS
    const result = await generateCSSVariables()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Devolver como archivo CSS
    return new NextResponse(result.data, {
      headers: {
        'Content-Type': 'text/css',
        'Content-Disposition': 'attachment; filename="design-system-variables.css"'
      }
    })
  } catch (error) {
    console.error('Error generating CSS variables:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
