import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/ofertas/[id]/favorite - Añadir oferta a favoritos
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [API /ofertas/favorite] Unauthorized - no session');
      return NextResponse.json(
        { success: false, error: 'No autoritzat. Cal iniciar sessió.' },
        { status: 401 }
      );
    }

    const { id: offerId } = params;
    const userId = session.user.id;

    console.log(`❤️ [API /ofertas/favorite] User ${session.user.email} adding offer ${offerId} to favorites`);

    // Verificar que la oferta existe y está publicada
    const offer = await prismaClient.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        title: true,
        status: true,
        companyId: true
      }
    });

    if (!offer) {
      console.log(`❌ [API /ofertas/favorite] Offer ${offerId} not found`);
      return NextResponse.json(
        { success: false, error: 'Oferta no trobada' },
        { status: 404 }
      );
    }

    if (offer.status !== 'PUBLISHED') {
      console.log(`⚠️ [API /ofertas/favorite] Offer ${offerId} not published`);
      return NextResponse.json(
        { success: false, error: 'Oferta no disponible' },
        { status: 403 }
      );
    }

    // Crear favorito (upsert para evitar errores si ya existe)
    const favorite = await prismaClient.userFavorite.upsert({
      where: {
        unique_user_offer_favorite: {
          userId,
          offerId
        }
      },
      create: {
        userId,
        offerId
      },
      update: {
        // Si ya existe, no hacer nada (mantener createdAt original)
      }
    });

    // Registrar evento FAVORITE_ADD
    await prismaClient.offerEvent.create({
      data: {
        offerId,
        userId,
        companyId: offer.companyId,
        eventType: 'FAVORITE_ADD',
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    console.log(`✅ [API /ofertas/favorite] Favorite created: ${favorite.id}`);

    return NextResponse.json({
      success: true,
      message: 'Oferta afegida als favorits',
      favorite: {
        id: favorite.id,
        createdAt: favorite.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [API /ofertas/favorite] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al afegir a favorits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ofertas/[id]/favorite - Quitar oferta de favoritos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('❌ [API /ofertas/favorite DELETE] Unauthorized');
      return NextResponse.json(
        { success: false, error: 'No autoritzat' },
        { status: 401 }
      );
    }

    const { id: offerId } = params;
    const userId = session.user.id;

    console.log(`💔 [API /ofertas/favorite DELETE] User ${session.user.email} removing offer ${offerId} from favorites`);

    // Obtener companyId antes de eliminar (para el evento)
    const offer = await prismaClient.offer.findUnique({
      where: { id: offerId },
      select: { companyId: true }
    });

    // Eliminar favorito
    try {
      await prismaClient.userFavorite.delete({
        where: {
          unique_user_offer_favorite: {
            userId,
            offerId
          }
        }
      });

      console.log(`✅ [API /ofertas/favorite DELETE] Favorite removed`);

      // Registrar evento FAVORITE_REMOVE
      if (offer) {
        await prismaClient.offerEvent.create({
          data: {
            offerId,
            userId,
            companyId: offer.companyId,
            eventType: 'FAVORITE_REMOVE',
            userAgent: request.headers.get('user-agent'),
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          }
        });
      }

    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record no encontrado - ya no existía
        console.log(`⚠️ [API /ofertas/favorite DELETE] Favorite not found (already removed)`);
        return NextResponse.json({
          success: true,
          message: 'L\'oferta ja no estava als favorits'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Oferta eliminada dels favorits'
    });

  } catch (error) {
    console.error('❌ [API /ofertas/favorite DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar de favorits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}