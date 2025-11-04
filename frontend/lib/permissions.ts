/**
 * Sistema de Permisos Granulares para Panel de Administración
 * Next.js 14 + Prisma + PostgreSQL
 * Multi-tenant por comunidades
 */

// Enum de todos los permisos disponibles en el sistema
export enum Permission {
  // === DASHBOARD ===
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',

  // === BLOG & POSTS ===
  READ_POSTS = 'read_posts',
  CREATE_POSTS = 'create_posts',
  UPDATE_POSTS = 'update_posts',
  DELETE_POSTS = 'delete_posts',
  PUBLISH_POSTS = 'publish_posts',
  MODERATE_POSTS = 'moderate_posts',

  // === USUARIOS ===
  READ_USERS = 'read_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  IMPERSONATE_USERS = 'impersonate_users',

  // === GRUPOS ===
  READ_GROUPS = 'read_groups',
  CREATE_GROUPS = 'create_groups',
  UPDATE_GROUPS = 'update_groups',
  DELETE_GROUPS = 'delete_groups',
  MANAGE_GROUP_MEMBERS = 'manage_group_members',

  // === FOROS ===
  READ_FORUMS = 'read_forums',
  CREATE_FORUMS = 'create_forums',
  UPDATE_FORUMS = 'update_forums',
  DELETE_FORUMS = 'delete_forums',
  MODERATE_FORUMS = 'moderate_forums',

  // === ANUNCIOS ===
  READ_ANNOUNCEMENTS = 'read_announcements',
  CREATE_ANNOUNCEMENTS = 'create_announcements',
  UPDATE_ANNOUNCEMENTS = 'update_announcements',
  DELETE_ANNOUNCEMENTS = 'delete_announcements',
  PIN_ANNOUNCEMENTS = 'pin_announcements',

  // === EMPRESAS ===
  READ_COMPANIES = 'read_companies',
  CREATE_COMPANIES = 'create_companies',
  UPDATE_COMPANIES = 'update_companies',
  DELETE_COMPANIES = 'delete_companies',
  VERIFY_COMPANIES = 'verify_companies',

  // === OFERTAS VIP ===
  READ_VIP_OFFERS = 'read_vip_offers',
  CREATE_VIP_OFFERS = 'create_vip_offers',
  UPDATE_VIP_OFFERS = 'update_vip_offers',
  DELETE_VIP_OFFERS = 'delete_vip_offers',
  MANAGE_VIP_OFFERS = 'manage_vip_offers',

  // === ASSESSORAMENTS ===
  READ_ASSESSMENTS = 'read_assessments',
  CREATE_ASSESSMENTS = 'create_assessments',
  UPDATE_ASSESSMENTS = 'update_assessments',
  DELETE_ASSESSMENTS = 'delete_assessments',
  MANAGE_ASSESSMENTS = 'manage_assessments',

  // === FORMACIÓ ===
  READ_TRAINING = 'read_training',
  CREATE_TRAINING = 'create_training',
  UPDATE_TRAINING = 'update_training',
  DELETE_TRAINING = 'delete_training',
  MANAGE_TRAINING = 'manage_training',

  // === MISSATGES ===
  READ_MESSAGES = 'read_messages',
  CREATE_MESSAGES = 'create_messages',
  UPDATE_MESSAGES = 'update_messages',
  DELETE_MESSAGES = 'delete_messages',
  SEND_MASS_MESSAGES = 'send_mass_messages',

  // === CALENDARIO ===
  READ_CALENDAR = 'read_calendar',
  CREATE_EVENTS = 'create_events',
  UPDATE_EVENTS = 'update_events',
  DELETE_EVENTS = 'delete_events',
  MANAGE_CALENDAR = 'manage_calendar',

  // === MODERACIÓN ===
  VIEW_REPORTS = 'view_reports',
  MODERATE_CONTENT = 'moderate_content',
  BAN_USERS = 'ban_users',
  DELETE_CONTENT = 'delete_content',
  RESOLVE_REPORTS = 'resolve_reports',

  // === PLATAFORMA ===
  MANAGE_PLATFORM_SETTINGS = 'manage_platform_settings',
  MANAGE_COMMUNITIES = 'manage_communities',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_INTEGRATIONS = 'manage_integrations',

  // === SUPER ADMIN ===
  FULL_ACCESS = 'full_access',
  MANAGE_PERMISSIONS = 'manage_permissions',
  SYSTEM_ADMINISTRATION = 'system_administration',
}

// Roles del sistema (según schema.prisma)
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COMMUNITY_MANAGER = 'COMMUNITY_MANAGER',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  COMPANY = 'COMPANY',
  COMPANY_MANAGER = 'COMPANY_MANAGER',
  PUBLIC_EMPLOYEE = 'PUBLIC_EMPLOYEE'
}

// Matriz de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super Admin tiene TODOS los permisos
    Permission.FULL_ACCESS,
    Permission.SYSTEM_ADMINISTRATION,
    Permission.MANAGE_PERMISSIONS,
    Permission.MANAGE_PLATFORM_SETTINGS,
    Permission.MANAGE_COMMUNITIES,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.MANAGE_INTEGRATIONS,
    // Dashboard
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    // Posts & Blog
    Permission.READ_POSTS,
    Permission.CREATE_POSTS,
    Permission.UPDATE_POSTS,
    Permission.DELETE_POSTS,
    Permission.PUBLISH_POSTS,
    Permission.MODERATE_POSTS,
    // Usuarios
    Permission.READ_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.IMPERSONATE_USERS,
    // Grupos
    Permission.READ_GROUPS,
    Permission.CREATE_GROUPS,
    Permission.UPDATE_GROUPS,
    Permission.DELETE_GROUPS,
    Permission.MANAGE_GROUP_MEMBERS,
    // Foros
    Permission.READ_FORUMS,
    Permission.CREATE_FORUMS,
    Permission.UPDATE_FORUMS,
    Permission.DELETE_FORUMS,
    Permission.MODERATE_FORUMS,
    // Anuncios
    Permission.READ_ANNOUNCEMENTS,
    Permission.CREATE_ANNOUNCEMENTS,
    Permission.UPDATE_ANNOUNCEMENTS,
    Permission.DELETE_ANNOUNCEMENTS,
    Permission.PIN_ANNOUNCEMENTS,
    // Empresas
    Permission.READ_COMPANIES,
    Permission.CREATE_COMPANIES,
    Permission.UPDATE_COMPANIES,
    Permission.DELETE_COMPANIES,
    Permission.VERIFY_COMPANIES,
    // Ofertas VIP
    Permission.READ_VIP_OFFERS,
    Permission.CREATE_VIP_OFFERS,
    Permission.UPDATE_VIP_OFFERS,
    Permission.DELETE_VIP_OFFERS,
    Permission.MANAGE_VIP_OFFERS,
    // Assessments
    Permission.READ_ASSESSMENTS,
    Permission.CREATE_ASSESSMENTS,
    Permission.UPDATE_ASSESSMENTS,
    Permission.DELETE_ASSESSMENTS,
    Permission.MANAGE_ASSESSMENTS,
    // Training
    Permission.READ_TRAINING,
    Permission.CREATE_TRAINING,
    Permission.UPDATE_TRAINING,
    Permission.DELETE_TRAINING,
    Permission.MANAGE_TRAINING,
    // Messages
    Permission.READ_MESSAGES,
    Permission.CREATE_MESSAGES,
    Permission.UPDATE_MESSAGES,
    Permission.DELETE_MESSAGES,
    Permission.SEND_MASS_MESSAGES,
    // Calendar
    Permission.READ_CALENDAR,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.DELETE_EVENTS,
    Permission.MANAGE_CALENDAR,
    // Moderación
    Permission.VIEW_REPORTS,
    Permission.MODERATE_CONTENT,
    Permission.BAN_USERS,
    Permission.DELETE_CONTENT,
    Permission.RESOLVE_REPORTS,
  ],

  [UserRole.ADMIN]: [
    // Admin tiene la mayoría de permisos pero no los de super admin
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    // Posts & Blog
    Permission.READ_POSTS,
    Permission.CREATE_POSTS,
    Permission.UPDATE_POSTS,
    Permission.DELETE_POSTS,
    Permission.PUBLISH_POSTS,
    Permission.MODERATE_POSTS,
    // Usuarios (limitado)
    Permission.READ_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    // Grupos
    Permission.READ_GROUPS,
    Permission.CREATE_GROUPS,
    Permission.UPDATE_GROUPS,
    Permission.DELETE_GROUPS,
    Permission.MANAGE_GROUP_MEMBERS,
    // Foros
    Permission.READ_FORUMS,
    Permission.CREATE_FORUMS,
    Permission.UPDATE_FORUMS,
    Permission.DELETE_FORUMS,
    Permission.MODERATE_FORUMS,
    // Anuncios
    Permission.READ_ANNOUNCEMENTS,
    Permission.CREATE_ANNOUNCEMENTS,
    Permission.UPDATE_ANNOUNCEMENTS,
    Permission.DELETE_ANNOUNCEMENTS,
    Permission.PIN_ANNOUNCEMENTS,
    // Empresas
    Permission.READ_COMPANIES,
    Permission.CREATE_COMPANIES,
    Permission.UPDATE_COMPANIES,
    Permission.VERIFY_COMPANIES,
    // Ofertas VIP
    Permission.READ_VIP_OFFERS,
    Permission.CREATE_VIP_OFFERS,
    Permission.UPDATE_VIP_OFFERS,
    Permission.DELETE_VIP_OFFERS,
    Permission.MANAGE_VIP_OFFERS,
    // Assessments
    Permission.READ_ASSESSMENTS,
    Permission.CREATE_ASSESSMENTS,
    Permission.UPDATE_ASSESSMENTS,
    Permission.DELETE_ASSESSMENTS,
    Permission.MANAGE_ASSESSMENTS,
    // Training
    Permission.READ_TRAINING,
    Permission.CREATE_TRAINING,
    Permission.UPDATE_TRAINING,
    Permission.DELETE_TRAINING,
    Permission.MANAGE_TRAINING,
    // Messages
    Permission.READ_MESSAGES,
    Permission.CREATE_MESSAGES,
    Permission.UPDATE_MESSAGES,
    Permission.DELETE_MESSAGES,
    Permission.SEND_MASS_MESSAGES,
    // Calendar
    Permission.READ_CALENDAR,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.DELETE_EVENTS,
    Permission.MANAGE_CALENDAR,
    // Moderación
    Permission.VIEW_REPORTS,
    Permission.MODERATE_CONTENT,
    Permission.BAN_USERS,
    Permission.DELETE_CONTENT,
    Permission.RESOLVE_REPORTS,
  ],

  [UserRole.COMMUNITY_MANAGER]: [
    // Community Manager solo para su comunidad
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    // Posts & Blog (solo de su comunidad)
    Permission.READ_POSTS,
    Permission.CREATE_POSTS,
    Permission.UPDATE_POSTS,
    Permission.PUBLISH_POSTS,
    Permission.MODERATE_POSTS,
    // Usuarios (solo lectura)
    Permission.READ_USERS,
    // Grupos (solo de su comunidad)
    Permission.READ_GROUPS,
    Permission.CREATE_GROUPS,
    Permission.UPDATE_GROUPS,
    Permission.MANAGE_GROUP_MEMBERS,
    // Foros (solo de su comunidad)
    Permission.READ_FORUMS,
    Permission.CREATE_FORUMS,
    Permission.UPDATE_FORUMS,
    Permission.MODERATE_FORUMS,
    // Anuncios (solo de su comunidad)
    Permission.READ_ANNOUNCEMENTS,
    Permission.CREATE_ANNOUNCEMENTS,
    Permission.UPDATE_ANNOUNCEMENTS,
    // Empresas (solo lectura)
    Permission.READ_COMPANIES,
    // Messages (limitado)
    Permission.READ_MESSAGES,
    Permission.CREATE_MESSAGES,
    Permission.SEND_MASS_MESSAGES,
    // Calendar (de su comunidad)
    Permission.READ_CALENDAR,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.MANAGE_CALENDAR,
    // Moderación (limitada)
    Permission.VIEW_REPORTS,
    Permission.MODERATE_CONTENT,
    Permission.RESOLVE_REPORTS,
  ],

  [UserRole.MODERATOR]: [
    // Moderator solo puede moderar, no crear
    Permission.VIEW_DASHBOARD,
    // Solo lectura en posts
    Permission.READ_POSTS,
    Permission.MODERATE_POSTS,
    // Solo lectura en usuarios
    Permission.READ_USERS,
    // Solo lectura en grupos
    Permission.READ_GROUPS,
    // Moderación de foros
    Permission.READ_FORUMS,
    Permission.MODERATE_FORUMS,
    // Solo lectura en anuncios
    Permission.READ_ANNOUNCEMENTS,
    // Solo lectura en empresas
    Permission.READ_COMPANIES,
    // Moderación completa
    Permission.VIEW_REPORTS,
    Permission.MODERATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.RESOLVE_REPORTS,
  ],

  [UserRole.USER]: [
    // Usuario normal - sin acceso al admin
  ],

  [UserRole.COMPANY]: [
    // Empresa - sin acceso al admin, solo dashboard de empresa
  ],

  [UserRole.COMPANY_MANAGER]: [
    // Gestor Comercial - acceso a herramientas de gestión de empresas
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    // Empresas
    Permission.READ_COMPANIES,
    Permission.CREATE_COMPANIES,
    Permission.UPDATE_COMPANIES,
    Permission.VERIFY_COMPANIES,
    // Messages para comunicación con empresas
    Permission.READ_MESSAGES,
    Permission.CREATE_MESSAGES,
    Permission.UPDATE_MESSAGES,
    Permission.SEND_MASS_MESSAGES,
    // Calendar para agenda comercial
    Permission.READ_CALENDAR,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.MANAGE_CALENDAR,
  ],

  [UserRole.PUBLIC_EMPLOYEE]: [
    // Empleado Público - acceso limitado al dashboard público
    Permission.VIEW_DASHBOARD,
    // Solo lectura en posts y anuncios
    Permission.READ_POSTS,
    Permission.READ_ANNOUNCEMENTS,
    // Participación en grupos y foros
    Permission.READ_GROUPS,
    Permission.READ_FORUMS,
    // Lectura de empresas públicas
    Permission.READ_COMPANIES,
    // Mensajería básica
    Permission.READ_MESSAGES,
    Permission.CREATE_MESSAGES,
    // Calendar para eventos públicos
    Permission.READ_CALENDAR,
  ],
};

// Interface para información del usuario
export interface UserInfo {
  id: string;
  role: UserRole;
  communityId?: string;
  email: string;
  isActive: boolean;
}

// Interface para contexto de comunidad
export interface CommunityContext {
  communityId?: string;
  resourceCommunityId?: string;
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @param user Información del usuario
 * @param permission Permiso a verificar
 * @param context Contexto de comunidad (opcional)
 * @returns boolean
 */
export function hasPermission(
  user: UserInfo,
  permission: Permission,
  context?: CommunityContext
): boolean {
  // Usuario inactivo no tiene permisos
  if (!user.isActive) {
    return false;
  }

  // Super Admin tiene acceso completo
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Verificar si el rol tiene el permiso
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions.includes(permission)) {
    return false;
  }

  // Verificar contexto de comunidad para Community Managers
  if (user.role === UserRole.COMMUNITY_MANAGER && context) {
    // Community Manager solo puede acceder a su propia comunidad
    if (user.communityId && context.resourceCommunityId) {
      return user.communityId === context.resourceCommunityId;
    }
    // Si no hay contexto específico de recurso, permitir acceso
    return true;
  }

  return true;
}

/**
 * Verifica si un usuario puede acceder a una comunidad específica
 * @param user Información del usuario
 * @param communityId ID de la comunidad
 * @returns boolean
 */
export function canAccessCommunity(user: UserInfo, communityId: string): boolean {
  // Usuario inactivo no puede acceder
  if (!user.isActive) {
    return false;
  }

  // Super Admin y Admin pueden acceder a cualquier comunidad
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
    return true;
  }

  // Community Manager solo puede acceder a su comunidad
  if (user.role === UserRole.COMMUNITY_MANAGER) {
    return user.communityId === communityId;
  }

  // Moderator puede acceder si tiene asignada la comunidad
  if (user.role === UserRole.MODERATOR) {
    return user.communityId === communityId;
  }

  return false;
}

/**
 * Obtiene todos los permisos de un rol
 * @param role Rol del usuario
 * @returns Permission[]
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica si un usuario puede acceder al panel de administración
 * @param user Información del usuario
 * @returns boolean
 */
export function canAccessAdmin(user: UserInfo): boolean {
  const adminRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COMMUNITY_MANAGER,
    UserRole.MODERATOR,
    UserRole.COMPANY_MANAGER
  ];

  return user.isActive && adminRoles.includes(user.role);
}

/**
 * Obtiene las rutas del admin a las que puede acceder el usuario
 * @param user Información del usuario
 * @returns string[]
 */
export function getAccessibleAdminRoutes(user: UserInfo): string[] {
  if (!canAccessAdmin(user)) {
    return [];
  }

  const routes: string[] = [];

  // Dashboard siempre disponible para admin users
  if (hasPermission(user, Permission.VIEW_DASHBOARD)) {
    routes.push('/admin');
  }

  // Blog
  if (hasPermission(user, Permission.READ_POSTS)) {
    routes.push('/admin/blog', '/admin/blog/listar');
  }
  if (hasPermission(user, Permission.CREATE_POSTS)) {
    routes.push('/admin/blog/crear');
  }

  // Posts
  if (hasPermission(user, Permission.READ_POSTS)) {
    routes.push('/admin/posts', '/admin/posts/listar');
  }
  if (hasPermission(user, Permission.CREATE_POSTS)) {
    routes.push('/admin/posts/crear');
  }

  // Grupos
  if (hasPermission(user, Permission.READ_GROUPS)) {
    routes.push('/admin/grupos', '/admin/grupos/listar');
  }
  if (hasPermission(user, Permission.CREATE_GROUPS)) {
    routes.push('/admin/grupos/crear');
  }

  // Foros
  if (hasPermission(user, Permission.READ_FORUMS)) {
    routes.push('/admin/foros', '/admin/foros/listar');
  }
  if (hasPermission(user, Permission.CREATE_FORUMS)) {
    routes.push('/admin/foros/crear');
  }

  // Anuncios
  if (hasPermission(user, Permission.READ_ANNOUNCEMENTS)) {
    routes.push('/admin/anuncios', '/admin/anuncios/listar');
  }
  if (hasPermission(user, Permission.CREATE_ANNOUNCEMENTS)) {
    routes.push('/admin/anuncios/crear');
  }

  // Empresas
  if (hasPermission(user, Permission.READ_COMPANIES)) {
    routes.push('/admin/empresas', '/admin/empresas/listar');
  }
  if (hasPermission(user, Permission.CREATE_COMPANIES)) {
    routes.push('/admin/empresas/crear');
  }

  // Ofertas VIP
  if (hasPermission(user, Permission.READ_VIP_OFFERS)) {
    routes.push('/admin/ofertas', '/admin/ofertas/listar');
  }
  if (hasPermission(user, Permission.CREATE_VIP_OFFERS)) {
    routes.push('/admin/ofertas/crear');
  }

  // Assessoraments
  if (hasPermission(user, Permission.READ_ASSESSMENTS)) {
    routes.push('/admin/assessoraments', '/admin/assessoraments/listar');
  }
  if (hasPermission(user, Permission.CREATE_ASSESSMENTS)) {
    routes.push('/admin/assessoraments/crear');
  }

  // Formació
  if (hasPermission(user, Permission.READ_TRAINING)) {
    routes.push('/admin/formacio', '/admin/formacio/listar');
  }
  if (hasPermission(user, Permission.CREATE_TRAINING)) {
    routes.push('/admin/formacio/crear');
  }

  // Missatges
  if (hasPermission(user, Permission.READ_MESSAGES)) {
    routes.push('/admin/missatges');
  }
  if (hasPermission(user, Permission.CREATE_MESSAGES)) {
    routes.push('/admin/missatges/crear');
  }

  // Calendario
  if (hasPermission(user, Permission.READ_CALENDAR)) {
    routes.push('/admin/calendario', '/admin/calendario/listar');
  }
  if (hasPermission(user, Permission.CREATE_EVENTS)) {
    routes.push('/admin/calendario/crear');
  }

  // Usuarios
  if (hasPermission(user, Permission.READ_USERS)) {
    routes.push('/admin/usuarios', '/admin/usuarios/listar');
  }
  if (hasPermission(user, Permission.CREATE_USERS)) {
    routes.push('/admin/usuarios/crear');
  }

  // Moderación
  if (hasPermission(user, Permission.VIEW_REPORTS)) {
    routes.push('/admin/moderacion', '/admin/moderacion-unificada');
  }

  // Plataforma
  if (hasPermission(user, Permission.MANAGE_PLATFORM_SETTINGS)) {
    routes.push('/admin/plataforma', '/admin/plataforma/configuracion');
  }

  return routes;
}

// Mapeo de rutas admin a permisos requeridos
export const ADMIN_ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': [Permission.VIEW_DASHBOARD],
  '/admin/blog': [Permission.READ_POSTS],
  '/admin/blog/listar': [Permission.READ_POSTS],
  '/admin/blog/crear': [Permission.CREATE_POSTS],
  '/admin/posts': [Permission.READ_POSTS],
  '/admin/posts/listar': [Permission.READ_POSTS],
  '/admin/posts/crear': [Permission.CREATE_POSTS],
  '/admin/grupos': [Permission.READ_GROUPS],
  '/admin/grupos/listar': [Permission.READ_GROUPS],
  '/admin/grupos/crear': [Permission.CREATE_GROUPS],
  '/admin/foros': [Permission.READ_FORUMS],
  '/admin/foros/listar': [Permission.READ_FORUMS],
  '/admin/foros/crear': [Permission.CREATE_FORUMS],
  '/admin/anuncios': [Permission.READ_ANNOUNCEMENTS],
  '/admin/anuncios/listar': [Permission.READ_ANNOUNCEMENTS],
  '/admin/anuncios/crear': [Permission.CREATE_ANNOUNCEMENTS],
  '/admin/empresas': [Permission.READ_COMPANIES],
  '/admin/empresas/listar': [Permission.READ_COMPANIES],
  '/admin/empresas/crear': [Permission.CREATE_COMPANIES],
  '/admin/ofertas': [Permission.READ_VIP_OFFERS],
  '/admin/ofertas/listar': [Permission.READ_VIP_OFFERS],
  '/admin/ofertas/crear': [Permission.CREATE_VIP_OFFERS],
  '/admin/assessoraments': [Permission.READ_ASSESSMENTS],
  '/admin/assessoraments/listar': [Permission.READ_ASSESSMENTS],
  '/admin/assessoraments/crear': [Permission.CREATE_ASSESSMENTS],
  '/admin/formacio': [Permission.READ_TRAINING],
  '/admin/formacio/listar': [Permission.READ_TRAINING],
  '/admin/formacio/crear': [Permission.CREATE_TRAINING],
  '/admin/missatges': [Permission.READ_MESSAGES],
  '/admin/missatges/crear': [Permission.CREATE_MESSAGES],
  '/admin/calendario': [Permission.READ_CALENDAR],
  '/admin/calendario/listar': [Permission.READ_CALENDAR],
  '/admin/calendario/crear': [Permission.CREATE_EVENTS],
  '/admin/usuarios': [Permission.READ_USERS],
  '/admin/usuarios/listar': [Permission.READ_USERS],
  '/admin/usuarios/crear': [Permission.CREATE_USERS],
  '/admin/moderacion': [Permission.VIEW_REPORTS],
  '/admin/moderacion-unificada': [Permission.VIEW_REPORTS],
  '/admin/plataforma': [Permission.MANAGE_PLATFORM_SETTINGS],
  '/admin/plataforma/configuracion': [Permission.MANAGE_PLATFORM_SETTINGS],
};