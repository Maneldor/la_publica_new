import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    // Determinar la empresa (owned o member)
    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    const offer = await prismaClient.offer.findFirst({
      where: {
        id: params.id,
        companyId: company.id
      },
      include: {
        category: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            logo: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: offer
    });

  } catch (error: any) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { error: 'Error al obtener oferta', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    // Determinar la empresa (owned o member)
    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Verify offer belongs to company
    const existingOffer = await prismaClient.offer.findFirst({
      where: {
        id: params.id,
        companyId: company.id
      }
    });

    if (!existingOffer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    // Get body
    const body = await request.json();
    const {
      title,
      categoryId,
      description,
      shortDescription,
      price,
      originalPrice,
      currency,
      priceType,
      status,
      priority,
      featured,
      featuredUntil,
      contactMethod,
      contactEmail,
      contactPhone,
      contactForm,
      externalUrl,
      requirements,
      benefits,
      duration,
      location,
      remote,
      tags,
      images,
      seoTitle,
      seoDescription,
      seoKeywords,
      internalNotes
    } = body;

    // Update slug if title changed
    let slug = existingOffer.slug;
    if (title && title !== existingOffer.title) {
      const baseSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      slug = baseSlug;
      let counter = 1;
      while (await prismaClient.offer.findFirst({
        where: {
          companyId: company.id,
          slug,
          NOT: { id: params.id }
        }
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Validate category if provided
    if (categoryId && categoryId !== existingOffer.categoryId) {
      const category = await prismaClient.offerCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json({
          error: 'Categoria no vàlida',
          message: 'La categoria seleccionada no existeix'
        }, { status: 400 });
      }
    }

    // Build update data - only include fields that were provided
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (slug !== existingOffer.slug) updateData.slug = slug;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (price !== undefined) updateData.price = price ? new Decimal(price) : null;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? new Decimal(originalPrice) : null;
    if (currency !== undefined) updateData.currency = currency;
    if (priceType !== undefined) updateData.priceType = priceType;
    if (priority !== undefined) updateData.priority = priority;
    if (featured !== undefined) updateData.featured = featured;
    if (featuredUntil !== undefined) updateData.featuredUntil = featuredUntil ? new Date(featuredUntil) : null;
    if (contactMethod !== undefined) updateData.contactMethod = contactMethod.toUpperCase();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (contactForm !== undefined) updateData.contactForm = contactForm;
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (duration !== undefined) updateData.duration = duration;
    if (location !== undefined) updateData.location = location;
    if (remote !== undefined) updateData.remote = remote;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    // Handle status changes with proper timestamps
    if (status !== undefined) {
      const newStatus = status.toUpperCase();
      const currentStatus = existingOffer.status;

      updateData.status = newStatus;

      // Handle status-specific timestamp updates
      if (newStatus === 'PUBLISHED' && !existingOffer.publishedAt) {
        updateData.publishedAt = new Date();
      }

      if (newStatus === 'PENDING' && currentStatus !== 'PENDING') {
        updateData.submittedAt = new Date();
      }

      // Handle explicit submittedAt and expiresAt from body
      if (body.submittedAt !== undefined) {
        updateData.submittedAt = body.submittedAt ? new Date(body.submittedAt) : null;
      }

      if (body.expiresAt !== undefined) {
        updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
      }
    }

    // Update offer
    const offer = await prismaClient.offer.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      data: offer
    });

  } catch (error: any) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Error al actualizar oferta', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario y empresa
    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedCompany: true,
        memberCompany: true
      }
    });

    // Determinar la empresa (owned o member)
    const company = user?.ownedCompany || user?.memberCompany;

    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Verify offer belongs to company
    const offer = await prismaClient.offer.findFirst({
      where: {
        id: params.id,
        companyId: company.id
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 });
    }

    // Delete offer
    await prismaClient.offer.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Oferta eliminada correctament'
    });

  } catch (error: any) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      { error: 'Error al eliminar oferta', details: error.message },
      { status: 500 }
    );
  }
}