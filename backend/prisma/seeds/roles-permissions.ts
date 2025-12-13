import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Definició de categories
const PERMISSION_CATEGORIES = [
    { name: 'users', label: 'Usuaris', icon: 'Users', order: 1 },
    { name: 'companies', label: 'Empreses', icon: 'Building2', order: 2 },
    { name: 'administrations', label: 'Administracions', icon: 'Landmark', order: 3 },
    { name: 'leads', label: 'Leads i CRM', icon: 'Users', order: 4 },
    { name: 'offers', label: 'Ofertes', icon: 'Tag', order: 5 },
    { name: 'content', label: 'Contingut', icon: 'FileText', order: 6 },
    { name: 'communication', label: 'Comunicació', icon: 'Megaphone', order: 7 },
    { name: 'system', label: 'Sistema', icon: 'Settings', order: 8 },
]

// Definició de permisos per categoria
const PERMISSIONS: Record<string, { key: string; label: string; description: string; order: number }[]> = {
    users: [
        { key: 'MANAGE_USERS', label: 'Gestionar usuaris', description: 'Crear, editar i eliminar usuaris', order: 1 },
        { key: 'MANAGE_ROLES', label: 'Gestionar rols', description: 'Crear i assignar rols', order: 2 },
        { key: 'MANAGE_PERMISSIONS', label: 'Gestionar permisos', description: 'Modificar permisos per rol', order: 3 },
        { key: 'IMPERSONATE_USER', label: 'Suplantar usuari', description: 'Accedir com un altre usuari', order: 4 },
    ],
    companies: [
        { key: 'MANAGE_COMPANIES', label: 'Gestionar empreses', description: 'Crear, editar i eliminar empreses', order: 1 },
        { key: 'APPROVE_COMPANIES', label: 'Aprovar empreses', description: 'Verificar i aprovar noves empreses', order: 2 },
        { key: 'MANAGE_SUBSCRIPTIONS', label: 'Gestionar subscripcions', description: 'Modificar plans i facturació', order: 3 },
        { key: 'VIEW_COMPANY_STATS', label: 'Veure estadístiques empresa', description: 'Accedir a mètriques pròpies', order: 4 },
        { key: 'MANAGE_COMPANY_PROFILE', label: 'Gestionar perfil empresa', description: 'Editar perfil propi', order: 5 },
        { key: 'MANAGE_COMPANY_TEAM', label: 'Gestionar equip empresa', description: 'Afegir membres a l\'equip', order: 6 },
    ],
    administrations: [
        { key: 'MANAGE_COMMUNITIES', label: 'Gestionar comunitats', description: 'Crear i editar comunitats', order: 1 },
        { key: 'MANAGE_ADMINS', label: 'Gestionar administracions', description: 'Configurar administracions públiques', order: 2 },
        { key: 'VIEW_COMMUNITY_STATS', label: 'Veure estadístiques comunitat', description: 'Accedir a mètriques de la comunitat', order: 3 },
        { key: 'MANAGE_COMMUNITY_PROFILE', label: 'Gestionar perfil comunitat', description: 'Editar perfil de la comunitat', order: 4 },
        { key: 'MANAGE_EMPLOYEES', label: 'Gestionar empleats', description: 'Administrar empleats de la comunitat', order: 5 },
    ],
    leads: [
        { key: 'VIEW_LEADS', label: 'Veure leads', description: 'Accedir al llistat de leads', order: 1 },
        { key: 'MANAGE_LEADS', label: 'Gestionar leads', description: 'Crear, editar i assignar leads', order: 2 },
        { key: 'VIEW_PIPELINE', label: 'Veure pipeline', description: 'Accedir al pipeline comercial', order: 3 },
        { key: 'MANAGE_TASKS', label: 'Gestionar tasques', description: 'Crear i assignar tasques', order: 4 },
    ],
    offers: [
        { key: 'VIEW_OFFERS', label: 'Veure ofertes', description: 'Accedir al llistat d\'ofertes', order: 1 },
        { key: 'MANAGE_OFFERS', label: 'Gestionar ofertes', description: 'Crear i editar ofertes', order: 2 },
        { key: 'APPROVE_OFFERS', label: 'Aprovar ofertes', description: 'Verificar i publicar ofertes', order: 3 },
        { key: 'FEATURE_OFFERS', label: 'Destacar ofertes', description: 'Marcar ofertes com a destacades', order: 4 },
    ],
    content: [
        { key: 'CREATE_CONTENT', label: 'Crear contingut', description: 'Crear articles i publicacions', order: 1 },
        { key: 'EDIT_CONTENT', label: 'Editar contingut', description: 'Modificar contingut existent', order: 2 },
        { key: 'PUBLISH_CONTENT', label: 'Publicar contingut', description: 'Aprovar i publicar contingut', order: 3 },
        { key: 'MODERATE_CONTENT', label: 'Moderar contingut', description: 'Revisar i eliminar contingut', order: 4 },
    ],
    communication: [
        { key: 'CREATE_ANNOUNCEMENT', label: 'Crear anuncis', description: 'Crear anuncis del sistema', order: 1 },
        { key: 'SEND_NOTIFICATIONS', label: 'Enviar notificacions', description: 'Enviar notificacions push i email', order: 2 },
        { key: 'MANAGE_CAMPAIGNS', label: 'Gestionar campanyes', description: 'Crear i gestionar campanyes', order: 3 },
    ],
    system: [
        { key: 'VIEW_ADMIN_DASHBOARD', label: 'Veure dashboard admin', description: 'Accedir al panell d\'administració', order: 1 },
        { key: 'MANAGE_SYSTEM_CONFIG', label: 'Configuració sistema', description: 'Modificar configuració global', order: 2 },
        { key: 'VIEW_AUDIT_LOGS', label: 'Veure logs', description: 'Accedir als registres d\'auditoria', order: 3 },
        { key: 'MANAGE_AI_CONFIG', label: 'Configurar IA', description: 'Gestionar proveïdors i models IA', order: 4 },
    ],
}

// Definició de rols del sistema
const SYSTEM_ROLES = [
    {
        name: 'SUPER_ADMIN',
        label: 'Super Admin',
        description: 'Accés total al sistema. Pot gestionar altres administradors i configuració crítica.',
        color: 'red',
        icon: 'Shield',
        dashboard: '/admin/',
        permissions: ['*'], // Tots els permisos
    },
    {
        name: 'ADMIN',
        label: 'Admin',
        description: 'Administrador del sistema amb accés al panell /admin/.',
        color: 'red',
        icon: 'Shield',
        dashboard: '/admin/',
        permissions: [
            'MANAGE_USERS', 'MANAGE_ROLES',
            'MANAGE_COMPANIES', 'APPROVE_COMPANIES', 'MANAGE_SUBSCRIPTIONS',
            'MANAGE_COMMUNITIES', 'MANAGE_ADMINS',
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'VIEW_OFFERS', 'MANAGE_OFFERS', 'APPROVE_OFFERS', 'FEATURE_OFFERS',
            'CREATE_CONTENT', 'EDIT_CONTENT', 'PUBLISH_CONTENT', 'MODERATE_CONTENT',
            'CREATE_ANNOUNCEMENT', 'SEND_NOTIFICATIONS', 'MANAGE_CAMPAIGNS',
            'VIEW_ADMIN_DASHBOARD', 'VIEW_AUDIT_LOGS',
        ],
    },
    {
        name: 'ADMIN_GESTIO',
        label: 'Admin Gestió',
        description: 'Administrador del dashboard CRM /gestio/. Supervisa l\'equip comercial.',
        color: 'orange',
        icon: 'UserCog',
        dashboard: '/gestio/',
        permissions: [
            'MANAGE_USERS',
            'MANAGE_COMPANIES', 'APPROVE_COMPANIES',
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'VIEW_OFFERS', 'MANAGE_OFFERS', 'APPROVE_OFFERS',
            'CREATE_CONTENT', 'EDIT_CONTENT', 'PUBLISH_CONTENT',
            'CREATE_ANNOUNCEMENT', 'SEND_NOTIFICATIONS',
            'VIEW_ADMIN_DASHBOARD',
        ],
    },
    {
        name: 'ADMIN_ADMINISTRACIONS',
        label: 'Admin Administracions',
        description: 'Gestiona comunitats i administracions públiques.',
        color: 'emerald',
        icon: 'Landmark',
        dashboard: '/admin/',
        permissions: [
            'MANAGE_COMMUNITIES', 'MANAGE_ADMINS', 'VIEW_COMMUNITY_STATS', 'MANAGE_COMMUNITY_PROFILE', 'MANAGE_EMPLOYEES',
            'CREATE_ANNOUNCEMENT', 'SEND_NOTIFICATIONS',
            'VIEW_ADMIN_DASHBOARD',
        ],
    },
    {
        name: 'CRM_COMERCIAL',
        label: 'CRM Comercial',
        description: 'Gestiona leads, pipeline comercial i empreses.',
        color: 'purple',
        icon: 'Users',
        dashboard: '/gestio/',
        permissions: [
            'MANAGE_COMPANIES', 'APPROVE_COMPANIES',
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'VIEW_OFFERS', 'MANAGE_OFFERS', 'APPROVE_OFFERS',
        ],
    },
    {
        name: 'CRM_CONTINGUT',
        label: 'CRM Contingut',
        description: 'Gestiona contingut, comunicació i campanyes.',
        color: 'indigo',
        icon: 'FileText',
        dashboard: '/gestio/',
        permissions: [
            'CREATE_CONTENT', 'EDIT_CONTENT', 'PUBLISH_CONTENT', 'MODERATE_CONTENT',
            'CREATE_ANNOUNCEMENT', 'SEND_NOTIFICATIONS', 'MANAGE_CAMPAIGNS',
        ],
    },
    {
        name: 'CRM_ADMINISTRACIONS',
        label: 'CRM Administracions',
        description: 'Gestiona relacions amb administracions públiques.',
        color: 'green',
        icon: 'Landmark',
        dashboard: '/gestio/',
        permissions: [
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'MANAGE_COMMUNITIES', 'VIEW_COMMUNITY_STATS',
            'CREATE_ANNOUNCEMENT', 'SEND_NOTIFICATIONS',
        ],
    },
    {
        name: 'GESTOR_ESTANDARD',
        label: 'Gestor Estàndard',
        description: 'Gestor comercial per empreses amb pla bàsic.',
        color: 'blue',
        icon: 'Users',
        dashboard: '/gestio/',
        permissions: [
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'MANAGE_COMPANIES',
            'VIEW_OFFERS',
        ],
    },
    {
        name: 'GESTOR_ESTRATEGIC',
        label: 'Gestor Estratègic',
        description: 'Gestor comercial per empreses amb pla estratègic.',
        color: 'cyan',
        icon: 'Users',
        dashboard: '/gestio/',
        permissions: [
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'MANAGE_COMPANIES',
            'VIEW_OFFERS', 'MANAGE_OFFERS',
        ],
    },
    {
        name: 'GESTOR_ENTERPRISE',
        label: 'Gestor Enterprise',
        description: 'Gestor comercial per comptes enterprise i grans clients.',
        color: 'teal',
        icon: 'Users',
        dashboard: '/gestio/',
        permissions: [
            'VIEW_LEADS', 'MANAGE_LEADS', 'VIEW_PIPELINE', 'MANAGE_TASKS',
            'MANAGE_COMPANIES', 'APPROVE_COMPANIES',
            'VIEW_OFFERS', 'MANAGE_OFFERS',
        ],
    },
    {
        name: 'MODERATOR',
        label: 'Moderador',
        description: 'Modera contingut de la comunitat i fòrums.',
        color: 'amber',
        icon: 'MessageSquare',
        dashboard: null,
        permissions: [
            'MODERATE_CONTENT',
            'VIEW_OFFERS',
        ],
    },
    {
        name: 'COMPANY',
        label: 'Empresa',
        description: 'Usuari d\'empresa col·laboradora. Gestiona ofertes i perfil de l\'empresa.',
        color: 'indigo',
        icon: 'Building2',
        dashboard: '/empresa/',
        permissions: [
            'VIEW_OFFERS', 'MANAGE_OFFERS',
            'VIEW_COMPANY_STATS', 'MANAGE_COMPANY_PROFILE', 'MANAGE_COMPANY_TEAM',
        ],
    },
    {
        name: 'ADMINISTRATION',
        label: 'Administració Pública',
        description: 'Usuari d\'administració pública. Gestiona comunitat, empleats i comunicacions.',
        color: 'emerald',
        icon: 'Landmark',
        dashboard: '/administracio/',
        permissions: [
            'VIEW_COMMUNITY_STATS', 'MANAGE_COMMUNITY_PROFILE', 'MANAGE_EMPLOYEES',
            'CREATE_ANNOUNCEMENT',
            'VIEW_OFFERS',
        ],
    },
    {
        name: 'USER',
        label: 'Empleat Públic',
        description: 'Usuari final. Funcionari o empleat d\'administració pública.',
        color: 'slate',
        icon: 'Users',
        dashboard: '/',
        permissions: [
            'VIEW_OFFERS',
        ],
    },
]

async function seedRolesAndPermissions() {
    console.log('🌱 Creant categories de permisos...')

    // Crear categories
    for (const category of PERMISSION_CATEGORIES) {
        await prisma.permissionCategory.upsert({
            where: { name: category.name },
            update: { label: category.label, icon: category.icon, order: category.order },
            create: category,
        })
    }

    console.log('🌱 Creant permisos...')

    // Crear permisos
    const allPermissionKeys: string[] = []
    for (const [categoryName, permissions] of Object.entries(PERMISSIONS)) {
        const category = await prisma.permissionCategory.findUnique({
            where: { name: categoryName },
        })

        if (!category) continue

        for (const perm of permissions) {
            await prisma.permission.upsert({
                where: { key: perm.key },
                update: {
                    label: perm.label,
                    description: perm.description,
                    categoryId: category.id,
                    order: perm.order,
                },
                create: {
                    key: perm.key,
                    label: perm.label,
                    description: perm.description,
                    categoryId: category.id,
                    order: perm.order,
                },
            })
            allPermissionKeys.push(perm.key)
        }
    }

    console.log('🌱 Creant rols del sistema...')

    // Crear rols
    for (const roleData of SYSTEM_ROLES) {
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: {
                label: roleData.label,
                description: roleData.description,
                color: roleData.color,
                icon: roleData.icon,
                dashboard: roleData.dashboard,
                isSystem: true,
            },
            create: {
                name: roleData.name,
                label: roleData.label,
                description: roleData.description,
                color: roleData.color,
                icon: roleData.icon,
                dashboard: roleData.dashboard,
                isSystem: true,
            },
        })

        // Assignar permisos
        const permissionKeys = roleData.permissions.includes('*')
            ? allPermissionKeys
            : roleData.permissions

        for (const permKey of permissionKeys) {
            const permission = await prisma.permission.findUnique({
                where: { key: permKey },
            })

            if (permission) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: permission.id,
                    },
                })
            }
        }
    }

    console.log('✅ Rols i permisos creats correctament!')
}

export { seedRolesAndPermissions }
