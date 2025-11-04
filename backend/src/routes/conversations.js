const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Importar el middleware de autenticación real
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/conversations - Obtenir les converses de l'usuari
router.get('/', authMiddleware, async (req, res) => {
  console.log('\n📨 === GET /conversations (JS) ===');
  console.log('👤 Usuario autenticado:', req.user);
  console.log('📍 URL completa:', req.url);
  console.log('📍 Headers auth:', req.headers.authorization);
  try {
    const userId = req.user.id;

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
              include: {
                sender: {
                  select: {
                    id: true,
                    employee: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc'
        }
      }
    });

    // Transformar les dades per al frontend
    const transformedConversations = conversations.map(cp => {
      const conv = cp.conversation;
      const lastMessage = conv.messages[0] || null;

      // Calcular el nom de la conversa
      let conversationName = conv.name;
      let avatar = conv.avatar;
      let type = 'individual';

      if (!conv.isGroup) {
        // Per converses individuals, usar el nom de l'altre participant
        const otherParticipant = conv.participants.find(p => p.userId !== userId);
        if (otherParticipant) {
          if (otherParticipant.user.primaryRole === 'EMPRESA') {
            conversationName = otherParticipant.user.company?.name || 'Empresa';
            avatar = otherParticipant.user.company?.logo;
            type = 'company';
          } else if (otherParticipant.user.primaryRole === 'ADMIN') {
            conversationName = `${otherParticipant.user.employee?.firstName} ${otherParticipant.user.employee?.lastName}` || 'Admin';
            avatar = otherParticipant.user.employee?.avatar;
            type = 'admin';
          } else if (otherParticipant.user.primaryRole === 'GESTOR_EMPRESAS') {
            conversationName = `${otherParticipant.user.employee?.firstName} ${otherParticipant.user.employee?.lastName}` || 'Gestor';
            avatar = otherParticipant.user.employee?.avatar;
            type = 'gestor';
          }
        }
      } else {
        type = 'group';
      }

      return {
        id: conv.id,
        name: conversationName,
        type: type,
        avatar: avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop`,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          conversationId: lastMessage.conversationId,
          senderId: lastMessage.senderId,
          content: lastMessage.content,
          type: lastMessage.type.toLowerCase(),
          timestamp: lastMessage.createdAt,
          status: lastMessage.status.toLowerCase()
        } : null,
        unreadCount: cp.unreadCount,
        isPinned: cp.isPinned,
        isMuted: cp.isMuted,
        isArchived: cp.isArchived,
        participants: conv.participants.map(p => ({
          id: p.user.id,
          name: p.user.employee ? `${p.user.employee.firstName} ${p.user.employee.lastName}` : p.user.company?.name || 'Unknown',
          avatar: p.user.employee?.avatar || p.user.company?.logo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop`,
          isOnline: false
        }))
      };
    });

    console.log('✅ Conversations encontradas:', transformedConversations.length);
    console.log('📨 === FIN GET /conversations (JS) ===\n');

    res.json({
      success: true,
      data: transformedConversations
    });

  } catch (error) {
    console.error('❌ Error obtenint converses:', error);
    console.error('❌ Stack trace:', error.stack);
    console.log('📨 === FIN GET /conversations (ERROR) ===\n');
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// GET /api/conversations/:id/messages - Obtenir els missatges d'una conversa
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Verificar que l'usuari forma part de la conversa
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'No tens accés a aquesta conversa'
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        },
        attachments: true,
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      content: msg.content,
      type: msg.type.toLowerCase(),
      timestamp: msg.createdAt,
      status: msg.status.toLowerCase(),
      isEdited: msg.isEdited,
      replyTo: msg.replyTo ? {
        id: msg.replyTo.id,
        content: msg.replyTo.content,
        sender: msg.replyTo.sender.employee ?
          `${msg.replyTo.sender.employee.firstName} ${msg.replyTo.sender.employee.lastName}` :
          msg.replyTo.sender.company?.name || 'Unknown'
      } : null,
      attachments: msg.attachments.map(att => ({
        id: att.id,
        name: att.fileName,
        url: att.fileUrl,
        type: att.fileType,
        size: att.fileSize
      }))
    }));

    // Marcar els missatges com llegits
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId
        }
      },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0
      }
    });

    res.json({
      success: true,
      data: transformedMessages
    });

  } catch (error) {
    console.error('Error obtenint missatges:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// POST /api/conversations/:id/messages - Enviar un missatge
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { content, type = 'TEXT', replyToId = null } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El contingut del missatge no pot estar buit'
      });
    }

    // Verificar que l'usuari forma part de la conversa
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'No tens accés a aquesta conversa'
      });
    }

    // Crear el missatge
    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: userId,
        content: content.trim(),
        type: type.toUpperCase(),
        replyToId: replyToId,
        status: 'SENT'
      },
      include: {
        sender: {
          select: {
            id: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            company: {
              select: {
                name: true,
                logo: true
              }
            }
          }
        },
        attachments: true
      }
    });

    // Actualitzar la conversa amb l'hora del darrer missatge
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // Incrementar el contador de no llegits per tots els altres participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: { not: userId }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    const transformedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      type: message.type.toLowerCase(),
      timestamp: message.createdAt,
      status: message.status.toLowerCase(),
      attachments: []
    };

    res.json({
      success: true,
      data: transformedMessage
    });

  } catch (error) {
    console.error('Error enviant missatge:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// GET /api/conversations/recipients - Obtenir destinataris disponibles per a gestors
router.get('/recipients', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.primaryRole;

    if (userRole !== 'GESTOR_EMPRESAS') {
      return res.status(403).json({
        success: false,
        error: 'Només els gestors d\'empreses poden accedir a aquesta funcionalitat'
      });
    }

    const recipients = [];

    // 1. Admins
    const admins = await prisma.user.findMany({
      where: {
        primaryRole: 'ADMIN',
        isActive: true,
        id: { not: userId }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    admins.forEach(admin => {
      recipients.push({
        id: admin.id,
        name: admin.employee ? `${admin.employee.firstName} ${admin.employee.lastName}` : 'Admin',
        avatar: admin.employee?.avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop`,
        type: 'admin',
        role: 'Administrador'
      });
    });

    // 2. Altres gestors d'empreses
    const gestors = await prisma.user.findMany({
      where: {
        primaryRole: 'GESTOR_EMPRESAS',
        isActive: true,
        id: { not: userId }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    gestors.forEach(gestor => {
      recipients.push({
        id: gestor.id,
        name: gestor.employee ? `${gestor.employee.firstName} ${gestor.employee.lastName}` : 'Gestor',
        avatar: gestor.employee?.avatar || `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop`,
        type: 'gestor',
        role: 'Gestor Comercial'
      });
    });

    // 3. Empreses assignades al gestor
    const companies = await prisma.user.findMany({
      where: {
        primaryRole: 'EMPRESA',
        isActive: true,
        company: {
          accountManagerId: userId  // ✅ Solo empresas asignadas
        }
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            sector: true
          }
        }
      }
    });

    companies.forEach(company => {
      recipients.push({
        id: company.id,
        name: company.company?.name || 'Empresa',
        avatar: company.company?.logo || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop`,
        type: 'company',
        role: `Empresa - ${company.company?.sector || 'Sector desconegut'}`
      });
    });

    res.json({
      success: true,
      data: recipients
    });

  } catch (error) {
    console.error('Error obtenint destinataris:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

// POST /api/conversations - Crear una nova conversa
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantIds, name, isGroup = false } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Has de proporcionar almenys un participant'
      });
    }

    // Afegir l'usuari actual als participants si no hi és
    const allParticipants = [...new Set([userId, ...participantIds])];

    if (!isGroup && allParticipants.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Les converses individuals han de tenir exactament 2 participants'
      });
    }

    // Per converses individuals, verificar si ja existeix
    if (!isGroup) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: allParticipants }
            }
          }
        },
        include: {
          participants: true
        }
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return res.json({
          success: true,
          data: { id: existingConversation.id },
          message: 'Conversa ja existent'
        });
      }
    }

    // Crear la nova conversa
    const conversation = await prisma.conversation.create({
      data: {
        name: isGroup ? name : null,
        isGroup: isGroup,
        type: isGroup ? 'GROUP' : 'INDIVIDUAL',
        createdById: userId,
        participants: {
          create: allParticipants.map(participantId => ({
            userId: participantId,
            role: participantId === userId ? 'ADMIN' : 'MEMBER'
          }))
        }
      }
    });

    res.json({
      success: true,
      data: { id: conversation.id },
      message: 'Conversa creada correctament'
    });

  } catch (error) {
    console.error('Error creant conversa:', error);
    res.status(500).json({
      success: false,
      error: 'Error intern del servidor'
    });
  }
});

module.exports = router;