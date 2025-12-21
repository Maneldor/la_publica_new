import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaClient } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir una categoria específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params

    const category = await prismaClient.sensitiveJobCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
        users: {
          select: {
            id: true,
            name: true,
            nick: true,
            email: true,
            image: true,
          },
          take: 10,
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria no trobada' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error obtenint categoria:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualitzar una categoria
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Verificar que la categoria existeixi
    const existingCategory = await prismaClient.sensitiveJobCategory.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria no trobada' },
        { status: 404 }
      )
    }

    // Si s'actualitza el slug, verificar que no existeixi
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await prismaClient.sensitiveJobCategory.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ja existeix una categoria amb aquest slug' },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prismaClient.sensitiveJobCategory.update({
      where: { id },
      data: {
        name: body.name ?? existingCategory.name,
        slug: body.slug ?? existingCategory.slug,
        description: body.description ?? existingCategory.description,
        icon: body.icon ?? existingCategory.icon,
        color: body.color ?? existingCategory.color,
        departmentPatterns: body.departmentPatterns ?? existingCategory.departmentPatterns,
        positionPatterns: body.positionPatterns ?? existingCategory.positionPatterns,
        forceHidePosition: body.forceHidePosition ?? existingCategory.forceHidePosition,
        forceHideDepartment: body.forceHideDepartment ?? existingCategory.forceHideDepartment,
        forceHideBio: body.forceHideBio ?? existingCategory.forceHideBio,
        forceHideLocation: body.forceHideLocation ?? existingCategory.forceHideLocation,
        forceHidePhone: body.forceHidePhone ?? existingCategory.forceHidePhone,
        forceHideEmail: body.forceHideEmail ?? existingCategory.forceHideEmail,
        forceHideGroups: body.forceHideGroups ?? existingCategory.forceHideGroups,
        isActive: body.isActive ?? existingCategory.isActive,
      },
    })

    // Registrar al log d'auditoria
    await prismaClient.privacyAuditLog.create({
      data: {
        userId: 'SYSTEM',
        changedById: session.user.id,
        changedByRole: 'ADMIN',
        fieldChanged: 'category_updated',
        oldValue: JSON.stringify(existingCategory),
        newValue: JSON.stringify(updatedCategory),
        reason: `Categoria sensible "${updatedCategory.name}" actualitzada`,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error actualitzant categoria:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar o desactivar una categoria
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || !['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Només els superadmins poden eliminar categories' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    const category = await prismaClient.sensitiveJobCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria no trobada' },
        { status: 404 }
      )
    }

    // Si té usuaris assignats, no permetre eliminació dura
    if (category._count.users > 0 && hardDelete) {
      return NextResponse.json(
        {
          error: `No es pot eliminar la categoria. Hi ha ${category._count.users} usuaris assignats. Desassigna'ls primer o desactiva la categoria.`,
        },
        { status: 400 }
      )
    }

    if (hardDelete) {
      // Eliminació permanent
      await prismaClient.sensitiveJobCategory.delete({
        where: { id },
      })

      await prismaClient.privacyAuditLog.create({
        data: {
          userId: 'SYSTEM',
          changedById: session.user.id,
          changedByRole: 'ADMIN',
          fieldChanged: 'category_deleted',
          oldValue: JSON.stringify(category),
          newValue: null,
          reason: `Categoria sensible "${category.name}" eliminada permanentment`,
        },
      })

      return NextResponse.json({ message: 'Categoria eliminada permanentment' })
    } else {
      // Soft delete (desactivar)
      await prismaClient.sensitiveJobCategory.update({
        where: { id },
        data: { isActive: false },
      })

      await prismaClient.privacyAuditLog.create({
        data: {
          userId: 'SYSTEM',
          changedById: session.user.id,
          changedByRole: 'ADMIN',
          fieldChanged: 'category_deactivated',
          oldValue: 'active',
          newValue: 'inactive',
          reason: `Categoria sensible "${category.name}" desactivada`,
        },
      })

      return NextResponse.json({ message: 'Categoria desactivada' })
    }
  } catch (error) {
    console.error('Error eliminant categoria:', error)
    return NextResponse.json(
      { error: 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
