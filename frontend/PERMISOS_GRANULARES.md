# Sistema de Permisos Granulares - La Pública

## 📋 Resumen Ejecutivo

Sistema completo de autorización y autenticación para el panel de administración de La Pública, implementado con Next.js 14, TypeScript y JWT. Proporciona control granular de acceso basado en roles (RBAC) con soporte multi-tenant.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **`lib/permissions.ts`** - Core del sistema de permisos
2. **`src/middleware.ts`** - Middleware de autenticación/autorización
3. **`lib/rbac.ts`** - Helpers y decoradores para APIs
4. **`src/app/api/test-permissions/route.ts`** - API de testing

## 🔐 Roles y Permisos

### Roles Disponibles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `SUPER_ADMIN` | Administrador supremo | Acceso completo a todo el sistema |
| `ADMIN` | Administrador general | Acceso completo excepto configuración del sistema |
| `COMMUNITY_MANAGER` | Gestor de comunidad | Solo acceso a su comunidad asignada |
| `MODERATOR` | Moderador | Solo funciones de moderación en su comunidad |
| `USER` | Usuario estándar | Sin acceso al panel admin |
| `COMPANY` | Empresa | Sin acceso al panel admin |

### Matriz de Permisos

#### SUPER_ADMIN
- ✅ **Acceso completo** a todas las funcionalidades
- ✅ **Gestión del sistema** y configuración global
- ✅ **Todos los módulos** en todas las comunidades

#### ADMIN
- ✅ **Gestión completa** de contenido y usuarios
- ✅ **Todos los módulos** excepto configuración del sistema
- ✅ **Acceso multi-comunidad**
- ❌ Gestión de permisos y configuración del sistema

#### COMMUNITY_MANAGER
- ✅ **Gestión completa** solo en su comunidad
- ✅ Blog, Posts, Grupos, Foros, Anuncios, Formació, Assessoraments
- ✅ **Mensajería masiva** en su comunidad
- ❌ Gestión de usuarios de otras comunidades

#### MODERATOR
- ✅ **Solo moderación** en su comunidad
- ✅ Ver reportes y moderar contenido
- ✅ **Lectura** de la mayoría de módulos
- ❌ Crear o modificar contenido

## 🛡️ Implementación Técnica

### 1. Sistema de Permisos (`lib/permissions.ts`)

```typescript
// Enum de permisos granulares
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  CREATE_POSTS = 'create_posts',
  DELETE_USERS = 'delete_users',
  // ... +50 permisos específicos
}

// Verificación de permisos
export function hasPermission(
  user: UserInfo,
  permission: Permission,
  context?: CommunityContext
): boolean
```

### 2. Middleware de Autenticación (`src/middleware.ts`)

```typescript
export async function middleware(request: NextRequest) {
  // 1. Verificar JWT token
  // 2. Validar acceso a /admin/*
  // 3. Verificar permisos específicos por ruta
  // 4. Inyectar datos de usuario en headers
}
```

### 3. Helpers RBAC (`lib/rbac.ts`)

```typescript
// Wrappers para APIs
export const withAuth = (handler) => { /* ... */ }
export const withPermissions = (permissions) => (handler) => { /* ... */ }
export const withAdminAccess = (handler) => { /* ... */ }

// Decoradores
@requirePermission(Permission.CREATE_POSTS)
@requireAdminAccess
```

## 🚀 Uso del Sistema

### En API Routes

```typescript
import { withPermissions, Permission } from '@/lib/rbac';

// Proteger endpoint con permisos específicos
export const POST = withPermissions([Permission.CREATE_POSTS])(
  async (user: UserInfo, request: NextRequest) => {
    // El usuario ya está validado y tiene permisos
    // user contiene toda la información del usuario autenticado
  }
);

// Proteger con acceso general de admin
export const GET = withAdminAccess(async (user: UserInfo) => {
  // Solo admins pueden acceder
});
```

### En Páginas/Componentes

```typescript
import { getCurrentUser, hasPermission, Permission } from '@/lib/rbac';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || !hasPermission(user, Permission.VIEW_DASHBOARD)) {
    redirect('/access-denied');
  }

  return <Dashboard user={user} />;
}
```

### Con Decoradores

```typescript
class PostService {
  @requirePermission(Permission.CREATE_POSTS)
  async createPost(data: PostData) {
    // Solo ejecuta si el usuario tiene permiso
  }

  @requireAdminAccess
  async deletePost(id: string) {
    // Solo admins pueden eliminar
  }
}
```

## 🔧 Configuración

### Variables de Entorno

```env
# JWT Secret (cambiar en producción)
JWT_SECRET=tu-clave-secreta-muy-segura

# Base URL para redirecciones
NEXTAUTH_URL=http://localhost:3000

# Database URL para Prisma
DATABASE_URL=postgresql://user:pass@localhost:5432/lapublica
```

### Estructura de JWT Token

```typescript
interface JWTPayload {
  sub: string;              // User ID
  email: string;            // Email del usuario
  role: UserRole;           // Rol del usuario
  communityId?: string;     // ID de comunidad (si aplica)
  isActive: boolean;        // Estado activo
  iat: number;              // Issued at
  exp: number;              // Expiration
}
```

## 🧪 Testing del Sistema

### API de Testing: `/api/test-permissions`

#### GET Requests

```bash
# Overview de permisos del usuario actual
GET /api/test-permissions?test=overview

# Test de todos los permisos
GET /api/test-permissions?test=permissions

# Test de rutas accesibles
GET /api/test-permissions?test=routes

# Test de acceso a comunidades
GET /api/test-permissions?test=communities

# Test de acceso a recursos
GET /api/test-permissions?test=resources

# Análisis de todos los roles
GET /api/test-permissions?test=all-roles
```

#### POST Requests

```bash
# Test permiso específico
POST /api/test-permissions
{
  "action": "check-permission",
  "permission": "create_posts"
}

# Test acceso a comunidad
POST /api/test-permissions
{
  "action": "check-community-access",
  "communityId": "community-1"
}

# Test modificación de recurso
POST /api/test-permissions
{
  "action": "check-resource-modification",
  "resourceId": "resource-123"
}
```

## 📊 Mapeo de Rutas y Permisos

| Ruta Admin | Permisos Requeridos |
|------------|-------------------|
| `/admin` | `VIEW_DASHBOARD` |
| `/admin/blog/crear` | `CREATE_POSTS` |
| `/admin/usuarios/listar` | `READ_USERS` |
| `/admin/moderacion` | `VIEW_REPORTS` |
| `/admin/plataforma` | `MANAGE_PLATFORM_SETTINGS` |

## 🔒 Seguridad

### Características de Seguridad

- ✅ **JWT con expiración** configurable
- ✅ **Validación estricta** de roles y permisos
- ✅ **Contexto de comunidad** para multi-tenancy
- ✅ **Logging de acciones** de seguridad
- ✅ **Headers seguros** con información de usuario
- ✅ **Filtrado automático** de datos por rol

### Auditoría

```typescript
// Log automático de acciones de seguridad
logSecurityAction(user, 'access_denied', '/admin/usuarios', false);
logSecurityAction(user, 'permission_granted', 'create_posts', true);
```

## 🚨 Manejo de Errores

### Tipos de Error

```typescript
// Error de autenticación
throw new AuthenticationError('Token no válido');

// Error de autorización
throw new AuthorizationError('Permiso insuficiente', 'FORBIDDEN');
```

### Respuestas HTTP

- **401 Unauthorized** - Token no válido o faltante
- **403 Forbidden** - Sin permisos suficientes
- **404 Not Found** - Recurso no encontrado
- **500 Internal Error** - Error del servidor

## 📱 Integración Frontend

### Hook Personalizado

```typescript
// Hook para verificar permisos en componentes
function usePermissions() {
  const { user } = useAuth();

  const checkPermission = (permission: Permission) => {
    return hasPermission(user, permission);
  };

  const canAccess = (route: string) => {
    return getAccessibleAdminRoutes(user).includes(route);
  };

  return { checkPermission, canAccess, user };
}
```

### Componente Protegido

```typescript
function ProtectedComponent({ permission, children }) {
  const { checkPermission } = usePermissions();

  if (!checkPermission(permission)) {
    return <AccessDeniedMessage />;
  }

  return children;
}
```

## 🎯 Casos de Uso Específicos

### Community Manager

```typescript
// Usuario: manager@barcelona.com
// Rol: COMMUNITY_MANAGER
// CommunityId: "barcelona"

// ✅ Puede crear posts en Barcelona
hasPermission(user, Permission.CREATE_POSTS) // true

// ✅ Puede acceder a /admin/blog/crear
canAccessRoute(user, '/admin/blog/crear') // true

// ❌ No puede acceder a datos de Madrid
canAccessCommunity(user, 'madrid') // false

// ✅ Solo ve recursos de Barcelona
filterDataByUserAccess(allPosts, user) // solo posts de Barcelona
```

### Moderator

```typescript
// Usuario: mod@barcelona.com
// Rol: MODERATOR
// CommunityId: "barcelona"

// ✅ Puede moderar contenido
hasPermission(user, Permission.MODERATE_CONTENT) // true

// ❌ No puede crear posts
hasPermission(user, Permission.CREATE_POSTS) // false

// ✅ Puede ver reportes
hasPermission(user, Permission.VIEW_REPORTS) // true
```

## 📈 Métricas y Monitoreo

### Logs de Seguridad

```typescript
// Ejemplo de log generado
{
  "timestamp": "2025-10-26T09:24:03Z",
  "userId": "user-123",
  "userEmail": "admin@lapublica.com",
  "userRole": "ADMIN",
  "action": "access_granted",
  "resource": "/admin/usuarios/crear",
  "success": true,
  "communityId": "barcelona"
}
```

### Dashboard de Permisos

- **Accesos exitosos** por rol
- **Accesos denegados** más frecuentes
- **Usuarios más activos** en admin
- **Rutas más utilizadas** por rol

## 🔄 Migración y Actualización

### Desde Sistema Anterior

1. **Backup** de configuración actual
2. **Mapeo** de roles existentes
3. **Migración** gradual por módulo
4. **Testing** exhaustivo
5. **Rollback** plan si es necesario

### Añadir Nuevos Permisos

```typescript
// 1. Añadir al enum Permission
export enum Permission {
  // ... existentes
  NEW_PERMISSION = 'new_permission'
}

// 2. Añadir a matriz de roles
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    // ... existentes
    Permission.NEW_PERMISSION
  ]
}

// 3. Añadir a mapeo de rutas (si aplica)
export const ADMIN_ROUTE_PERMISSIONS = {
  '/admin/new-feature': [Permission.NEW_PERMISSION]
}
```

## 🎉 Beneficios Implementados

### ✅ Funcionalidades Conseguidas

1. **Control granular** - 50+ permisos específicos
2. **Multi-tenancy** - Gestión por comunidades
3. **Seguridad robusta** - JWT + validación estricta
4. **Testing completo** - API dedicada para pruebas
5. **TypeScript estricto** - Tipado completo
6. **Documentación completa** - Guías y ejemplos
7. **Escalabilidad** - Fácil añadir nuevos permisos
8. **Auditoría** - Logging de todas las acciones

### 🚀 Impacto en Producción

- **Reducción de riesgos** de seguridad
- **Control preciso** de acceso
- **Facilidad de mantenimiento**
- **Cumplimiento** de normativas
- **Experiencia de usuario** mejorada

---

## 📞 Soporte

Para dudas sobre el sistema de permisos:
1. Consultar esta documentación
2. Usar la API de testing: `/api/test-permissions`
3. Revisar logs de seguridad
4. Contactar al equipo de desarrollo

**Sistema implementado y listo para producción** ✅