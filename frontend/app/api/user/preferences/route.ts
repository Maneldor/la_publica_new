import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/user/preferences - Obtener preferencias de notificaciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log(`⚙️ [Preferences] Loading for user ${session.user.id}`);

    // Buscar preferencias existentes
    let preferences = await prismaClient.notificationPreference.findUnique({
      where: { userId: session.user.id }
    });

    // Si no existen, crear con valores por defecto
    if (!preferences) {
      console.log(`⚙️ [Preferences] Creating default preferences for user ${session.user.id}`);
      preferences = await prismaClient.notificationPreference.create({
        data: {
          userId: session.user.id,
          // Los valores por defecto ya están definidos en el schema
        }
      });
    }

    const response = {
      id: preferences.id,
      userId: preferences.userId,

      // Configuración email
      emailEnabled: preferences.emailEnabled,
      emailCouponGenerated: preferences.emailCouponGenerated,
      emailCouponUsed: preferences.emailCouponUsed,
      emailOfferExpiring: preferences.emailOfferExpiring,
      emailNewFavorite: preferences.emailNewFavorite,
      emailWeeklySummary: preferences.emailWeeklySummary,

      // Configuración notificaciones in-app
      inAppEnabled: preferences.inAppEnabled,
      inAppCouponGenerated: preferences.inAppCouponGenerated,
      inAppCouponUsed: preferences.inAppCouponUsed,
      inAppOfferExpiring: preferences.inAppOfferExpiring,
      inAppNewFavorite: preferences.inAppNewFavorite,
      inAppWeeklySummary: preferences.inAppWeeklySummary,

      // Configuración horarios
      weeklySummaryDay: preferences.weeklySummaryDay,
      weeklySummaryHour: preferences.weeklySummaryHour,
      timezone: preferences.timezone,

      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt
    };

    return NextResponse.json({
      success: true,
      preferences: response
    });

  } catch (error) {
    console.error('❌ [Preferences] Error fetching:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cargar preferencias',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences - Actualizar preferencias de notificaciones
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar campos permitidos
    const allowedFields = [
      'emailEnabled',
      'emailCouponGenerated',
      'emailCouponUsed',
      'emailOfferExpiring',
      'emailNewFavorite',
      'emailWeeklySummary',
      'inAppEnabled',
      'inAppCouponGenerated',
      'inAppCouponUsed',
      'inAppOfferExpiring',
      'inAppNewFavorite',
      'inAppWeeklySummary',
      'weeklySummaryDay',
      'weeklySummaryHour',
      'timezone'
    ];

    // Filtrar solo campos permitidos
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron campos válidos para actualizar' },
        { status: 400 }
      );
    }

    console.log(`⚙️ [Preferences] Updating for user ${session.user.id}:`, Object.keys(updateData));

    // Validaciones específicas
    if (updateData.weeklySummaryDay !== undefined) {
      if (typeof updateData.weeklySummaryDay !== 'number' || updateData.weeklySummaryDay < 0 || updateData.weeklySummaryDay > 6) {
        return NextResponse.json(
          { success: false, error: 'weeklySummaryDay debe ser un número entre 0 y 6' },
          { status: 400 }
        );
      }
    }

    if (updateData.weeklySummaryHour !== undefined) {
      if (typeof updateData.weeklySummaryHour !== 'number' || updateData.weeklySummaryHour < 0 || updateData.weeklySummaryHour > 23) {
        return NextResponse.json(
          { success: false, error: 'weeklySummaryHour debe ser un número entre 0 y 23' },
          { status: 400 }
        );
      }
    }

    // Intentar actualizar, crear si no existe
    const preferences = await prismaClient.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData
      }
    });

    console.log(`✅ [Preferences] Updated successfully for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Preferencias actualizadas correctamente',
      preferences: {
        id: preferences.id,
        userId: preferences.userId,
        emailEnabled: preferences.emailEnabled,
        emailCouponGenerated: preferences.emailCouponGenerated,
        emailCouponUsed: preferences.emailCouponUsed,
        emailOfferExpiring: preferences.emailOfferExpiring,
        emailNewFavorite: preferences.emailNewFavorite,
        emailWeeklySummary: preferences.emailWeeklySummary,
        inAppEnabled: preferences.inAppEnabled,
        inAppCouponGenerated: preferences.inAppCouponGenerated,
        inAppCouponUsed: preferences.inAppCouponUsed,
        inAppOfferExpiring: preferences.inAppOfferExpiring,
        inAppNewFavorite: preferences.inAppNewFavorite,
        inAppWeeklySummary: preferences.inAppWeeklySummary,
        weeklySummaryDay: preferences.weeklySummaryDay,
        weeklySummaryHour: preferences.weeklySummaryHour,
        timezone: preferences.timezone,
        updatedAt: preferences.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Preferences] Error updating:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar preferencias',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}