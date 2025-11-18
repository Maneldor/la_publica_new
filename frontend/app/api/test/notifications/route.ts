import { NextRequest, NextResponse } from 'next/server';
import { emailService, createNotification } from '@/lib/email';

/**
 * POST /api/test/notifications - Test endpoint para verificar el sistema de notificaciones
 * NO USAR EN PRODUCCIÓN - Solo para desarrollo
 */
export async function POST(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    console.log('🧪 [Test Notifications] Starting tests...');

    // Test datos mock
    const testUserId = 'test-user-123';
    const testEmail = 'test@lapublica.es';

    // 1. Test email en modo desarrollo
    console.log('📧 Testing email service...');
    const emailResult = await emailService.sendEmail({
      to: testEmail,
      subject: 'Test Email - Sistema de Notificaciones',
      template: 'COUPON_GENERATED' as any,
      templateProps: {
        user: { name: 'Usuario Test' },
        coupon: {
          code: 'TEST123',
          offerTitle: 'Oferta de Test',
          companyName: 'Empresa Test',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        }
      },
      userId: testUserId
    });

    console.log('📧 Email result:', emailResult);

    // 2. Test notificación in-app
    console.log('🔔 Testing in-app notification...');
    await createNotification(
      testUserId,
      'COUPON_GENERATED',
      'Test Notification',
      'Este es un test de notificación in-app',
      '/test-url'
    );

    console.log('🔔 Notification created successfully');

    // 3. Test verificación de preferencias (debe permitir por defecto)
    const { canSendEmail } = await import('@/lib/email');
    const canSend = await canSendEmail(testUserId, 'coupon_generated');
    console.log('⚙️ Can send email check:', canSend);

    return NextResponse.json({
      success: true,
      message: 'Test completado exitosamente',
      results: {
        emailSent: emailResult.success,
        emailMessageId: emailResult.messageId,
        notificationCreated: true,
        canSendEmail: canSend,
        isDevelopmentMode: true
      }
    });

  } catch (error) {
    console.error('❌ [Test Notifications] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/test/notifications - Info sobre el endpoint de test
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Test endpoint para sistema de notificaciones',
    instructions: {
      method: 'POST',
      purpose: 'Verificar que emails y notificaciones funcionan en modo desarrollo',
      environment: process.env.NODE_ENV,
      emailEnabled: process.env.EMAIL_ENABLED,
      resendApiKey: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    }
  });
}