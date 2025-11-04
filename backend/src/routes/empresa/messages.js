const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Importar middleware de autenticación
const { authMiddleware } = require('../../middleware/auth.middleware');

// Middleware para validar que el usuario es una empresa activa
const validateCompanyMiddleware = async (req, res, next) => {
  console.log('\n🏢 === VALIDATING COMPANY MIDDLEWARE ===');
  console.log('🔐 Token recibido:', req.headers.authorization);
  console.log('👤 Usuario completo:', req.user);
  console.log('🔑 User ID:', req.user?.id);
  console.log('👤 Primary Role:', req.user?.primaryRole);
  console.log('🎭 Rol del usuario (role):', req.user?.role);
  console.log('🔍 Role type:', typeof req.user?.primaryRole);
  console.log('✅ Role comparison (EMPRESA):', req.user?.primaryRole === 'EMPRESA');
  console.log('🏢 Es EMPRESA?:', req.user?.role === 'EMPRESA' || req.user?.primaryRole === 'EMPRESA');

  try {
    // Verificar que existe el usuario
    if (!req.user) {
      console.log('❌ No user object in request');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER'
      });
    }

    const userId = req.user.id;

    // Verificar que el usuario tiene rol EMPRESA o COMPANY (para desarrollo)
    // Permitir usuario mock 'emp' para desarrollo
    if (userId !== 'emp' && req.user.primaryRole !== 'EMPRESA' && req.user.role !== 'COMPANY') {
      console.log('❌ Role validation failed:', {
        userId: userId,
        primaryRole: req.user.primaryRole,
        role: req.user.role,
        expected: ['EMPRESA', 'COMPANY', 'emp (mock)']
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only companies can access this resource.',
        code: 'NOT_COMPANY_USER'
      });
    }

    // Obtener la información de la empresa (permitir usuarios mock para desarrollo)
    let company = null;

    if (userId !== 'emp') {
      // Usuario real de la base de datos
      company = await prisma.company.findUnique({
        where: { userId: userId },
        select: {
          id: true,
          name: true,
          isActive: true,
          accountManagerId: true,
          accountManager: {
            select: {
              id: true,
              primaryRole: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company profile not found',
          code: 'COMPANY_NOT_FOUND'
        });
      }
    } else {
      // Usuario mock para desarrollo
      console.log('🧪 Using mock company for development user');
      company = {
        id: 'mock-company',
        name: 'Empresa de Desarrollo',
        isActive: true,
        accountManagerId: null,
        accountManager: null
      };
    }

    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Company is not active',
        code: 'COMPANY_INACTIVE'
      });
    }

    // Por ahora, asumimos que todos los planes excepto BASIC tienen acceso a mensajería
    // En el futuro, aquí se verificaría company.plan !== 'BASIC'
    // TODO: Implementar validación de plan cuando se añadan los campos al schema

    req.company = company;
    console.log('✅ Company validated:', company.name);
    next();
  } catch (error) {
    console.error('❌ Error validating company:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error validating company',
      code: 'VALIDATION_ERROR'
    });
  }
};

// GET /api/v1/empresa/messages/conversations - Obtener conversaciones de la empresa
router.get('/conversations', authMiddleware, validateCompanyMiddleware, async (req, res) => {
  console.log('\n📨 === GET /empresa/messages/conversations ===');
  console.log('🏢 Company:', req.company.name);

  try {
    const userId = req.user.id;
    const companyId = req.company.id;

    // Si es usuario de desarrollo, retornar datos mock
    if (userId === 'emp') {
      console.log('🧪 Returning mock conversations for development user');
      const mockConversations = [
        {
          id: 'mock-conv-1',
          type: 'gestor',
          name: 'Marc García - Gestor Comercial',
          avatar: '/images/avatars/gestor1.png',
          lastMessage: {
            id: 'mock-msg-1',
            senderId: 'gestor1',
            content: 'Hola! Tens alguna pregunta sobre els serveis?',
            type: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          unreadCount: 1,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          participants: [
            {
              id: 'emp',
              name: 'Empresa de Desarrollo',
              avatar: '/images/company-avatar.png',
              isOnline: true,
              lastSeen: new Date().toISOString(),
              status: 'Empresa'
            },
            {
              id: 'gestor1',
              name: 'Marc García',
              avatar: '/images/avatars/gestor1.png',
              isOnline: true,
              lastSeen: new Date().toISOString(),
              status: 'Gestor'
            }
          ]
        },
        {
          id: 'mock-conv-2',
          type: 'company',
          name: 'Equipo Interno',
          avatar: '/images/team-avatar.png',
          lastMessage: {
            id: 'mock-msg-2',
            senderId: 'emp',
            content: 'Hem de revisar el nou contracte',
            type: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          },
          unreadCount: 0,
          isPinned: true,
          isMuted: false,
          isArchived: false,
          participants: [
            {
              id: 'emp',
              name: 'Empresa de Desarrollo',
              avatar: '/images/company-avatar.png',
              isOnline: true,
              lastSeen: new Date().toISOString(),
              status: 'Empresa'
            }
          ]
        }
      ];

      return res.json({
        success: true,
        data: mockConversations
      });
    }

    // Buscar conversaciones donde participa esta empresa
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: userId
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    primaryRole: true,
                    employee: {
                      select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                      }
                    },
                    company: {
                      select: {
                        id: true,
                        name: true,
                        logo: true
                      }
                    }
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                type: true,
                createdAt: true,
                senderId: true
              }
            }
          }
        }
      }
    });

    // Transformar las conversaciones para el formato del frontend
    const formattedConversations = conversations.map(cp => {
      const conversation = cp.conversation;
      const otherParticipants = conversation.participants.filter(p => p.userId !== userId);

      // Determinar el nombre y avatar según el tipo de participante
      let conversationName = 'Conversación';
      let conversationAvatar = '/images/default-avatar.png';
      let conversationType = 'individual';

      if (otherParticipants.length === 1) {
        const otherUser = otherParticipants[0].user;

        if (otherUser.primaryRole === 'GESTOR_EMPRESAS') {
          // Es el gestor comercial asignado
          conversationName = otherUser.employee
            ? `${otherUser.employee.firstName} ${otherUser.employee.lastName} (Gestor)`
            : 'Gestor Comercial';
          conversationAvatar = otherUser.employee?.avatar || '/images/gestor-avatar.png';
          conversationType = 'gestor';
        } else if (otherUser.primaryRole === 'EMPRESA') {
          // Es otra empresa (en el futuro, para personas de contacto)
          conversationName = otherUser.company
            ? `${otherUser.company.name} (Equip)`
            : 'Empresa';
          conversationAvatar = otherUser.company?.logo || '/images/company-avatar.png';
          conversationType = 'company';
        }
      } else if (otherParticipants.length > 1) {
        // Conversación de grupo (futuro)
        conversationName = `Grup (${otherParticipants.length + 1} persones)`;
        conversationType = 'group';
      }

      const lastMessage = conversation.messages[0];

      return {
        id: conversation.id,
        type: conversationType,
        name: conversationName,
        avatar: conversationAvatar,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          senderId: lastMessage.senderId,
          content: lastMessage.content,
          type: lastMessage.type,
          timestamp: lastMessage.createdAt
        } : null,
        unreadCount: 0, // TODO: Implementar conteo de mensajes no leídos
        isPinned: false,
        isMuted: false,
        isArchived: false,
        participants: conversation.participants.map(p => ({
          id: p.user.id,
          name: p.user.employee
            ? `${p.user.employee.firstName} ${p.user.employee.lastName}`
            : p.user.company?.name || 'Usuario',
          avatar: p.user.employee?.avatar || p.user.company?.logo || '/images/default-avatar.png',
          isOnline: false, // TODO: Implementar estado online
          lastSeen: new Date().toISOString(),
          status: p.user.primaryRole
        }))
      };
    });

    console.log(`✅ Found ${formattedConversations.length} conversations for company`);

    res.json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error('❌ Error fetching company conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching conversations',
      code: 'FETCH_CONVERSATIONS_ERROR'
    });
  }
});

// GET /api/v1/empresa/messages/conversations/:id/messages - Obtener mensajes de una conversación
router.get('/conversations/:conversationId/messages', authMiddleware, validateCompanyMiddleware, async (req, res) => {
  console.log('\n📨 === GET /empresa/messages/conversations/:id/messages ===');
  console.log('🔍 Conversation ID:', req.params.conversationId);
  console.log('🏢 Company:', req.company.name);

  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    // Verificar que la empresa es participante de esta conversación
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Company is not a participant in this conversation.',
        code: 'NOT_PARTICIPANT'
      });
    }

    // Obtener mensajes de la conversación
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        senderId: true,
        status: true,
        isEdited: true,
        replyTo: true,
        attachments: true
      }
    });

    console.log(`✅ Found ${messages.length} messages in conversation`);

    res.json({
      success: true,
      data: messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        content: msg.content,
        type: msg.type,
        timestamp: msg.createdAt,
        status: msg.status || 'sent',
        isEdited: msg.isEdited || false,
        replyTo: msg.replyTo,
        attachments: msg.attachments || []
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching messages',
      code: 'FETCH_MESSAGES_ERROR'
    });
  }
});

// POST /api/v1/empresa/messages/conversations/:id/messages - Enviar mensaje
router.post('/conversations/:conversationId/messages', authMiddleware, validateCompanyMiddleware, async (req, res) => {
  console.log('\n📨 === POST /empresa/messages/conversations/:id/messages ===');
  console.log('🔍 Conversation ID:', req.params.conversationId);
  console.log('🏢 Company:', req.company.name);
  console.log('📝 Message data:', req.body);

  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;
    const { content, type = 'text', replyToId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required',
        code: 'EMPTY_MESSAGE'
      });
    }

    // Verificar que la empresa es participante de esta conversación
    const participation = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Company is not a participant in this conversation.',
        code: 'NOT_PARTICIPANT'
      });
    }

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: userId,
        content: content.trim(),
        type: type,
        status: 'sent',
        replyTo: replyToId ? parseInt(replyToId) : null
      },
      select: {
        id: true,
        content: true,
        type: true,
        createdAt: true,
        senderId: true,
        status: true,
        isEdited: true,
        replyTo: true,
        attachments: true
      }
    });

    console.log('✅ Message created:', message.id);

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        timestamp: message.createdAt,
        status: message.status,
        isEdited: message.isEdited || false,
        replyTo: message.replyTo,
        attachments: message.attachments || []
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Error sending message',
      code: 'SEND_MESSAGE_ERROR'
    });
  }
});

// POST /api/v1/empresa/messages/conversations - Crear nueva conversación (futuro)
router.post('/conversations', authMiddleware, validateCompanyMiddleware, async (req, res) => {
  console.log('\n📨 === POST /empresa/messages/conversations ===');
  console.log('🏢 Company:', req.company.name);

  try {
    // Por ahora, las empresas no pueden crear conversaciones nuevas
    // Solo pueden usar las conversaciones existentes con su gestor asignado
    res.status(501).json({
      success: false,
      error: 'Creating new conversations is not implemented yet',
      code: 'NOT_IMPLEMENTED'
    });

  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating conversation',
      code: 'CREATE_CONVERSATION_ERROR'
    });
  }
});

module.exports = router;