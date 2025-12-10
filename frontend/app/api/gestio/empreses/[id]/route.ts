// app/api/gestio/empreses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { deleteEmpresa } from '@/lib/gestio-empreses/actions/empreses-llista-actions'
import { prismaClient as prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const empresa = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        currentPlan: {
          select: {
            id: true,
            tier: true,
            nombreCorto: true,
            precioMensual: true
          }
        },
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa no trobada', data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: empresa })
  } catch (error) {
    console.error('Error obtenint empresa:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor: ' + (error as Error).message, data: null },
      { status: 200 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteEmpresa(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando empresa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}