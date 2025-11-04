/**
 * API Route para Testing de Permisos
 * Permite probar el sistema de permisos granulares
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  UserInfo,
  UserRole,
  Permission,
  hasPermission,
  canAccessAdmin,
  canAccessCommunity,
  getRolePermissions,
  getAccessibleAdminRoutes,
  ROLE_PERMISSIONS
} from '@/lib/permissions';
import {
  withAuth,
  withPermissions,
  withAdminAccess,
  checkPermission,
  filterDataByUserAccess,
  canModifyResource
} from '@/lib/rbac';

// Mock data para testing
const mockUsers: UserInfo[] = [
  {
    id: '1',
    role: UserRole.SUPER_ADMIN,
    email: 'superadmin@lapublica.com',
    isActive: true
  },
  {
    id: '2',
    role: UserRole.ADMIN,
    email: 'admin@lapublica.com',
    isActive: true
  },
  {
    id: '3',
    role: UserRole.COMMUNITY_MANAGER,
    communityId: 'community-1',
    email: 'manager@community1.com',
    isActive: true
  },
  {
    id: '4',
    role: UserRole.MODERATOR,
    communityId: 'community-1',
    email: 'moderator@community1.com',
    isActive: true
  },
  {
    id: '5',
    role: UserRole.USER,
    email: 'user@lapublica.com',
    isActive: true
  },
  {
    id: '6',
    role: UserRole.COMPANY,
    email: 'company@example.com',
    isActive: true
  }
];

const mockCommunities = [
  { id: 'community-1', name: 'Ayuntamiento Barcelona' },
  { id: 'community-2', name: 'Generalitat Catalunya' },
  { id: 'community-3', name: 'Hospital Clínic' }
];

const mockResources = [
  { id: '1', title: 'Post Barcelona', communityId: 'community-1', authorId: '3' },
  { id: '2', title: 'Post Catalunya', communityId: 'community-2', authorId: '2' },
  { id: '3', title: 'Post Global', communityId: 'community-3', authorId: '1' }
];

/**
 * GET /api/test-permissions
 * Obtiene información sobre permisos del usuario actual
 */
export const GET = withAuth(async (user: UserInfo, request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'overview';

  try {
    switch (testType) {
      case 'overview':
        return getPermissionsOverview(user);

      case 'permissions':
        return getPermissionsTest(user);

      case 'routes':
        return getRoutesTest(user);

      case 'communities':
        return getCommunitiesTest(user);

      case 'resources':
        return getResourcesTest(user);

      case 'all-roles':
        return getAllRolesTest();

      default:
        return NextResponse.json(
          { error: 'Tipo de test no válido' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en test de permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/test-permissions
 * Testa permisos específicos con datos mock
 */
export const POST = withAuth(async (user: UserInfo, request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, permission, resourceId, communityId } = body;

    const result: any = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        communityId: user.communityId
      },
      test: action,
      timestamp: new Date().toISOString()
    };

    switch (action) {
      case 'check-permission':
        if (!permission) {
          return NextResponse.json(
            { error: 'Permission parameter required' },
            { status: 400 }
          );
        }
        result.permission = permission;
        result.hasPermission = hasPermission(user, permission);
        break;

      case 'check-community-access':
        if (!communityId) {
          return NextResponse.json(
            { error: 'communityId parameter required' },
            { status: 400 }
          );
        }
        result.communityId = communityId;
        result.canAccess = canAccessCommunity(user, communityId);
        break;

      case 'check-resource-modification':
        if (!resourceId) {
          return NextResponse.json(
            { error: 'resourceId parameter required' },
            { status: 400 }
          );
        }
        const resource = mockResources.find(r => r.id === resourceId);
        if (!resource) {
          return NextResponse.json(
            { error: 'Resource not found' },
            { status: 404 }
          );
        }
        result.resource = resource;
        result.canModify = canModifyResource(user, resource);
        break;

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en POST test de permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

// Helper functions para diferentes tipos de tests

function getPermissionsOverview(user: UserInfo) {
  const overview = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      communityId: user.communityId,
      isActive: user.isActive
    },
    access: {
      canAccessAdmin: canAccessAdmin(user),
      totalPermissions: getRolePermissions(user.role).length,
      accessibleRoutes: getAccessibleAdminRoutes(user).length
    },
    permissions: getRolePermissions(user.role),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(overview);
}

function getPermissionsTest(user: UserInfo) {
  const permissionsTest = Object.values(Permission).map(permission => ({
    permission,
    hasPermission: hasPermission(user, permission)
  }));

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
    permissionsTest,
    summary: {
      total: permissionsTest.length,
      granted: permissionsTest.filter(p => p.hasPermission).length,
      denied: permissionsTest.filter(p => !p.hasPermission).length
    }
  });
}

function getRoutesTest(user: UserInfo) {
  const accessibleRoutes = getAccessibleAdminRoutes(user);

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
    accessibleRoutes,
    totalRoutes: accessibleRoutes.length,
    canAccessAdmin: canAccessAdmin(user)
  });
}

function getCommunitiesTest(user: UserInfo) {
  const communitiesAccess = mockCommunities.map(community => ({
    ...community,
    canAccess: canAccessCommunity(user, community.id)
  }));

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role, communityId: user.communityId },
    communities: communitiesAccess,
    accessibleCommunities: communitiesAccess.filter(c => c.canAccess)
  });
}

function getResourcesTest(user: UserInfo) {
  const resourcesAccess = mockResources.map(resource => ({
    ...resource,
    canView: true, // Todos pueden ver por defecto
    canModify: canModifyResource(user, resource)
  }));

  const filteredResources = filterDataByUserAccess(mockResources, user);

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role, communityId: user.communityId },
    allResources: resourcesAccess,
    filteredResources: filteredResources,
    summary: {
      total: mockResources.length,
      canView: filteredResources.length,
      canModify: resourcesAccess.filter(r => r.canModify).length
    }
  });
}

function getAllRolesTest() {
  const rolesAnalysis = Object.values(UserRole).map(role => {
    const permissions = getRolePermissions(role);
    const mockUser: UserInfo = {
      id: 'mock',
      role,
      email: `mock@${role.toLowerCase()}.com`,
      communityId: role === UserRole.COMMUNITY_MANAGER || role === UserRole.MODERATOR ? 'community-1' : undefined,
      isActive: true
    };

    return {
      role,
      permissions: permissions.length,
      canAccessAdmin: canAccessAdmin(mockUser),
      accessibleRoutes: getAccessibleAdminRoutes(mockUser).length,
      permissionsList: permissions
    };
  });

  return NextResponse.json({
    roles: rolesAnalysis,
    summary: {
      totalRoles: rolesAnalysis.length,
      adminRoles: rolesAnalysis.filter(r => r.canAccessAdmin).length,
      userRoles: rolesAnalysis.filter(r => !r.canAccessAdmin).length
    },
    permissionsMatrix: ROLE_PERMISSIONS
  });
}

/**
 * PUT /api/test-permissions
 * Test de decoradores y wrappers
 */
export const PUT = withPermissions([Permission.MANAGE_PLATFORM_SETTINGS])(
  async (user: UserInfo, request: NextRequest) => {
    return NextResponse.json({
      message: 'Test de decorador @withPermissions exitoso',
      user: { id: user.id, email: user.email, role: user.role },
      requiredPermission: Permission.MANAGE_PLATFORM_SETTINGS,
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * DELETE /api/test-permissions
 * Test de acceso de super admin
 */
export const DELETE = withPermissions([Permission.FULL_ACCESS])(
  async (user: UserInfo, request: NextRequest) => {
    return NextResponse.json({
      message: 'Test de acceso SUPER_ADMIN exitoso',
      user: { id: user.id, email: user.email, role: user.role },
      requiredPermission: Permission.FULL_ACCESS,
      timestamp: new Date().toISOString()
    });
  }
);