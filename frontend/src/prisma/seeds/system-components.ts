import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Components del sistema que suporten categorització
const SYSTEM_COMPONENTS = [
    {
        code: 'OFFERS',
        name: 'Oferta',
        namePlural: 'Ofertes',
        description: 'Ofertes i descomptes per a empleats públics',
        icon: 'Tag',
        color: 'blue',
        supportsCategorization: true,
        isCore: true,
    },
    {
        code: 'COMPANIES',
        name: 'Empresa',
        namePlural: 'Empreses',
        description: 'Empreses col·laboradores de la plataforma',
        icon: 'Building2',
        color: 'indigo',
        supportsCategorization: true,
        isCore: true,
    },
    {
        code: 'FORUMS',
        name: 'Fòrum',
        namePlural: 'Fòrums',
        description: 'Fòrums de discussió de la comunitat',
        icon: 'MessageSquare',
        color: 'purple',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'BLOGS',
        name: 'Article',
        namePlural: 'Blog',
        description: 'Articles i publicacions del blog',
        icon: 'FileText',
        color: 'green',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'ANNOUNCEMENTS',
        name: 'Anunci',
        namePlural: 'Anuncis',
        description: 'Anuncis i comunicacions oficials',
        icon: 'Megaphone',
        color: 'amber',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'GROUPS',
        name: 'Grup',
        namePlural: 'Grups',
        description: 'Grups de la comunitat',
        icon: 'Users',
        color: 'teal',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'EVENTS',
        name: 'Esdeveniment',
        namePlural: 'Esdeveniments',
        description: 'Esdeveniments i activitats',
        icon: 'Calendar',
        color: 'pink',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'RESOURCES',
        name: 'Recurs',
        namePlural: 'Recursos',
        description: 'Recursos i documents compartits',
        icon: 'FolderOpen',
        color: 'orange',
        supportsCategorization: true,
        isCore: false,
    },
    {
        code: 'ADMINISTRATIONS',
        name: 'Administració',
        namePlural: 'Administracions',
        description: 'Administracions públiques i comunitats',
        icon: 'Landmark',
        color: 'emerald',
        supportsCategorization: true,
        isCore: true,
    },
]

// Scope inicial: Empreses i Ofertes (compartit)
const INITIAL_SCOPES = [
    {
        name: 'empreses-ofertes',
        label: 'Empreses i Ofertes',
        description: 'Categories compartides entre empreses i ofertes',
        icon: 'ShoppingBag',
        color: 'blue',
        isSystem: true,
        components: ['OFFERS', 'COMPANIES'],
    },
]

export async function seedSystemComponents() {
    console.log('🌱 Creant components del sistema...')

    // Crear components
    for (const component of SYSTEM_COMPONENTS) {
        await prisma.systemComponent.upsert({
            where: { code: component.code },
            update: {
                name: component.name,
                namePlural: component.namePlural,
                description: component.description,
                icon: component.icon,
                color: component.color,
                supportsCategorization: component.supportsCategorization,
                isCore: component.isCore,
            },
            create: {
                code: component.code,
                name: component.name,
                namePlural: component.namePlural,
                description: component.description,
                icon: component.icon,
                color: component.color,
                supportsCategorization: component.supportsCategorization,
                isCore: component.isCore,
                isActive: true,
            },
        })
        console.log(`  ✓ Component: ${component.code}`)
    }

    console.log('🌱 Creant scopes inicials...')

    // Crear scopes inicials
    for (const scopeData of INITIAL_SCOPES) {
        const { components, ...scopeFields } = scopeData

        // Crear o actualitzar scope
        const scope = await prisma.categoryScope.upsert({
            where: { name: scopeFields.name },
            update: {
                label: scopeFields.label,
                description: scopeFields.description,
                icon: scopeFields.icon,
                color: scopeFields.color,
                isSystem: scopeFields.isSystem,
            },
            create: {
                ...scopeFields,
                order: 0,
                isActive: true,
            },
        })

        // Associar components
        for (const componentCode of components) {
            const component = await prisma.systemComponent.findUnique({
                where: { code: componentCode },
            })

            if (component) {
                await prisma.categoryScopeComponent.upsert({
                    where: {
                        scopeId_componentId: {
                            scopeId: scope.id,
                            componentId: component.id,
                        },
                    },
                    update: {},
                    create: {
                        scopeId: scope.id,
                        componentId: component.id,
                    },
                })
            }
        }

        console.log(`  ✓ Scope: ${scopeData.label} (${components.join(', ')})`)
    }

    console.log('✅ Components i scopes creats!')
}

// Executar si s'executa directament
if (require.main === module) {
    seedSystemComponents()
        .then(() => prisma.$disconnect())
        .catch((e) => {
            console.error(e)
            prisma.$disconnect()
            process.exit(1)
        })
}
