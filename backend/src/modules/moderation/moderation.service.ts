import prisma from '../../config/database';

interface ModerationItem {
  id: string;
  type: 'CONTENT' | 'POST' | 'POST_COMMENT' | 'GROUP_POST' | 'FORUM_TOPIC' | 'FORUM_REPLY' | 'ANNOUNCEMENT';
  title?: string;
  content: string;
  author: {
    id: string;
    email: string;
  };
  createdAt: Date;
  reportCount: number;
  reports: {
    id: string;
    reason: string;
    reportedBy: string;
    reporterEmail: string;
    status: string;
    createdAt: Date;
  }[];
  metadata: {
    source: string;
    location?: string;
    isModerated?: boolean;
    isPinned?: boolean;
    reported?: boolean;
    parentInfo?: string;
  };
}

export class ModerationService {
  async getAllReportedContent(filters: {
    type?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    limit?: number;
    offset?: number;
  }) {
    const moderationItems: ModerationItem[] = [];

    // Content (Blog posts)
    if (!filters.type || filters.type === 'CONTENT') {
      const contentReports = await prisma.report.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          content: {
            include: {
              author: {
                select: { id: true, email: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of contentReports) {
        if (report.content) {
          const existingItem = moderationItems.find(item =>
            item.type === 'CONTENT' && item.id === report.content!.id
          );

          if (existingItem) {
            existingItem.reports.push({
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            });
          } else {
            moderationItems.push({
              id: report.content.id,
              type: 'CONTENT',
              title: report.content.title,
              content: report.content.excerpt || report.content.content.substring(0, 200),
              author: report.content.author,
              createdAt: report.content.createdAt,
              reportCount: 1,
              reports: [{
                id: report.id,
                reason: report.reason,
                reportedBy: report.reportedBy,
                reporterEmail: report.reporter.email,
                status: report.status,
                createdAt: report.createdAt
              }],
              metadata: {
                source: 'Blog',
                location: '/admin/blog',
                isModerated: true,
                isPinned: report.content.pinned
              }
            });
          }
        }
      }
    }

    // Posts (Social Feed)
    if (!filters.type || filters.type === 'POST') {
      const postReports = await prisma.postReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          post: {
            include: {
              user: {
                select: { id: true, email: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of postReports) {
        if (report.post) {
          const existingItem = moderationItems.find(item =>
            item.type === 'POST' && item.id === report.post!.id
          );

          if (existingItem) {
            existingItem.reports.push({
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            });
          } else {
            moderationItems.push({
              id: report.post.id,
              type: 'POST',
              content: report.post.content.substring(0, 200),
              author: report.post.user,
              createdAt: report.post.createdAt,
              reportCount: 1,
              reports: [{
                id: report.id,
                reason: report.reason,
                reportedBy: report.reportedBy,
                reporterEmail: report.reporter.email,
                status: report.status,
                createdAt: report.createdAt
              }],
              metadata: {
                source: 'Feed Social',
                location: '/feed',
                reported: report.post.reported,
                isPinned: report.post.isPinned
              }
            });
          }
        }
      }
    }

    // Comments (Post Comments)
    if (!filters.type || filters.type === 'POST_COMMENT') {
      const commentReports = await prisma.postCommentReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          comment: {
            include: {
              post: {
                select: { content: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of commentReports) {
        if (report.comment) {
          const existingItem = moderationItems.find(item =>
            item.type === 'POST_COMMENT' && item.id === report.comment!.id
          );

          if (existingItem) {
            existingItem.reports.push({
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            });
          } else {
            moderationItems.push({
              id: report.comment.id,
              type: 'POST_COMMENT',
              content: report.comment.content.substring(0, 200),
              author: { id: report.comment.userId, email: 'N/A' }, // Necesitaría join adicional
              createdAt: report.comment.createdAt,
              reportCount: 1,
              reports: [{
                id: report.id,
                reason: report.reason,
                reportedBy: report.reportedBy,
                reporterEmail: report.reporter.email,
                status: report.status,
                createdAt: report.createdAt
              }],
              metadata: {
                source: 'Comentarios',
                location: '/feed',
                parentInfo: `En post: ${report.comment.post?.content.substring(0, 50)}...`
              }
            });
          }
        }
      }
    }

    // Forum Topics
    if (!filters.type || filters.type === 'FORUM_TOPIC') {
      const forumReports = await prisma.forumTopicReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          topic: {
            include: {
              forum: {
                select: { title: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of forumReports) {
        if (report.topic) {
          moderationItems.push({
            id: report.topic.id,
            type: 'FORUM_TOPIC',
            title: report.topic.title,
            content: report.topic.content.substring(0, 200),
            author: { id: report.topic.userId, email: 'N/A' }, // Necesitaría join adicional
            createdAt: report.topic.createdAt,
            reportCount: 1,
            reports: [{
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            }],
            metadata: {
              source: 'Foro',
              location: `/admin/foros`,
              parentInfo: `En foro: ${report.topic.forum.title}`,
              isPinned: report.topic.isPinned
            }
          });
        }
      }
    }

    // Group Posts
    if (!filters.type || filters.type === 'GROUP_POST') {
      const groupPostReports = await prisma.groupPostReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          post: {
            include: {
              group: {
                select: { name: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of groupPostReports) {
        if (report.post) {
          moderationItems.push({
            id: report.post.id,
            type: 'GROUP_POST',
            title: report.post.title,
            content: report.post.content.substring(0, 200),
            author: { id: report.post.userId, email: 'N/A' }, // Necesitaría join adicional
            createdAt: report.post.createdAt,
            reportCount: 1,
            reports: [{
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            }],
            metadata: {
              source: 'Grupo',
              location: `/admin/grupos`,
              parentInfo: `En grupo: ${report.post.group.name}`,
              isPinned: report.post.isPinned
            }
          });
        }
      }
    }

    // Announcements
    if (!filters.type || filters.type === 'ANNOUNCEMENT') {
      const announcementReports = await prisma.announcementReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          announcement: true,
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of announcementReports) {
        if (report.announcement) {
          moderationItems.push({
            id: report.announcement.id,
            type: 'ANNOUNCEMENT',
            title: report.announcement.title,
            content: report.announcement.content.substring(0, 200),
            author: { id: report.announcement.userId, email: 'N/A' }, // Necesitaría join adicional
            createdAt: report.announcement.createdAt,
            reportCount: 1,
            reports: [{
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            }],
            metadata: {
              source: 'Anuncio',
              location: '/admin/anuncios',
              isPinned: report.announcement.isPinned
            }
          });
        }
      }
    }

    // Forum Replies
    if (!filters.type || filters.type === 'FORUM_REPLY') {
      const replyReports = await prisma.forumReplyReport.findMany({
        where: filters.status ? { status: filters.status } : {},
        include: {
          reply: {
            include: {
              topic: {
                select: { title: true }
              }
            }
          },
          reporter: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const report of replyReports) {
        if (report.reply) {
          moderationItems.push({
            id: report.reply.id,
            type: 'FORUM_REPLY',
            content: report.reply.content.substring(0, 200),
            author: { id: report.reply.userId, email: 'N/A' }, // Necesitaría join adicional
            createdAt: report.reply.createdAt,
            reportCount: 1,
            reports: [{
              id: report.id,
              reason: report.reason,
              reportedBy: report.reportedBy,
              reporterEmail: report.reporter.email,
              status: report.status,
              createdAt: report.createdAt
            }],
            metadata: {
              source: 'Respuesta de Foro',
              location: `/admin/foros`,
              parentInfo: `En topic: ${report.reply.topic.title}`
            }
          });
        }
      }
    }

    // Actualizar contadores de reportes
    moderationItems.forEach(item => {
      item.reportCount = item.reports.length;
    });

    // Ordenar por fecha de creación más reciente
    moderationItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Aplicar paginación
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const paginatedItems = moderationItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total: moderationItems.length,
      summary: {
        totalReports: moderationItems.reduce((sum, item) => sum + item.reportCount, 0),
        byType: {
          CONTENT: moderationItems.filter(item => item.type === 'CONTENT').length,
          POST: moderationItems.filter(item => item.type === 'POST').length,
          POST_COMMENT: moderationItems.filter(item => item.type === 'POST_COMMENT').length,
          FORUM_TOPIC: moderationItems.filter(item => item.type === 'FORUM_TOPIC').length,
          FORUM_REPLY: moderationItems.filter(item => item.type === 'FORUM_REPLY').length,
          GROUP_POST: moderationItems.filter(item => item.type === 'GROUP_POST').length,
          ANNOUNCEMENT: moderationItems.filter(item => item.type === 'ANNOUNCEMENT').length
        },
        byStatus: {
          PENDING: moderationItems.reduce((sum, item) =>
            sum + item.reports.filter(r => r.status === 'PENDING').length, 0),
          APPROVED: moderationItems.reduce((sum, item) =>
            sum + item.reports.filter(r => r.status === 'APPROVED').length, 0),
          REJECTED: moderationItems.reduce((sum, item) =>
            sum + item.reports.filter(r => r.status === 'REJECTED').length, 0)
        }
      }
    };
  }

  async moderateContent(data: {
    type: 'CONTENT' | 'POST' | 'POST_COMMENT' | 'GROUP_POST' | 'FORUM_TOPIC' | 'FORUM_REPLY' | 'ANNOUNCEMENT';
    contentId: string;
    reportId: string;
    action: 'APPROVE' | 'REJECT';
    moderatorNotes?: string;
  }) {
    const { type, contentId, reportId, action, moderatorNotes } = data;

    try {
      await prisma.$transaction(async (tx) => {
        // Actualizar el estado del reporte
        switch (type) {
          case 'CONTENT':
            await tx.report.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });

            if (action === 'APPROVE') {
              await tx.content.update({
                where: { id: contentId },
                data: { status: 'DRAFT' } // Ocultar contenido
              });
            }
            break;

          case 'POST':
            await tx.postReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });

            if (action === 'APPROVE') {
              await tx.post.update({
                where: { id: contentId },
                data: {
                  reported: true,
                  isModerated: true
                }
              });
            }
            break;

          case 'POST_COMMENT':
            await tx.postCommentReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });
            break;

          case 'GROUP_POST':
            await tx.groupPostReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });
            break;

          case 'FORUM_TOPIC':
            await tx.forumTopicReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });
            break;

          case 'FORUM_REPLY':
            await tx.forumReplyReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });
            break;

          case 'ANNOUNCEMENT':
            await tx.announcementReport.update({
              where: { id: reportId },
              data: {
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
              }
            });
            break;
        }
      });

      return {
        success: true,
        message: action === 'APPROVE'
          ? 'Contenido moderado y ocultado exitosamente'
          : 'Reporte rechazado exitosamente'
      };
    } catch (error: any) {
      throw new Error(`Error en moderación: ${error.message}`);
    }
  }

  async getModerationStats() {
    const stats = {
      totalReports: 0,
      pendingReports: 0,
      resolvedToday: 0,
      byType: {} as Record<string, number>,
      topReporters: [] as { email: string; count: number }[],
      recentActivity: [] as any[]
    };

    try {
      // Reportes de contenido (blog)
      const contentReports = await prisma.report.count();
      const pendingContentReports = await prisma.report.count({
        where: { status: 'PENDING' }
      });

      // Reportes de posts (feed social)
      const postReports = await prisma.postReport.count();
      const pendingPostReports = await prisma.postReport.count({
        where: { status: 'PENDING' }
      });

      // Contar todos los tipos de reportes
      const commentReports = await prisma.postCommentReport.count();
      const groupPostReports = await prisma.groupPostReport.count();
      const forumTopicReports = await prisma.forumTopicReport.count();
      const forumReplyReports = await prisma.forumReplyReport.count();
      const announcementReports = await prisma.announcementReport.count();

      // Contar reportes pendientes adicionales
      const pendingCommentReports = await prisma.postCommentReport.count({
        where: { status: 'PENDING' }
      });
      const pendingGroupPostReports = await prisma.groupPostReport.count({
        where: { status: 'PENDING' }
      });
      const pendingForumTopicReports = await prisma.forumTopicReport.count({
        where: { status: 'PENDING' }
      });
      const pendingForumReplyReports = await prisma.forumReplyReport.count({
        where: { status: 'PENDING' }
      });
      const pendingAnnouncementReports = await prisma.announcementReport.count({
        where: { status: 'PENDING' }
      });

      stats.totalReports = contentReports + postReports + commentReports + groupPostReports +
                          forumTopicReports + forumReplyReports + announcementReports;
      stats.pendingReports = pendingContentReports + pendingPostReports + pendingCommentReports +
                            pendingGroupPostReports + pendingForumTopicReports + pendingForumReplyReports +
                            pendingAnnouncementReports;


      stats.byType = {
        'Blog Posts': contentReports,
        'Feed Social': postReports,
        'Comentarios': commentReports,
        'Posts de Grupo': groupPostReports,
        'Topics de Foro': forumTopicReports,
        'Respuestas de Foro': forumReplyReports,
        'Anuncios': announcementReports
      };

      // Actividad reciente
      const recentContentReports = await prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          content: { select: { title: true } },
          reporter: { select: { email: true } }
        }
      });

      const recentPostReports = await prisma.postReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          post: { select: { content: true } },
          reporter: { select: { email: true } }
        }
      });

      stats.recentActivity = [
        ...recentContentReports.map(r => ({
          type: 'Blog',
          title: r.content?.title || 'Sin título',
          reporter: r.reporter.email,
          reason: r.reason,
          createdAt: r.createdAt
        })),
        ...recentPostReports.map(r => ({
          type: 'Feed',
          title: r.post?.content.substring(0, 50) + '...' || 'Sin contenido',
          reporter: r.reporter.email,
          reason: r.reason,
          createdAt: r.createdAt
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }

    return stats;
  }
}