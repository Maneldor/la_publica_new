import { Request, Response } from 'express';
import { CrmService } from './crm.service';
import * as leadService from '../../services/leadService';

const crmService = new CrmService();

// ============================================================================
// COMPANY LEADS
// ============================================================================

export const createLead = async (req: Request, res: Response) => {
  try {
    console.log('📨 Datos recibidos para crear lead:', req.body);

    // Por ahora usar un userId mock si no hay autenticación
    const userId = req.user?.id || 'user1';

    const lead = await leadService.createLead({
      ...req.body,
      assignedToId: userId
    });

    console.log('✅ Lead creado exitosamente:', lead?.id);

    res.status(201).json({
      success: true,
      data: lead,
      mensaje: 'Lead creado exitosamente'
    });
  } catch (error: any) {
    console.error('❌ Error creando lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listLeads = async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      source,
      sector,
      search,
      limit,
      offset
    } = req.query;

    const leads = await leadService.listLeads({
      status: status as string,
      priority: priority as string,
      source: source as string,
      sector: sector as string,
      search: search as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: leads
    });
  } catch (error: any) {
    console.error('❌ Error listando leads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    res.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo lead:', error);
    res.status(error.message === 'Lead no encontrado' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await leadService.updateLead(id, req.body);

    res.json({
      success: true,
      data: lead,
      mensaje: 'Lead actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('❌ Error actualizando lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const convertLead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;
    const company = await crmService.convertLeadToCompany(id, req.body);

    res.json({
      success: true,
      data: company,
      mensaje: 'Lead convertido a empresa exitosamente'
    });
  } catch (error: any) {
    console.error('Error convirtiendo lead:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================================
// INTERACTIONS
// ============================================================================

export const createInteraction = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const interaction = await crmService.createInteraction({
      ...req.body,
      createdById: user.id
    });

    res.status(201).json({
      success: true,
      data: interaction,
      mensaje: 'Interacción creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando interacción:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listInteractions = async (req: Request, res: Response) => {
  try {
    const {
      companyLeadId,
      companyId,
      contactId,
      type,
      limit,
      offset
    } = req.query;

    const interactions = await crmService.listInteractions({
      companyLeadId: companyLeadId as string,
      companyId: companyId as string,
      contactId: contactId as string,
      type: type as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: interactions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateInteraction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interaction = await crmService.updateInteraction(id, req.body);

    res.json({
      success: true,
      data: interaction,
      mensaje: 'Interacción actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando interacción:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const markActionCompleted = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interaction = await crmService.markActionCompleted(id);

    res.json({
      success: true,
      data: interaction,
      mensaje: 'Acción marcada como completada'
    });
  } catch (error: any) {
    console.error('Error marcando acción completada:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================================
// CONTACTS
// ============================================================================

export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await crmService.createContact(req.body);

    res.status(201).json({
      success: true,
      data: contact,
      mensaje: 'Contacto creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando contacto:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listContacts = async (req: Request, res: Response) => {
  try {
    const {
      companyLeadId,
      companyId,
      limit,
      offset
    } = req.query;

    const contacts = await crmService.listContacts({
      companyLeadId: companyLeadId as string,
      companyId: companyId as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Por ahora no filtrar por usuario específico
    const data = await leadService.getDashboardStats();

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo datos del dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPendingTasks = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const tasks = await crmService.getPendingTasks(user.id);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error: any) {
    console.error('Error obteniendo tareas pendientes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============================================================================
// NOTIFICATIONS - Con restricciones para gestores de empresas
// ============================================================================

export const getAvailableRecipients = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    // Verificar que sea gestor de empresas, admin o super_admin
    if (!['GESTOR_EMPRESAS', 'ADMIN', 'SUPER_ADMIN'].includes(user.primaryRole)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a esta funcionalidad'
      });
    }

    const recipients = await crmService.getAvailableRecipients(user.id, user.primaryRole);

    res.json({
      success: true,
      data: recipients
    });
  } catch (error: any) {
    console.error('Error obteniendo destinatarios disponibles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    // Verificar que sea gestor de empresas, admin o super_admin
    if (!['GESTOR_EMPRESAS', 'ADMIN', 'SUPER_ADMIN'].includes(user.primaryRole)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a las notificaciones'
      });
    }

    const { filter, limit, offset } = req.query;

    const notifications = await crmService.listNotifications(user.id, {
      filter: filter as string,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error: any) {
    console.error('Error listando notificaciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const { id } = req.params;

    // Verificar que la notificación pertenece al usuario
    const notification = await crmService.markNotificationAsRead(id, user.id);

    res.json({
      success: true,
      data: notification,
      mensaje: 'Notificación marcada como leída'
    });
  } catch (error: any) {
    console.error('Error marcando notificación como leída:', error);
    res.status(error.message.includes('no encontrada') ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const result = await crmService.markAllNotificationsAsRead(user.id);

    res.json({
      success: true,
      data: result,
      mensaje: `${result.count} notificaciones marcadas como leídas`
    });
  } catch (error: any) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    // Solo los gestores pueden crear notificaciones y solo para usuarios permitidos
    if (!['GESTOR_EMPRESAS', 'ADMIN', 'SUPER_ADMIN'].includes(user.primaryRole)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para crear notificaciones'
      });
    }

    const { recipientId, ...notificationData } = req.body;

    // Verificar que el gestor puede enviar mensajes al destinatario
    const canSendTo = await crmService.canSendNotificationTo(user.id, user.primaryRole, recipientId);

    if (!canSendTo) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para enviar notificaciones a este usuario'
      });
    }

    const notification = await crmService.createNotification({
      ...notificationData,
      userId: recipientId
    });

    res.status(201).json({
      success: true,
      data: notification,
      mensaje: 'Notificación creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando notificación:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const generateAutomaticNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    // Solo gestores y admins pueden generar notificaciones automáticas
    if (!['GESTOR_EMPRESAS', 'ADMIN', 'SUPER_ADMIN'].includes(user.primaryRole)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para generar notificaciones automáticas'
      });
    }

    const notifications = await crmService.generateAutomaticNotifications(user.id);

    res.json({
      success: true,
      data: notifications,
      mensaje: `${notifications.length} notificaciones automáticas generadas`
    });
  } catch (error: any) {
    console.error('Error generando notificaciones automáticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};