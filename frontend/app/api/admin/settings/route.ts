import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismaClient } from '@/lib/prisma';
import { createAuditLog, getRequestInfo } from '@/lib/auditLog';

/**
 * GET /api/admin/settings
 * Obtiene configuración del sistema (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    if (!adminUser || (adminUser.userType !== 'ADMIN' && adminUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    // Obtener configuración desde SystemSettings
    const systemSettings = await prismaClient.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // Valores por defecto si no hay configuración guardada
    const defaultSettings = {
      platformName: 'La Pública',
      slogan: 'Connectant el sector públic amb empreses innovadores',
      baseUrl: 'https://lapublica.cat',
      contactEmail: 'contacte@lapublica.cat',
      supportPhone: '+34 900 123 456',
      primaryLogo: '',
      secondaryLogo: '',
      favicon: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      accentColor: '#10B981',
      loginBackgroundImage: '',
      showLogoInNavbar: true,
      allowPublicRegistration: true,
      requireEmailVerification: true,
      sessionExpirationTime: '8h',
      maxLoginAttempts: 5,
      lockoutTimeAfterFailedAttempts: '15min',
      sendWelcomeEmail: true,
      notifyAdminsNewCompanies: true,
      dailyEmailSummary: false,
      senderEmail: 'noreply@lapublica.cat',
      senderName: 'La Pública',
      forceHttps: true,
      allowMultipleSessions: false,
      detailedActivityLogging: true,
      logRetentionDays: 90,
      privacyPolicyUrl: '',
      termsConditionsUrl: '',
      footerText: '© 2024 La Pública. Tots els drets reservats.',
      showCookieNotice: true,
      maintenanceModeEnabled: systemSettings?.maintenanceMode || false,
      maintenanceMessage: systemSettings?.maintenanceMessage || 'Estem realitzant tasques de manteniment. Tornarem aviat.',
      allowedIpsDuringMaintenance: ''
    };

    // Merge con configuración guardada si existe
    const settings = systemSettings ? {
      ...defaultSettings,
      ...systemSettings.settings,
      maintenanceModeEnabled: systemSettings.maintenanceMode,
      maintenanceMessage: systemSettings.maintenanceMessage
    } : defaultSettings;

    // Registrar acceso en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'OTHER',
      entity: 'SYSTEM',
      description: 'Accessed system settings panel',
      category: 'ADMIN',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error obtenint configuració:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Actualiza configuración del sistema (solo admin)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar rol de admin
    const adminUser = await prismaClient.user.findUnique({
      where: { email: session.user.email! },
      select: { userType: true, role: true }
    });

    if (!adminUser || (adminUser.userType !== 'ADMIN' && adminUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores.' }, { status: 403 });
    }

    const settings = await request.json();

    // Validaciones básicas
    if (!settings.platformName || !settings.contactEmail) {
      return NextResponse.json(
        { error: 'Campos requeridos: platformName, contactEmail' },
        { status: 400 }
      );
    }

    // Obtener configuración actual para comparar cambios
    const currentSettings = await prismaClient.systemSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // Preparar datos para guardar
    const settingsToSave = {
      platformName: settings.platformName,
      slogan: settings.slogan,
      contactEmail: settings.contactEmail,
      supportPhone: settings.supportPhone,
      primaryLogo: settings.primaryLogo,
      secondaryLogo: settings.secondaryLogo,
      favicon: settings.favicon,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      loginBackgroundImage: settings.loginBackgroundImage,
      showLogoInNavbar: settings.showLogoInNavbar,
      allowPublicRegistration: settings.allowPublicRegistration,
      requireEmailVerification: settings.requireEmailVerification,
      sessionExpirationTime: settings.sessionExpirationTime,
      maxLoginAttempts: settings.maxLoginAttempts,
      lockoutTimeAfterFailedAttempts: settings.lockoutTimeAfterFailedAttempts,
      sendWelcomeEmail: settings.sendWelcomeEmail,
      notifyAdminsNewCompanies: settings.notifyAdminsNewCompanies,
      dailyEmailSummary: settings.dailyEmailSummary,
      senderEmail: settings.senderEmail,
      senderName: settings.senderName,
      forceHttps: settings.forceHttps,
      allowMultipleSessions: settings.allowMultipleSessions,
      detailedActivityLogging: settings.detailedActivityLogging,
      logRetentionDays: settings.logRetentionDays,
      privacyPolicyUrl: settings.privacyPolicyUrl,
      termsConditionsUrl: settings.termsConditionsUrl,
      footerText: settings.footerText,
      showCookieNotice: settings.showCookieNotice,
      allowedIpsDuringMaintenance: settings.allowedIpsDuringMaintenance
    };

    // Actualizar o crear configuración
    if (currentSettings) {
      await prismaClient.systemSettings.update({
        where: { id: currentSettings.id },
        data: {
          settings: settingsToSave,
          maintenanceMode: settings.maintenanceModeEnabled,
          maintenanceMessage: settings.maintenanceMessage,
          updatedAt: new Date()
        }
      });
    } else {
      await prismaClient.systemSettings.create({
        data: {
          settings: settingsToSave,
          maintenanceMode: settings.maintenanceModeEnabled,
          maintenanceMessage: settings.maintenanceMessage
        }
      });
    }

    // Identificar cambios importantes para el audit log
    const importantChanges = [];
    if (currentSettings) {
      if (currentSettings.maintenanceMode !== settings.maintenanceModeEnabled) {
        importantChanges.push(`Maintenance mode ${settings.maintenanceModeEnabled ? 'enabled' : 'disabled'}`);
      }
      if (currentSettings.settings?.platformName !== settings.platformName) {
        importantChanges.push(`Platform name changed to "${settings.platformName}"`);
      }
      if (currentSettings.settings?.allowPublicRegistration !== settings.allowPublicRegistration) {
        importantChanges.push(`Public registration ${settings.allowPublicRegistration ? 'enabled' : 'disabled'}`);
      }
    }

    // Registrar en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'SETTINGS_UPDATED',
      entity: 'SYSTEM',
      description: 'Updated system settings',
      metadata: {
        changes: importantChanges,
        settingsCount: Object.keys(settingsToSave).length,
        maintenanceMode: settings.maintenanceModeEnabled
      },
      category: 'ADMIN',
      level: settings.maintenanceModeEnabled ? 'WARNING' : 'INFO',
      ipAddress,
      userAgent
    });

    return NextResponse.json({
      success: true,
      message: 'Configuració actualitzada correctament'
    });

  } catch (error) {
    console.error('Error actualitzant configuració:', error);
    
    // Registrar error en audit log
    const { ipAddress, userAgent } = getRequestInfo(request);
    await createAuditLog({
      action: 'SETTINGS_UPDATED',
      entity: 'SYSTEM',
      description: `Failed to update system settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      category: 'ADMIN',
      level: 'ERROR',
      success: false,
      ipAddress,
      userAgent
    });

    return NextResponse.json(
      { error: 'Error actualitzant configuració' },
      { status: 500 }
    );
  }
}