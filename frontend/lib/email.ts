import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EmailTemplate, EmailStatus } from '@prisma/client';
import { prismaClient } from './prisma';

// Configuración del cliente Resend (lazy initialization para evitar error si no hay API key)
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Configuración por defecto
const DEFAULT_FROM = {
  email: process.env.RESEND_FROM_EMAIL || 'noreply@lapublica.es',
  name: process.env.RESEND_FROM_NAME || 'La Pública'
};

// Tipos para el servicio de email
export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  templateProps?: any;
  userId?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  emailLogId?: string;
}

// Clase principal del servicio de email
export class EmailService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.EMAIL_ENABLED === 'true';
  }

  /**
   * Envía un email usando Resend
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Si los emails están deshabilitados, solo logueamos
      if (!this.isEnabled) {
        console.log('📧 [Email] Disabled - Would send:', {
          to: options.to,
          subject: options.subject,
          template: options.template
        });
        return { success: true, messageId: 'disabled' };
      }

      // Verificar si hay API key configurada
      const hasValidApiKey = process.env.RESEND_API_KEY &&
                             process.env.RESEND_API_KEY !== 're_test_placeholder' &&
                             process.env.RESEND_API_KEY.startsWith('re_');

      // Si no hay API key válida, simular envío
      if (!hasValidApiKey) {
        console.log(`🧪 [Email] NO API KEY - Email NOT sent (simulated)`);
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Template: ${options.template}`);

        // Registrar en BD como enviado (para testing)
        const emailLog = options.userId ? await this.createEmailLog({
          userId: options.userId,
          templateType: options.template,
          subject: options.subject,
          toEmail: Array.isArray(options.to) ? options.to[0] : options.to,
          fromEmail: DEFAULT_FROM.email,
          status: EmailStatus.SENT,
          sentAt: new Date(),
          externalId: 'dev-email-simulated',
          metadata: options.templateProps
        }) : null;

        console.log('✅ [Email] Simulated - Email logged successfully');

        return {
          success: true,
          messageId: `simulated-${Date.now()}`,
          emailLogId: emailLog?.id
        };
      }

      // Solo requerir API key en producción
      if (!process.env.RESEND_API_KEY) {
        throw new Error('Resend API key required in production');
      }

      // Renderizar template
      const htmlContent = await this.renderTemplate(options.template, options.templateProps);

      // Crear log entry antes de enviar
      const emailLog = options.userId ? await this.createEmailLog({
        userId: options.userId,
        templateType: options.template,
        subject: options.subject,
        toEmail: Array.isArray(options.to) ? options.to[0] : options.to,
        fromEmail: DEFAULT_FROM.email,
        status: EmailStatus.PENDING,
        metadata: options.templateProps
      }) : null;

      console.log(`📧 [Email] Sending ${options.template} to ${options.to}`);

      // Enviar email con Resend
      const resend = getResendClient();
      const result = await resend.emails.send({
        from: `${DEFAULT_FROM.name} <${DEFAULT_FROM.email}>`,
        to: options.to,
        subject: options.subject,
        html: htmlContent,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });

      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }

      console.log(`✅ [Email] Sent successfully: ${result.data?.id}`);

      // Actualizar log con éxito
      if (emailLog) {
        await this.updateEmailLog(emailLog.id, {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          externalId: result.data?.id
        });
      }

      return {
        success: true,
        messageId: result.data?.id,
        emailLogId: emailLog?.id
      };

    } catch (error) {
      console.error('❌ [Email] Send failed:', error);

      // Actualizar log con error si existe
      if (options.userId) {
        try {
          const errorLog = await this.createEmailLog({
            userId: options.userId,
            templateType: options.template,
            subject: options.subject,
            toEmail: Array.isArray(options.to) ? options.to[0] : options.to,
            fromEmail: DEFAULT_FROM.email,
            status: EmailStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: options.templateProps
          });

          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            emailLogId: errorLog.id
          };
        } catch (logError) {
          console.error('❌ [Email] Failed to create error log:', logError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Renderiza un template de email a HTML
   */
  private async renderTemplate(template: EmailTemplate, props?: any): Promise<string> {
    try {
      // Importar dinámicamente el template
      const templateModule = await import(`../emails/${template.toLowerCase()}`);
      const TemplateComponent = templateModule.default;

      // Renderizar el componente a HTML
      return await render(TemplateComponent(props || {}));

    } catch (error) {
      console.error(`❌ [Email] Template render failed for ${template}:`, error);

      // Fallback a template básico
      return this.getFallbackTemplate(template, props);
    }
  }

  /**
   * Template fallback básico si falla la renderización
   */
  private getFallbackTemplate(template: EmailTemplate, props?: any): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${template}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${baseUrl}/logo.png" alt="La Pública" style="height: 40px;">
            </div>
            <h1 style="color: #333; margin-bottom: 20px;">Notificación de La Pública</h1>
            <p style="color: #666; line-height: 1.6;">
              ${this.getTemplateMessage(template, props)}
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${baseUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Ir a La Pública
              </a>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
              Este email ha sido enviado por La Pública.<br>
              Si no quieres recibir estos emails, puedes <a href="${baseUrl}/preferencias">gestionar tus preferencias</a>.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Mensajes fallback por template
   */
  private getTemplateMessage(template: EmailTemplate, props?: any): string {
    switch (template) {
      case EmailTemplate.COUPON_GENERATED:
        return `¡Tu cupón ha sido generado! Código: ${props?.coupon?.code || 'Ver en la plataforma'}`;
      case EmailTemplate.COUPON_USED:
        return `Tu cupón ha sido usado correctamente. ¡Esperamos que hayas disfrutado de la oferta!`;
      case EmailTemplate.OFFER_EXPIRING:
        return `Una de tus ofertas favoritas está a punto de caducar. ¡No te la pierdas!`;
      case EmailTemplate.NEW_FAVORITE:
        return `Alguien ha guardado tu oferta como favorita.`;
      case EmailTemplate.WEEKLY_SUMMARY:
        return `Aquí tienes tu resumen semanal de actividad en La Pública.`;
      default:
        return `Has recibido una nueva notificación en La Pública.`;
    }
  }

  /**
   * Crea un registro de email log
   */
  private async createEmailLog(data: {
    userId: string;
    templateType: EmailTemplate;
    subject: string;
    toEmail: string;
    fromEmail: string;
    status: EmailStatus;
    sentAt?: Date;
    externalId?: string;
    errorMessage?: string;
    metadata?: any;
  }) {
    return await prismaClient.emailLog.create({
      data
    });
  }

  /**
   * Actualiza un registro de email log
   */
  private async updateEmailLog(id: string, data: {
    status?: EmailStatus;
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    bouncedAt?: Date;
    externalId?: string;
    errorMessage?: string;
  }) {
    return await prismaClient.emailLog.update({
      where: { id },
      data
    });
  }

  /**
   * Procesa webhooks de Resend para tracking
   */
  async processWebhook(payload: any): Promise<void> {
    try {
      const { type, data } = payload;

      if (!data?.email_id) {
        console.warn('⚠️ [Email] Webhook without email_id:', payload);
        return;
      }

      // Buscar el log por external ID
      const emailLog = await prismaClient.emailLog.findFirst({
        where: { externalId: data.email_id }
      });

      if (!emailLog) {
        console.warn(`⚠️ [Email] Log not found for email_id: ${data.email_id}`);
        return;
      }

      // Actualizar según el tipo de evento
      const updateData: any = {};

      switch (type) {
        case 'email.delivered':
          updateData.status = EmailStatus.DELIVERED;
          updateData.deliveredAt = new Date(data.created_at);
          break;

        case 'email.opened':
          updateData.status = EmailStatus.OPENED;
          updateData.openedAt = new Date(data.created_at);
          break;

        case 'email.clicked':
          updateData.status = EmailStatus.CLICKED;
          updateData.clickedAt = new Date(data.created_at);
          break;

        case 'email.bounced':
          updateData.status = EmailStatus.BOUNCED;
          updateData.bouncedAt = new Date(data.created_at);
          updateData.errorMessage = data.reason || 'Email bounced';
          break;

        default:
          console.log(`📧 [Email] Unhandled webhook type: ${type}`);
          return;
      }

      await this.updateEmailLog(emailLog.id, updateData);
      console.log(`📧 [Email] Webhook processed: ${type} for ${data.email_id}`);

    } catch (error) {
      console.error('❌ [Email] Webhook processing failed:', error);
    }
  }
}

// Instancia singleton
export const emailService = new EmailService();

// Métodos de conveniencia para casos comunes
export const sendCouponGeneratedEmail = (userId: string, userEmail: string, couponData: any) =>
  emailService.sendEmail({
    to: userEmail,
    subject: `¡Tu cupón para ${couponData.offerTitle} está listo!`,
    template: EmailTemplate.COUPON_GENERATED,
    templateProps: { coupon: couponData },
    userId
  });

export const sendCouponUsedEmail = (userId: string, userEmail: string, redemptionData: any) =>
  emailService.sendEmail({
    to: userEmail,
    subject: `Cupón usado - ${redemptionData.offerTitle}`,
    template: EmailTemplate.COUPON_USED,
    templateProps: { redemption: redemptionData },
    userId
  });

export const sendOfferExpiringEmail = (userId: string, userEmail: string, offerData: any) =>
  emailService.sendEmail({
    to: userEmail,
    subject: `⏰ ${offerData.title} caduca pronto`,
    template: EmailTemplate.OFFER_EXPIRING,
    templateProps: { offer: offerData },
    userId
  });

export const sendNewFavoriteEmail = (companyUserId: string, companyEmail: string, favoriteData: any) =>
  emailService.sendEmail({
    to: companyEmail,
    subject: `Nueva persona interesada en ${favoriteData.offerTitle}`,
    template: EmailTemplate.NEW_FAVORITE,
    templateProps: { favorite: favoriteData },
    userId: companyUserId
  });

export const sendWeeklySummaryEmail = (userId: string, userEmail: string, summaryData: any) =>
  emailService.sendEmail({
    to: userEmail,
    subject: `Tu resumen semanal - La Pública`,
    template: EmailTemplate.WEEKLY_SUMMARY,
    templateProps: { summary: summaryData },
    userId
  });

// ==============================================
// SISTEMA DE NOTIFICACIONES IN-APP
// ==============================================

/**
 * Crear notificación in-app
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
  senderId?: string
): Promise<void> {
  try {
    await prismaClient.notification.create({
      data: {
        userId,
        type: type as any, // Convertir string a NotificationType
        title,
        message,
        metadata: actionUrl ? { actionUrl } : undefined,
        senderId
      }
    });

    console.log(`🔔 Notification created for user ${userId}: ${type}`);
  } catch (error) {
    console.error('❌ [Notification] Creation failed:', error);
    throw error;
  }
}

/**
 * Verificar si se puede enviar email según preferencias del usuario
 */
export async function canSendEmail(
  userId: string,
  templateType: string
): Promise<boolean> {
  try {
    // Si emails están deshabilitados globalmente
    if (process.env.EMAIL_ENABLED !== 'true') {
      return false;
    }

    // Buscar preferencias del usuario
    const preferences = await prismaClient.notificationPreference.findUnique({
      where: { userId }
    });

    // Si no hay preferencias, usar defaults (permitir todo)
    if (!preferences) {
      console.log(`📧 No preferences found for user ${userId}, allowing email`);
      return true;
    }

    // Verificar si emails están habilitados
    if (!preferences.emailEnabled) {
      console.log(`📧 Email disabled for user ${userId}`);
      return false;
    }

    // Verificar preferencia específica por template
    switch (templateType.toLowerCase()) {
      case 'coupon_generated':
        return preferences.emailCouponGenerated;
      case 'coupon_used':
        return preferences.emailCouponUsed;
      case 'offer_expiring':
        return preferences.emailOfferExpiring;
      case 'new_favorite':
        return preferences.emailNewFavorite;
      case 'weekly_summary':
        return preferences.emailWeeklySummary;
      default:
        console.log(`📧 Unknown template type: ${templateType}, allowing by default`);
        return true;
    }
  } catch (error) {
    console.error('❌ [Email] Preference check failed:', error);
    // En caso de error, permitir el envío para no bloquear funcionalidad
    return true;
  }
}

/**
 * Enviar email simplificado (wrapper)
 */
export async function sendEmail(options: {
  to: string;
  userId: string;
  subject: string;
  template: string;
  html?: string;
  templateProps?: any;
}): Promise<void> {
  const templateEnum = options.template.toUpperCase() as EmailTemplate;

  await emailService.sendEmail({
    to: options.to,
    subject: options.subject,
    template: templateEnum,
    templateProps: options.templateProps,
    userId: options.userId
  });
}