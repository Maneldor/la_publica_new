// app/api/gestio/empreses/[id]/toggle-activa/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { toggleEmpresaActiva } from '@/lib/gestio-empreses/actions/empreses-llista-actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await toggleEmpresaActiva(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en toggle activa empresa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}