'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { designSystemDefaults, defaultColors, defaultTypography, defaultShadows, defaultRadius, defaultSpacing } from '@/lib/design-system/defaults'
import { Prisma } from '@prisma/client'

// ============================================
// DESIGN TOKENS ACTIONS
// ============================================

export async function getDesignTokens(category?: string) {
  try {
    const where = category ? { category, isActive: true } : { isActive: true }
    const tokens = await prisma.designToken.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    })
    return { success: true, data: tokens }
  } catch (error) {
    console.error('Error fetching design tokens:', error)
    return { success: false, error: 'Error carregant tokens' }
  }
}

export async function getDesignToken(category: string, name: string) {
  try {
    const token = await prisma.designToken.findUnique({
      where: { category_name: { category, name } },
    })
    return { success: true, data: token }
  } catch (error) {
    console.error('Error fetching design token:', error)
    return { success: false, error: 'Error carregant token' }
  }
}

export async function upsertDesignToken(data: {
  category: string
  name: string
  value: string
  cssVariable?: string
  description?: string
  metadata?: Prisma.InputJsonValue
  order?: number
}) {
  try {
    const token = await prisma.designToken.upsert({
      where: { category_name: { category: data.category, name: data.name } },
      update: {
        value: data.value,
        cssVariable: data.cssVariable,
        description: data.description,
        metadata: data.metadata ?? Prisma.JsonNull,
        order: data.order,
        updatedAt: new Date(),
      },
      create: {
        category: data.category,
        name: data.name,
        value: data.value,
        cssVariable: data.cssVariable,
        description: data.description,
        metadata: data.metadata ?? Prisma.JsonNull,
        order: data.order ?? 0,
        isDefault: false,
      },
    })
    revalidatePath('/admin/componentes')
    return { success: true, data: token }
  } catch (error) {
    console.error('Error upserting design token:', error)
    return { success: false, error: 'Error guardant token' }
  }
}

export async function deleteDesignToken(category: string, name: string) {
  try {
    await prisma.designToken.delete({
      where: { category_name: { category, name } },
    })
    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting design token:', error)
    return { success: false, error: 'Error eliminant token' }
  }
}

export async function resetDesignTokensToDefault(category: string) {
  try {
    // Delete all custom tokens for this category
    await prisma.designToken.deleteMany({
      where: { category, isDefault: false },
    })
    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error resetting design tokens:', error)
    return { success: false, error: 'Error restaurant tokens' }
  }
}

// ============================================
// COMPONENT CONFIG ACTIONS
// ============================================

export async function getComponentConfigs(category?: string) {
  try {
    const where = category ? { category, isActive: true } : { isActive: true }
    const configs = await prisma.componentConfig.findMany({
      where,
      orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
    })
    return { success: true, data: configs }
  } catch (error) {
    console.error('Error fetching component configs:', error)
    return { success: false, error: 'Error carregant configuracions' }
  }
}

export async function getComponentConfig(name: string) {
  try {
    const config = await prisma.componentConfig.findUnique({
      where: { name },
    })
    return { success: true, data: config }
  } catch (error) {
    console.error('Error fetching component config:', error)
    return { success: false, error: 'Error carregant configuració' }
  }
}

export async function upsertComponentConfig(data: {
  name: string
  displayName: string
  category: string
  description?: string
  config: Prisma.InputJsonValue
  styles?: Prisma.InputJsonValue
  previewData?: Prisma.InputJsonValue
}) {
  try {
    const existing = await prisma.componentConfig.findUnique({
      where: { name: data.name },
    })

    const config = await prisma.componentConfig.upsert({
      where: { name: data.name },
      update: {
        displayName: data.displayName,
        category: data.category,
        description: data.description,
        config: data.config,
        styles: data.styles ?? Prisma.JsonNull,
        previewData: data.previewData ?? Prisma.JsonNull,
        version: existing ? existing.version + 1 : 1,
        updatedAt: new Date(),
      },
      create: {
        name: data.name,
        displayName: data.displayName,
        category: data.category,
        description: data.description,
        config: data.config,
        styles: data.styles ?? Prisma.JsonNull,
        previewData: data.previewData ?? Prisma.JsonNull,
        version: 1,
      },
    })
    revalidatePath('/admin/componentes')
    return { success: true, data: config }
  } catch (error) {
    console.error('Error upserting component config:', error)
    return { success: false, error: 'Error guardant configuració' }
  }
}

export async function deleteComponentConfig(name: string) {
  try {
    await prisma.componentConfig.delete({
      where: { name },
    })
    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting component config:', error)
    return { success: false, error: 'Error eliminant configuració' }
  }
}

// ============================================
// MENU CONFIG ACTIONS
// ============================================

export async function getMenuConfigs() {
  try {
    const menus = await prisma.menuConfig.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: menus }
  } catch (error) {
    console.error('Error fetching menu configs:', error)
    return { success: false, error: 'Error carregant menús' }
  }
}

export async function getMenuConfig(name: string) {
  try {
    const menu = await prisma.menuConfig.findUnique({
      where: { name },
    })
    return { success: true, data: menu }
  } catch (error) {
    console.error('Error fetching menu config:', error)
    return { success: false, error: 'Error carregant menú' }
  }
}

export async function upsertMenuConfig(data: {
  name: string
  displayName: string
  description?: string
  items: Array<{
    id: string
    label: string
    href: string
    icon?: string
    visible: boolean
    order: number
    children?: Array<{
      id: string
      label: string
      href: string
      icon?: string
      visible: boolean
    }>
  }>
  styles?: Prisma.InputJsonValue
}) {
  try {
    const existing = await prisma.menuConfig.findUnique({
      where: { name: data.name },
    })

    const menu = await prisma.menuConfig.upsert({
      where: { name: data.name },
      update: {
        displayName: data.displayName,
        description: data.description,
        items: data.items as Prisma.InputJsonValue,
        styles: data.styles ?? Prisma.JsonNull,
        version: existing ? existing.version + 1 : 1,
        updatedAt: new Date(),
      },
      create: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        items: data.items as Prisma.InputJsonValue,
        styles: data.styles ?? Prisma.JsonNull,
        version: 1,
      },
    })
    revalidatePath('/admin/componentes')
    return { success: true, data: menu }
  } catch (error) {
    console.error('Error upserting menu config:', error)
    return { success: false, error: 'Error guardant menú' }
  }
}

export async function reorderMenuItems(
  menuName: string,
  items: Array<{ id: string; order: number }>
) {
  try {
    const menu = await prisma.menuConfig.findUnique({
      where: { name: menuName },
    })

    if (!menu) {
      return { success: false, error: 'Menú no trobat' }
    }

    const currentItems = menu.items as Array<{ id: string; order: number; [key: string]: unknown }>
    const reorderedItems = currentItems.map(item => {
      const newOrder = items.find(i => i.id === item.id)
      return newOrder ? { ...item, order: newOrder.order } : item
    }).sort((a, b) => a.order - b.order)

    await prisma.menuConfig.update({
      where: { name: menuName },
      data: {
        items: reorderedItems as Prisma.InputJsonValue,
        version: menu.version + 1,
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error reordering menu items:', error)
    return { success: false, error: 'Error reordenant items' }
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function initializeDesignSystem() {
  try {
    const counts = {
      colors: 0,
      typography: 0,
      shadows: 0,
      radius: 0,
      spacing: 0,
      total: 0
    }

    // Initialize color tokens
    for (const [group, colors] of Object.entries(defaultColors)) {
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i]
        await prisma.designToken.upsert({
          where: { category_name: { category: `colors-${group}`, name: color.name } },
          update: {},
          create: {
            category: `colors-${group}`,
            name: color.name,
            value: color.value,
            cssVariable: color.cssVariable,
            description: color.description,
            isDefault: true,
            order: i,
          },
        })
        counts.colors++
      }
    }

    // Initialize typography tokens
    for (const [group, tokens] of Object.entries(defaultTypography)) {
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        await prisma.designToken.upsert({
          where: { category_name: { category: `typography-${group}`, name: token.name } },
          update: {},
          create: {
            category: `typography-${group}`,
            name: token.name,
            value: JSON.stringify({
              fontFamily: token.fontFamily,
              fontSize: token.fontSize,
              fontWeight: token.fontWeight,
              lineHeight: token.lineHeight,
              letterSpacing: token.letterSpacing,
            }),
            cssVariable: token.cssVariable,
            isDefault: true,
            order: i,
          },
        })
        counts.typography++
      }
    }

    // Initialize shadow tokens
    for (let i = 0; i < defaultShadows.length; i++) {
      const shadow = defaultShadows[i]
      await prisma.designToken.upsert({
        where: { category_name: { category: 'shadows', name: shadow.name } },
        update: {},
        create: {
          category: 'shadows',
          name: shadow.name,
          value: shadow.value,
          cssVariable: shadow.cssVariable,
          isDefault: true,
          order: i,
        },
      })
      counts.shadows++
    }

    // Initialize radius tokens
    for (let i = 0; i < defaultRadius.length; i++) {
      const radius = defaultRadius[i]
      await prisma.designToken.upsert({
        where: { category_name: { category: 'radius', name: radius.name } },
        update: {},
        create: {
          category: 'radius',
          name: radius.name,
          value: radius.value,
          cssVariable: radius.cssVariable,
          isDefault: true,
          order: i,
        },
      })
      counts.radius++
    }

    // Initialize spacing tokens
    for (let i = 0; i < defaultSpacing.length; i++) {
      const spacing = defaultSpacing[i]
      await prisma.designToken.upsert({
        where: { category_name: { category: 'spacing', name: spacing.name } },
        update: {},
        create: {
          category: 'spacing',
          name: spacing.name,
          value: spacing.value,
          cssVariable: spacing.cssVariable,
          isDefault: true,
          order: i,
        },
      })
      counts.spacing++
    }

    counts.total = counts.colors + counts.typography + counts.shadows + counts.radius + counts.spacing

    revalidatePath('/admin/componentes')
    return { success: true, counts }
  } catch (error) {
    console.error('Error initializing design system:', error)
    return { success: false, error: 'Error inicialitzant design system' }
  }
}

export async function exportDesignSystem() {
  try {
    const [tokens, components, menus] = await Promise.all([
      prisma.designToken.findMany({ where: { isActive: true } }),
      prisma.componentConfig.findMany({ where: { isActive: true } }),
      prisma.menuConfig.findMany({ where: { isActive: true } }),
    ])

    return {
      success: true,
      data: {
        tokens,
        components,
        menus,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      },
    }
  } catch (error) {
    console.error('Error exporting design system:', error)
    return { success: false, error: 'Error exportant design system' }
  }
}

export async function generateCSSVariables() {
  try {
    const tokens = await prisma.designToken.findMany({
      where: { isActive: true, cssVariable: { not: null } },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    })

    const cssVariables = tokens
      .filter(t => t.cssVariable)
      .map(t => `  ${t.cssVariable}: ${t.value};`)
      .join('\n')

    const css = `:root {\n${cssVariables}\n}`

    return { success: true, data: css }
  } catch (error) {
    console.error('Error generating CSS variables:', error)
    return { success: false, error: 'Error generant CSS' }
  }
}

// ============================================
// CARD TOKENS ACTIONS
// ============================================

export async function getCardTokens() {
  try {
    const tokens = await prisma.designToken.findMany({
      where: {
        category: 'cards',
        isActive: true
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
    return { success: true, data: tokens }
  } catch (error) {
    console.error('Error fetching card tokens:', error)
    return { success: false, error: 'Error carregant tokens de cards' }
  }
}

export async function updateCardToken(name: string, value: string) {
  try {
    const token = await prisma.designToken.update({
      where: { category_name: { category: 'cards', name } },
      data: {
        value,
        updatedAt: new Date(),
      },
    })
    revalidatePath('/admin/componentes')
    return { success: true, data: token }
  } catch (error) {
    console.error('Error updating card token:', error)
    return { success: false, error: 'Error actualitzant token' }
  }
}

export async function updateCardTokens(tokens: Array<{ name: string; value: string }>) {
  try {
    const results = await Promise.all(
      tokens.map(({ name, value }) =>
        prisma.designToken.update({
          where: { category_name: { category: 'cards', name } },
          data: {
            value,
            updatedAt: new Date(),
          },
        })
      )
    )
    revalidatePath('/admin/componentes')
    return { success: true, data: results, count: results.length }
  } catch (error) {
    console.error('Error updating card tokens:', error)
    return { success: false, error: 'Error actualitzant tokens de cards' }
  }
}

export async function resetCardTokensToDefault() {
  try {
    // Get default values from the sync API constants
    const defaultCardTokens = {
      'card-background': '#ffffff',
      'card-border-color': '#e5e7eb',
      'card-border-radius': '0.75rem',
      'card-shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'card-header-padding': '1.25rem',
      'card-content-padding': '1.25rem',
      'card-footer-padding': '1rem',
      'card-title-color': '#111827',
      'card-description-color': '#6b7280',
    }

    const updates = Object.entries(defaultCardTokens).map(([name, value]) =>
      prisma.designToken.update({
        where: { category_name: { category: 'cards', name } },
        data: { value, updatedAt: new Date() },
      }).catch(() => null) // Ignore if token doesn't exist
    )

    await Promise.all(updates)
    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error resetting card tokens:', error)
    return { success: false, error: 'Error restaurant tokens de cards' }
  }
}
