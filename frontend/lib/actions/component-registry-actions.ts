'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface RegisterComponentInput {
  name: string
  displayName: string
  description?: string
  filePath: string
  usedIn: string[]
  category: string
  section: string
  editableProps: Record<string, string>
  tags?: string[]
  dependencies?: string[]
  thumbnail?: string
}

export interface UpdateComponentPropsInput {
  componentId: string
  props: Record<string, string>
}

// ============================================
// GET OPERATIONS
// ============================================

export async function getRegisteredComponents(filters?: {
  category?: string
  section?: string
  search?: string
}) {
  try {
    const where: Prisma.ComponentRegistryWhereInput = {
      isActive: true,
    }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.section) {
      where.section = filters.section
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const components = await prisma.componentRegistry.findMany({
      where,
      orderBy: [{ section: 'asc' }, { category: 'asc' }, { displayName: 'asc' }],
    })

    return { success: true, data: components }
  } catch (error) {
    console.error('Error fetching registered components:', error)
    return { success: false, error: 'Error carregant components' }
  }
}

export async function getComponentByName(name: string) {
  try {
    const component = await prisma.componentRegistry.findUnique({
      where: { name },
    })
    return { success: true, data: component }
  } catch (error) {
    console.error('Error fetching component:', error)
    return { success: false, error: 'Error carregant component' }
  }
}

export async function getComponentById(id: string) {
  try {
    const component = await prisma.componentRegistry.findUnique({
      where: { id },
    })
    return { success: true, data: component }
  } catch (error) {
    console.error('Error fetching component:', error)
    return { success: false, error: 'Error carregant component' }
  }
}

export async function getComponentCategories() {
  try {
    const components = await prisma.componentRegistry.findMany({
      where: { isActive: true },
      select: { category: true, section: true },
    })

    const categories = [...new Set(components.map(c => c.category))]
    const sections = [...new Set(components.map(c => c.section))]

    return { success: true, data: { categories, sections } }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Error carregant categories' }
  }
}

// ============================================
// CREATE/UPDATE OPERATIONS
// ============================================

export async function registerComponent(data: RegisterComponentInput) {
  try {
    const component = await prisma.componentRegistry.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        filePath: data.filePath,
        usedIn: data.usedIn,
        category: data.category,
        section: data.section,
        editableProps: data.editableProps,
        defaultProps: data.editableProps, // Same as initial editableProps
        tags: data.tags || [],
        dependencies: data.dependencies || [],
        thumbnail: data.thumbnail,
      },
    })

    // Also create DesignTokens for the component's props
    for (const [key, value] of Object.entries(data.editableProps)) {
      await prisma.designToken.upsert({
        where: {
          category_name: {
            category: 'components',
            name: `${data.name}-${key}`,
          },
        },
        update: { value },
        create: {
          category: 'components',
          name: `${data.name}-${key}`,
          value,
          cssVariable: `--${data.name}-${key}`,
          description: `${data.displayName} - ${key}`,
        },
      })
    }

    revalidatePath('/admin/componentes')
    return { success: true, data: component }
  } catch (error) {
    console.error('Error registering component:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'Ja existeix un component amb aquest nom' }
      }
    }
    return { success: false, error: 'Error registrant component' }
  }
}

export async function updateComponent(
  id: string,
  data: Partial<RegisterComponentInput>
) {
  try {
    const existing = await prisma.componentRegistry.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: 'Component no trobat' }
    }

    const component = await prisma.componentRegistry.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        filePath: data.filePath,
        usedIn: data.usedIn,
        category: data.category,
        section: data.section,
        tags: data.tags,
        dependencies: data.dependencies,
        thumbnail: data.thumbnail,
        version: existing.version + 1,
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/componentes')
    return { success: true, data: component }
  } catch (error) {
    console.error('Error updating component:', error)
    return { success: false, error: 'Error actualitzant component' }
  }
}

export async function updateComponentProps(
  componentId: string,
  props: Record<string, string>
) {
  try {
    const existing = await prisma.componentRegistry.findUnique({
      where: { id: componentId },
    })

    if (!existing) {
      return { success: false, error: 'Component no trobat' }
    }

    // Update the component
    const component = await prisma.componentRegistry.update({
      where: { id: componentId },
      data: {
        editableProps: props,
        version: existing.version + 1,
        updatedAt: new Date(),
      },
    })

    // Update corresponding DesignTokens
    for (const [key, value] of Object.entries(props)) {
      await prisma.designToken.upsert({
        where: {
          category_name: {
            category: 'components',
            name: `${existing.name}-${key}`,
          },
        },
        update: {
          value,
          updatedAt: new Date(),
        },
        create: {
          category: 'components',
          name: `${existing.name}-${key}`,
          value,
          cssVariable: `--${existing.name}-${key}`,
          description: `${existing.displayName} - ${key}`,
        },
      })
    }

    revalidatePath('/admin/componentes')
    return { success: true, data: component }
  } catch (error) {
    console.error('Error updating component props:', error)
    return { success: false, error: 'Error actualitzant propietats' }
  }
}

export async function resetComponentProps(componentId: string) {
  try {
    const existing = await prisma.componentRegistry.findUnique({
      where: { id: componentId },
    })

    if (!existing) {
      return { success: false, error: 'Component no trobat' }
    }

    // Reset to default props
    const component = await prisma.componentRegistry.update({
      where: { id: componentId },
      data: {
        editableProps: existing.defaultProps as Record<string, string>,
        version: existing.version + 1,
        updatedAt: new Date(),
      },
    })

    // Update DesignTokens to default values
    const defaultProps = existing.defaultProps as Record<string, string>
    for (const [key, value] of Object.entries(defaultProps)) {
      await prisma.designToken.update({
        where: {
          category_name: {
            category: 'components',
            name: `${existing.name}-${key}`,
          },
        },
        data: {
          value,
          updatedAt: new Date(),
        },
      }).catch(() => null) // Ignore if doesn't exist
    }

    revalidatePath('/admin/componentes')
    return { success: true, data: component }
  } catch (error) {
    console.error('Error resetting component props:', error)
    return { success: false, error: 'Error restaurant propietats' }
  }
}

// ============================================
// DELETE OPERATIONS
// ============================================

export async function deleteComponent(id: string) {
  try {
    // Soft delete - just mark as inactive
    await prisma.componentRegistry.update({
      where: { id },
      data: { isActive: false },
    })

    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting component:', error)
    return { success: false, error: 'Error eliminant component' }
  }
}

export async function permanentlyDeleteComponent(id: string) {
  try {
    const component = await prisma.componentRegistry.findUnique({
      where: { id },
    })

    if (component) {
      // Delete associated DesignTokens
      await prisma.designToken.deleteMany({
        where: {
          category: 'components',
          name: { startsWith: `${component.name}-` },
        },
      })
    }

    await prisma.componentRegistry.delete({
      where: { id },
    })

    revalidatePath('/admin/componentes')
    return { success: true }
  } catch (error) {
    console.error('Error permanently deleting component:', error)
    return { success: false, error: 'Error eliminant component' }
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function registerInitialComponents(): Promise<
  { success: true; data: { registered: number; errors: number; total: number } } |
  { success: false; error: string }
> {
  try {
  const initialComponents: RegisterComponentInput[] = [
    {
      name: 'CompanyCard',
      displayName: "Targeta d'Empresa",
      description: "Mostra informació bàsica d'una empresa al llistat",
      filePath: 'components/ui/CompanyCard.tsx',
      usedIn: ['/dashboard/empreses', '/gestio/empreses'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'empresa', 'llistat'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        shadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        padding: '20px',
        'title-color': '#2c3e50',
        'text-color': '#6b7280',
        'description-color': '#6c757d',
        'sector-color': '#3b82f6',
        'rating-color': '#fbbf24',
        'badge-background': '#f3f4f6',
        'badge-color': '#6b7280',
        'logo-size': '80px',
        'cover-height': '120px',
      },
    },
    {
      name: 'OfferCard',
      displayName: "Targeta d'Oferta",
      description: 'Mostra una oferta amb preu i descompte',
      filePath: 'components/ui/OfferCard.tsx',
      usedIn: ['/empresa/ofertes'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'oferta', 'descompte'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '12px',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.15)',
        'hover-border-color': '#3b82f6',
        padding: '16px',
        'title-color': '#111827',
        'text-color': '#6b7280',
        'category-color': '#3b82f6',
        'description-color': '#4b5563',
        'price-color': '#111827',
        'original-price-color': '#9ca3af',
        'discount-background': '#dcfce7',
        'discount-color': '#166534',
        'cover-height': '160px',
        'badge-background': '#dbeafe',
        'badge-color': '#1e40af',
      },
    },
    {
      name: 'MemberCard',
      displayName: 'Targeta de Membre',
      description: "Mostra perfil d'un membre amb avatar i stats",
      filePath: 'components/ui/MemberCard.tsx',
      usedIn: ['/dashboard/membres'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'membre', 'usuari', 'perfil'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        'border-radius-list': '12px',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'hover-shadow': '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 0 0 2px #818cf8',
        'hover-border-color': '#818cf8',
        'hover-background': '#f9fafb',
        padding: '16px',
        'cover-height': '112px',
        'avatar-size': '88px',
        'avatar-size-list': '56px',
        'avatar-gradient': 'linear-gradient(135deg, #6366f1, #a855f7)',
        'title-color': '#111827',
        'text-color': '#6b7280',
        'description-color': '#4b5563',
        'stats-value-color': '#111827',
        'online-color': '#22c55e',
        'overlay-gradient': 'linear-gradient(to bottom, rgba(79, 70, 229, 0.95), rgba(109, 40, 217, 0.95))',
        'primary-button-bg': '#4f46e5',
        'primary-button-color': '#ffffff',
        'secondary-button-bg': '#f3f4f6',
        'secondary-button-color': '#374151',
        'danger-button-bg': '#fef2f2',
        'danger-button-color': '#dc2626',
        'warning-button-bg': '#fef3c7',
        'warning-button-color': '#b45309',
        'success-button-bg': '#16a34a',
        'success-button-color': '#ffffff',
      },
    },
    {
      name: 'GroupCard',
      displayName: 'Targeta de Grup',
      description: "Mostra informació d'un grup professional",
      filePath: 'components/ui/GroupCard.tsx',
      usedIn: ['/dashboard/grups'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'grup', 'comunitat'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '12px',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'hover-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'hover-background': '#f9fafb',
        padding: '16px',
        'header-height': '128px',
        'badge-background': '#dbeafe',
        'badge-color': '#1e40af',
      },
    },
    {
      name: 'StatCard',
      displayName: "Targeta d'Estadístiques",
      description: 'Mostra un KPI amb icona i tendència',
      filePath: 'components/ui/StatCard.tsx',
      usedIn: ['/dashboard', '/gestio', '/admin', '/empresa/dashboard'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'estadística', 'kpi', 'mètrica'],
      editableProps: {
        background: '#ffffff',
        'border-radius': '8px',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        padding: '16px',
        'title-size': '14px',
        'title-color': '#4b5563',
        'value-size': '1.5rem',
        'value-weight': '700',
        'value-color': '#111827',
        'subtitle-color': '#6b7280',
        'trend-up-color': '#16a34a',
        'trend-down-color': '#dc2626',
        'badge-background': '#dbeafe',
        'badge-color': '#1e40af',
      },
    },
    {
      name: 'LeadCard',
      displayName: 'Targeta de Lead',
      description: 'Mostra un lead del pipeline comercial amb drag&drop',
      filePath: 'components/gestio-empreses/commercial-pipeline/LeadCard.tsx',
      usedIn: ['/admin/empreses-pendents'],
      category: 'cards',
      section: 'gestio',
      tags: ['card', 'lead', 'crm', 'pipeline', 'drag-drop'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '8px',
        shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        padding: '12px',
        'priority-high-color': '#dc2626',
        'priority-medium-color': '#f59e0b',
        'priority-low-color': '#22c55e',
      },
    },
    {
      name: 'InvoiceCard',
      displayName: 'Targeta de Factura',
      description: 'Mostra resum de factura amb estat de pagament',
      filePath: 'components/gestio-empreses/facturacio/InvoiceCard.tsx',
      usedIn: ['/gestio/admin/facturacio'],
      category: 'cards',
      section: 'gestio',
      tags: ['card', 'factura', 'pagament'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '12px',
        padding: '16px',
        'status-paid-background': '#dcfce7',
        'status-paid-color': '#166534',
        'status-pending-background': '#fef3c7',
        'status-pending-color': '#92400e',
        'status-overdue-background': '#fee2e2',
        'status-overdue-color': '#991b1b',
      },
    },
    {
      name: 'PlanCard',
      displayName: 'Targeta de Pla',
      description: 'Mostra un pla de subscripció amb preu i features',
      filePath: 'components/plans/PlanCard.tsx',
      usedIn: ['/empresa/plans', '/gestio/admin/plans'],
      category: 'cards',
      section: 'public',
      tags: ['card', 'pla', 'subscripció', 'pricing'],
      editableProps: {
        background: '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        padding: '24px',
        'featured-border-color': '#3b82f6',
        'featured-badge-background': '#3b82f6',
        'featured-badge-color': '#ffffff',
        'price-color': '#111827',
        'price-size': '2.5rem',
      },
    },
    // ============================================
    // GLOBAL UI COMPONENTS
    // ============================================
    {
      name: 'Button',
      displayName: 'Botó',
      description: 'Botó reutilitzable amb variants i mides',
      filePath: 'components/ui/button.tsx',
      usedIn: ['global'],
      category: 'forms',
      section: 'global',
      tags: ['button', 'form', 'action'],
      editableProps: {
        'default-bg': '#2563eb',
        'default-color': '#ffffff',
        'outline-bg': '#ffffff',
        'outline-color': '#374151',
        'outline-border': '#d1d5db',
        'destructive-bg': '#dc2626',
        'destructive-color': '#ffffff',
        'ghost-bg': 'transparent',
        'ghost-color': '#374151',
        'link-color': '#2563eb',
        'secondary-bg': '#f3f4f6',
        'secondary-color': '#111827',
        'border-radius': '6px',
        'font-weight': '500',
        'height-sm': '36px',
        'height-md': '40px',
        'height-lg': '44px',
      },
    },
    {
      name: 'Badge',
      displayName: 'Etiqueta',
      description: 'Etiqueta compacta per mostrar estat o categoria',
      filePath: 'components/ui/badge.tsx',
      usedIn: ['global'],
      category: 'feedback',
      section: 'global',
      tags: ['badge', 'tag', 'status'],
      editableProps: {
        'default-bg': '#2563eb',
        'default-color': '#ffffff',
        'secondary-bg': '#f3f4f6',
        'secondary-color': '#111827',
        'destructive-bg': '#dc2626',
        'destructive-color': '#ffffff',
        'outline-bg': '#ffffff',
        'outline-color': '#111827',
        'outline-border': '#d1d5db',
        'success-bg': '#dcfce7',
        'success-color': '#166534',
        'warning-bg': '#fef3c7',
        'warning-color': '#92400e',
        'border-radius': '9999px',
        'padding': '4px 8px',
        'font-size': '12px',
      },
    },
    {
      name: 'Input',
      displayName: 'Camp de text',
      description: 'Input de text estàndard per formularis',
      filePath: 'components/ui/input.tsx',
      usedIn: ['global'],
      category: 'forms',
      section: 'global',
      tags: ['input', 'form', 'text'],
      editableProps: {
        'background': '#ffffff',
        'color': '#111827',
        'border-color': '#d1d5db',
        'border-radius': '6px',
        'padding': '8px 12px',
        'font-size': '14px',
        'disabled-background': '#f9fafb',
        'error-border-color': '#dc2626',
      },
    },
    {
      name: 'Textarea',
      displayName: 'Àrea de text',
      description: 'Àrea de text per contingut llarg',
      filePath: 'components/ui/textarea.tsx',
      usedIn: ['global'],
      category: 'forms',
      section: 'global',
      tags: ['textarea', 'form', 'text'],
      editableProps: {
        'background': '#ffffff',
        'color': '#111827',
        'border-color': '#d1d5db',
        'border-radius': '6px',
        'padding': '8px 12px',
        'font-size': '14px',
        'min-height': '80px',
        'disabled-background': '#f9fafb',
        'error-border-color': '#dc2626',
      },
    },
    {
      name: 'Select',
      displayName: 'Selector',
      description: 'Selector desplegable per opcions',
      filePath: 'components/ui/select.tsx',
      usedIn: ['global'],
      category: 'forms',
      section: 'global',
      tags: ['select', 'dropdown', 'form'],
      editableProps: {
        'background': '#ffffff',
        'color': '#0f172a',
        'border-color': '#e2e8f0',
        'border-radius': '6px',
        'height': '40px',
        'padding': '8px 12px',
        'font-size': '14px',
        'content-background': '#ffffff',
        'content-border-color': '#e2e8f0',
        'content-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'check-color': '#2563eb',
      },
    },
    {
      name: 'Tabs',
      displayName: 'Pestanyes',
      description: 'Sistema de pestanyes per navegació',
      filePath: 'components/ui/tabs.tsx',
      usedIn: ['global'],
      category: 'navigation',
      section: 'global',
      tags: ['tabs', 'navigation'],
      editableProps: {
        'border-color': '#e5e7eb',
        'active-color': '#2563eb',
        'active-border-color': '#2563eb',
        'inactive-color': '#6b7280',
        'trigger-padding': '8px 16px',
        'trigger-font-size': '14px',
        'content-padding': '16px',
      },
    },
    {
      name: 'Dialog',
      displayName: 'Diàleg',
      description: 'Modal de diàleg per accions',
      filePath: 'components/ui/dialog.tsx',
      usedIn: ['global'],
      category: 'overlay',
      section: 'global',
      tags: ['dialog', 'modal', 'overlay'],
      editableProps: {
        'overlay-background': 'rgba(0, 0, 0, 0.5)',
        'content-background': '#ffffff',
        'content-border-radius': '8px',
        'content-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'border-color': '#e5e7eb',
        'title-color': '#111827',
        'title-font-size': '18px',
        'description-color': '#6b7280',
        'header-padding': '16px 24px',
        'body-padding': '24px',
        'footer-padding': '16px 24px',
      },
    },
    {
      name: 'Toast',
      displayName: 'Notificació Toast',
      description: 'Notificació emergent temporal',
      filePath: 'components/ui/Toast.tsx',
      usedIn: ['global'],
      category: 'feedback',
      section: 'global',
      tags: ['toast', 'notification', 'alert'],
      editableProps: {
        'success-background': '#f0fdf4',
        'success-border-color': '#bbf7d0',
        'success-color': '#166534',
        'error-background': '#fef2f2',
        'error-border-color': '#fecaca',
        'error-color': '#991b1b',
        'warning-background': '#fffbeb',
        'warning-border-color': '#fde68a',
        'warning-color': '#92400e',
        'info-background': '#eff6ff',
        'info-border-color': '#bfdbfe',
        'info-color': '#1e40af',
        'border-radius': '8px',
        'padding': '12px 16px',
        'shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
    {
      name: 'ViewToggle',
      displayName: 'Selector de Vista',
      description: 'Toggle per canviar entre vista grid i llista',
      filePath: 'components/ui/ViewToggle.tsx',
      usedIn: ['global'],
      category: 'navigation',
      section: 'global',
      tags: ['toggle', 'view', 'grid', 'list'],
      editableProps: {
        'background': '#f8f9fa',
        'border-color': '#e9ecef',
        'border-radius': '8px',
        'active-background': '#3b82f6',
        'active-color': '#ffffff',
        'inactive-color': '#6c757d',
        'hover-background': '#e9ecef',
        'hover-color': '#374151',
        'button-border-radius': '6px',
        'label-color': '#6c757d',
      },
    },
    // ============================================
    // PHASE 2 CARDS - DASHBOARD SPECIFIC
    // ============================================
    {
      name: 'ForumPostCard',
      displayName: 'Targeta de Fòrum',
      description: 'Mostra publicació de fòrum amb tags i estadístiques',
      filePath: 'components/ui/ForumPostCard.tsx',
      usedIn: ['/dashboard/forums'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'forum', 'post', 'comunitat'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        'border-radius-list': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        'padding': '20px',
        'cover-height': '200px',
        'content-padding': '16px',
        'title-color': '#2c3e50',
        'category-color': '#3b82f6',
        'description-color': '#6c757d',
        'meta-color': '#8e8e93',
        'author-color': '#6c757d',
        'tag-background': '#f0f7ff',
        'tag-color': '#3b82f6',
        'pinned-background': '#f59e0b',
        'pinned-color': '#ffffff',
        'following-background': '#10b981',
        'following-color': '#ffffff',
        'follow-color': '#374151',
      },
    },
    {
      name: 'AnunciCard',
      displayName: "Targeta d'Anunci",
      description: 'Mostra anunci de compra-venda amb preu i estat',
      filePath: 'components/ui/AnunciCard.tsx',
      usedIn: ['/dashboard/anuncis'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'anunci', 'compra-venda', 'marketplace'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        'border-radius-list': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        'padding': '20px',
        'cover-height': '160px',
        'content-padding': '16px',
        'title-color': '#2c3e50',
        'category-color': '#3b82f6',
        'location-color': '#8e8e93',
        'description-color': '#6c757d',
        'price-color': '#16a34a',
        'meta-color': '#8e8e93',
        'author-color': '#6c757d',
        'oferta-background': '#dcfce7',
        'oferta-color': '#16a34a',
        'demanda-background': '#dbeafe',
        'demanda-color': '#2563eb',
        'status-actiu': '#10b981',
        'status-reservat': '#f59e0b',
        'status-tancat': '#6b7280',
        'status-caducat': '#ef4444',
        'favorite-active-background': '#ef4444',
        'favorite-active-color': '#ffffff',
        'favorite-color': '#6b7280',
      },
    },
    {
      name: 'AssessmentCard',
      displayName: "Targeta d'Assessorament",
      description: 'Mostra servei assessorament amb disponibilitat i valoració',
      filePath: 'components/ui/AssessmentCard.tsx',
      usedIn: ['/dashboard/assessorament'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'assessorament', 'servei', 'consulta'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        'border-radius-list': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        'padding': '20px',
        'cover-height': '120px',
        'content-padding': '16px',
        'title-color': '#2c3e50',
        'type-color': '#3b82f6',
        'description-color': '#6c757d',
        'meta-color': '#8e8e93',
        'duration-color': '#f59e0b',
        'rating-color': '#f59e0b',
        'company-color': '#6c757d',
        'slots-available-color': '#10b981',
        'slots-full-color': '#ef4444',
        'slots-badge-available-bg': 'rgba(16, 185, 129, 0.9)',
        'slots-badge-full-bg': 'rgba(239, 68, 68, 0.9)',
        'slots-badge-color': 'white',
        'highlighted-background': '#3b82f6',
        'highlighted-color': 'white',
        'favorite-active-background': '#ef4444',
        'favorite-active-color': 'white',
        'favorite-color': '#6b7280',
        'plan-premium-bg': '#f59e0b',
        'plan-premium-color': 'white',
        'plan-standard-bg': '#10b981',
        'plan-standard-color': 'white',
        'plan-basic-bg': '#6b7280',
        'plan-basic-color': 'white',
      },
    },
    {
      name: 'CourseCard',
      displayName: 'Targeta de Curs',
      description: 'Mostra curs de formació amb preu i places',
      filePath: 'components/ui/CourseCard.tsx',
      usedIn: ['/dashboard/formacio'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'curs', 'formacio', 'educacio'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '12px',
        'border-radius-list': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        'padding': '16px 20px',
        'cover-height': '140px',
        'content-padding': '16px',
        'title-color': '#2c3e50',
        'description-color': '#6c757d',
        'category-background': '#f0f7ff',
        'category-color': '#3b82f6',
        'category-badge-background': 'rgba(59, 130, 246, 0.9)',
        'category-badge-color': 'white',
        'meta-color': '#6c757d',
        'rating-color': '#f59e0b',
        'instructor-color': '#6c757d',
        'price-color': '#2c3e50',
        'original-price-color': '#9ca3af',
        'slots-color': '#10b981',
        'enroll-button-background': '#3b82f6',
        'enroll-button-color': 'white',
        'enroll-button-hover-background': '#2563eb',
      },
    },
    {
      name: 'LinkCard',
      displayName: 'Targeta de Recurs',
      description: "Mostra enllaç extern amb contacte i categoria",
      filePath: 'components/ui/LinkCard.tsx',
      usedIn: ['/dashboard/links'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'link', 'recurs', 'directori'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '16px',
        'border-radius-list': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.2)',
        'hover-border-color': '#3b82f6',
        'padding': '20px',
        'cover-height': '120px',
        'content-padding': '16px',
        'logo-size-list': '80px',
        'title-color': '#2c3e50',
        'slogan-color': '#3b82f6',
        'description-color': '#6c757d',
        'category-background': '#f3f4f6',
        'category-text-color': '#6b7280',
        'category-badge-background': 'rgba(59, 130, 246, 0.9)',
        'category-badge-color': 'white',
        'meta-color': '#8e8e93',
        'contact-color': '#6c757d',
        'highlighted-background': '#3b82f6',
        'highlighted-color': 'white',
        'favorite-active-background': '#ef4444',
        'favorite-active-color': 'white',
        'favorite-color': '#6b7280',
        'button-background': '#3b82f6',
        'button-color': 'white',
        'button-hover-background': '#2563eb',
      },
    },
    {
      name: 'ProfileCompletionCard',
      displayName: 'Targeta de Progrés',
      description: 'Mostra progrés de completar perfil amb cercle',
      filePath: 'components/ui/ProfileCompletionCard.tsx',
      usedIn: ['/dashboard'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'perfil', 'progress', 'completar'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e5e7eb',
        'border-radius': '12px',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'padding': '20px',
        'title-color': '#2c3e50',
        'label-color': '#6c757d',
        'percentage-color': '#2c3e50',
        'progress-color': '#10b981',
        'progress-track-color': '#e9ecef',
        'checkbox-border-color': '#dee2e6',
        'checkbox-completed-background': '#10b981',
        'checkbox-completed-color': 'white',
        'item-completed-color': '#6c757d',
        'item-pending-color': '#2c3e50',
        'count-completed-color': '#10b981',
        'count-pending-color': '#6c757d',
        'button-background': '#ffffff',
        'button-color': '#2c3e50',
        'button-border-color': '#e9ecef',
        'button-hover-background': '#f8f9fa',
        'button-hover-border-color': '#dee2e6',
      },
    },
    {
      name: 'UniversalCard',
      displayName: 'Targeta Universal',
      description: 'Component card flexible amb 3 zones (top, middle, bottom)',
      filePath: 'components/ui/UniversalCard.tsx',
      usedIn: ['/dashboard', '/gestio'],
      category: 'cards',
      section: 'dashboard',
      tags: ['card', 'universal', 'flexible', 'template'],
      editableProps: {
        'background': '#ffffff',
        'border-color': '#e9ecef',
        'border-radius': '12px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'hover-shadow': '0 4px 12px rgba(0,0,0,0.15)',
        'divider-color': '#e9ecef',
        'title-color': '#2c3e50',
        'subtitle-color': '#6c757d',
        'description-color': '#6c757d',
        'author-color': '#2c3e50',
        'date-color': '#6c757d',
        'stat-label-color': '#6c757d',
        'stat-value-color': '#2c3e50',
        'trend-color': '#28a745',
        'bottom-stats-color': '#6c757d',
        'badge-background': '#3b82f6',
        'badge-color': '#ffffff',
        'avatar-background': '#3b82f6',
        'avatar-color': '#ffffff',
        'icon-background': '#f3f4f6',
        'default-gradient': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'default-solid-color': '#3b82f6',
        'primary-action-background': '#3b82f6',
        'primary-action-color': 'white',
        'primary-action-border-color': '#3b82f6',
        'primary-action-link-color': '#3b82f6',
        'secondary-action-color': '#6c757d',
      },
    },
    // ============================================
    // PHASE 3 - PROFILE WIZARD & TABS
    // ============================================
    {
      name: 'ProgressIndicator',
      displayName: 'Indicador de Progrés',
      description: 'Mostra progrés del wizard amb passos i barra',
      filePath: 'app/dashboard/perfil/components/wizard/ProgressIndicator.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'navigation',
      section: 'dashboard',
      tags: ['wizard', 'progress', 'steps', 'perfil'],
      editableProps: {
        'title-color': '#111827',
        'subtitle-color': '#6b7280',
        'track-color': '#e5e7eb',
        'bar-color': '#2563eb',
        'completed-bg': '#dcfce7',
        'completed-color': '#166534',
        'completed-number-bg': '#16a34a',
        'completed-number-color': '#ffffff',
        'current-bg': '#dbeafe',
        'current-color': '#1e40af',
        'current-ring-color': '#3b82f6',
        'current-number-bg': '#2563eb',
        'current-number-color': '#ffffff',
        'pending-bg': '#f3f4f6',
        'pending-color': '#6b7280',
        'pending-number-bg': '#d1d5db',
        'pending-number-color': '#4b5563',
      },
    },
    {
      name: 'Step1Basic',
      displayName: 'Pas 1 - Dades Bàsiques',
      description: 'Primer pas del wizard amb foto i dades bàsiques',
      filePath: 'app/dashboard/perfil/components/wizard/Step1Basic.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'upload'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'label-color': '#374151',
        'hint-color': '#6b7280',
        'text-color': '#4b5563',
        'icon-color': '#9ca3af',
        'divider-color': '#e5e7eb',
        'border-color': '#d1d5db',
        'drag-active-border': '#6366f1',
        'drag-active-bg': '#eef2ff',
        'primary-bg': '#4f46e5',
        'primary-color': '#ffffff',
        'danger-bg': '#ef4444',
        'danger-color': '#ffffff',
        'danger-text': '#dc2626',
        'danger-hover-bg': '#fef2f2',
        'avatar-bg': '#e0e7ff',
        'avatar-color': '#4f46e5',
        'saving-color': '#4f46e5',
      },
    },
    {
      name: 'Step2Personal',
      displayName: 'Pas 2 - Info Personal',
      description: 'Segon pas amb informació personal i bio',
      filePath: 'app/dashboard/perfil/components/wizard/Step2Personal.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'personal'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'label-color': '#374151',
        'input-border': '#d1d5db',
        'input-focus-border': '#6366f1',
        'input-focus-ring': 'rgba(99, 102, 241, 0.2)',
        'tip-bg': '#f0fdf4',
        'tip-border': '#bbf7d0',
        'tip-text': '#166534',
      },
    },
    {
      name: 'Step3Social',
      displayName: 'Pas 3 - Xarxes Socials',
      description: 'Tercer pas amb enllaços a xarxes socials',
      filePath: 'app/dashboard/perfil/components/wizard/Step3Social.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'social'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'card-border': '#e5e7eb',
        'card-hover-border': '#3b82f6',
        'twitter-bg': '#dbeafe',
        'twitter-icon': '#2563eb',
        'linkedin-bg': '#dbeafe',
        'linkedin-icon': '#0077b5',
        'instagram-bg': '#fce7f3',
        'instagram-icon': '#e1306c',
        'label-color': '#374151',
        'input-border': '#d1d5db',
        'input-focus-border': '#6366f1',
      },
    },
    {
      name: 'Step4Education',
      displayName: 'Pas 4 - Formació',
      description: 'Quart pas amb historial educatiu',
      filePath: 'app/dashboard/perfil/components/wizard/Step4Education.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'educacio'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'card-bg': '#f8f9fa',
        'card-border': '#e9ecef',
        'label-color': '#374151',
        'input-border': '#d1d5db',
        'summary-bg': '#f0f9ff',
        'summary-border': '#bae6fd',
        'summary-title': '#0369a1',
        'summary-text': '#0c4a6e',
        'add-button-bg': '#3b82f6',
        'add-button-color': '#ffffff',
      },
    },
    {
      name: 'Step5Experience',
      displayName: 'Pas 5 - Experiència',
      description: 'Cinquè pas amb experiència laboral',
      filePath: 'app/dashboard/perfil/components/wizard/Step5Experience.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'experiencia'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'card-bg': '#f8f9fa',
        'card-border': '#e9ecef',
        'label-color': '#374151',
        'input-border': '#d1d5db',
      },
    },
    {
      name: 'Step6Skills',
      displayName: 'Pas 6 - Habilitats',
      description: 'Sisè pas amb habilitats i competències',
      filePath: 'app/dashboard/perfil/components/wizard/Step6Skills.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'skills'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'skill-bg': '#e0e7ff',
        'skill-color': '#4f46e5',
        'skill-remove-bg': '#ef4444',
        'skill-remove-color': '#ffffff',
      },
    },
    {
      name: 'Step7Languages',
      displayName: 'Pas 7 - Idiomes',
      description: 'Setè pas amb idiomes i nivells',
      filePath: 'app/dashboard/perfil/components/wizard/Step7Languages.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'forms',
      section: 'dashboard',
      tags: ['wizard', 'form', 'perfil', 'idiomes'],
      editableProps: {
        'title-color': '#111827',
        'description-color': '#4b5563',
        'level-native-bg': '#dcfce7',
        'level-native-color': '#166534',
        'level-advanced-bg': '#dbeafe',
        'level-advanced-color': '#1e40af',
        'level-intermediate-bg': '#fef3c7',
        'level-intermediate-color': '#92400e',
        'level-basic-bg': '#f3f4f6',
        'level-basic-color': '#6b7280',
      },
    },
    // ============================================
    // PHASE 3 - PROFILE TABS
    // ============================================
    {
      name: 'PostsTab',
      displayName: 'Pestanya Publicacions',
      description: 'Pestanya del perfil amb publicacions de l\'usuari',
      filePath: 'app/dashboard/perfil/components/tabs/PostsTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'posts', 'publicacions'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#1f2937',
        'stat-bg': '#f8f9fa',
        'stat-posts-color': '#3b82f6',
        'stat-likes-color': '#ef4444',
        'stat-comments-color': '#10b981',
        'stat-label-color': '#6b7280',
        'empty-color': '#6b7280',
      },
    },
    {
      name: 'FriendsTab',
      displayName: 'Pestanya Amistats',
      description: 'Pestanya del perfil amb connexions i amics',
      filePath: 'app/dashboard/perfil/components/tabs/FriendsTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'friends', 'connexions'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#1f2937',
        'button-bg': '#3b82f6',
        'button-color': '#ffffff',
        'card-bg': '#f8f9fa',
        'card-border': '#e9ecef',
        'avatar-bg': '#3b82f6',
        'avatar-color': '#ffffff',
        'friend-name': '#1f2937',
        'friend-nick': '#6b7280',
        'badge-local-bg': '#dcfce7',
        'badge-local-color': '#166534',
        'badge-autonomica-bg': '#f3e8ff',
        'badge-autonomica-color': '#7c3aed',
        'badge-central-bg': '#dbeafe',
        'badge-central-color': '#1d4ed8',
        'secondary-border': '#d1d5db',
        'secondary-color': '#374151',
        'secondary-hover-bg': '#f9fafb',
      },
    },
    {
      name: 'GroupsTab',
      displayName: 'Pestanya Grups',
      description: 'Pestanya del perfil amb grups de l\'usuari',
      filePath: 'app/dashboard/perfil/components/tabs/GroupsTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'groups', 'grups'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#1f2937',
        'button-bg': '#3b82f6',
        'button-color': '#ffffff',
        'card-bg': '#f8f9fa',
        'card-border': '#e9ecef',
        'avatar-bg': '#8b5cf6',
        'avatar-color': '#ffffff',
        'group-name': '#1f2937',
        'group-members': '#6b7280',
        'group-activity': '#9ca3af',
        'role-admin-bg': '#fef3c7',
        'role-admin-color': '#92400e',
        'role-moderator-bg': '#dbeafe',
        'role-moderator-color': '#1e40af',
        'role-member-bg': '#f3e8ff',
        'role-member-color': '#7c3aed',
      },
    },
    {
      name: 'PhotosTab',
      displayName: 'Pestanya Fotos',
      description: 'Pestanya del perfil amb galeria de fotos',
      filePath: 'app/dashboard/perfil/components/tabs/PhotosTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'photos', 'galeria'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#1f2937',
        'empty-color': '#6b7280',
      },
    },
    {
      name: 'TimelineTab',
      displayName: 'Pestanya Activitat',
      description: 'Pestanya del perfil amb timeline d\'activitat',
      filePath: 'app/dashboard/perfil/components/tabs/TimelineTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'timeline', 'activitat'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#1f2937',
        'card-bg': '#f8f9fa',
        'card-border': '#e9ecef',
        'icon-bg': '#3b82f6',
        'icon-color': '#ffffff',
        'content-color': '#374151',
        'timestamp-color': '#6b7280',
        'button-border': '#d1d5db',
        'button-color': '#374151',
        'button-hover-bg': '#f9fafb',
      },
    },
    // ============================================
    // PHASE 3 - DASHBOARD HEADERS
    // ============================================
    {
      name: 'ForumHeader',
      displayName: 'Capçalera Fòrums',
      description: 'Capçalera de la secció de fòrums amb controls',
      filePath: 'components/ui/ForumHeader.tsx',
      usedIn: ['/dashboard/forums'],
      category: 'headers',
      section: 'dashboard',
      tags: ['header', 'forum', 'controls'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'border-color': '#e5e7eb',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'title-color': '#2c3e50',
        'subtitle-color': '#6c757d',
        'create-button-bg': '#10b981',
        'create-button-color': '#ffffff',
        'create-button-hover-bg': '#059669',
        'divider-color': '#f0f0f0',
        'tab-meus-color': '#10b981',
        'tab-seguits-color': '#3b82f6',
        'tab-populars-color': '#f59e0b',
        'tab-tots-color': '#6c757d',
      },
    },
    {
      name: 'GroupsHeader',
      displayName: 'Capçalera Grups',
      description: 'Capçalera de la secció de grups amb controls',
      filePath: 'components/ui/GroupsHeader.tsx',
      usedIn: ['/dashboard/grups'],
      category: 'headers',
      section: 'dashboard',
      tags: ['header', 'groups', 'controls'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '20px',
        'border-color': '#e5e7eb',
        'shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'title-color': '#2c3e50',
        'subtitle-color': '#6c757d',
        'create-button-bg': '#3b82f6',
        'create-button-color': '#ffffff',
        'create-button-hover-bg': '#2563eb',
        'divider-color': '#f0f0f0',
        'tab-mygroups-color': '#10b981',
        'tab-recommended-color': '#3b82f6',
        'tab-popular-color': '#f59e0b',
        'tab-all-color': '#6c757d',
      },
    },
    // ============================================
    // PHASE 3 - SOCIAL FEED
    // ============================================
    {
      name: 'PostCard',
      displayName: 'Targeta de Publicació',
      description: 'Component per mostrar publicacions al feed social',
      filePath: 'app/dashboard/components/SocialFeed/components/PostCard.tsx',
      usedIn: ['/dashboard'],
      category: 'cards',
      section: 'dashboard',
      tags: ['social', 'feed', 'post', 'card'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'border-color': '#e5e7eb',
        'shadow': '0 1px 3px rgba(0,0,0,0.1)',
        'avatar-bg': '#3b82f6',
        'avatar-color': '#ffffff',
        'user-name': '#1f2937',
        'user-role': '#6b7280',
        'time-color': '#9ca3af',
        'content-color': '#1f2937',
        'divider': '#f3f4f6',
        'stats-color': '#6b7280',
        'liked-color': '#ef4444',
        'action-color': '#4b5563',
        'action-active': '#2563eb',
        'menu-bg': '#ffffff',
        'menu-border': '#e5e7eb',
        'menu-text': '#374151',
        'menu-divider': '#f3f4f6',
        'danger-color': '#dc2626',
        'saved-color': '#3b82f6',
        'success-color': '#16a34a',
        'comments-bg': '#f9fafb',
        'comment-bg': '#ffffff',
        'comment-border': '#f3f4f6',
        'comment-author': '#1f2937',
        'comment-text': '#374151',
        'comment-meta': '#6b7280',
        'input-border': '#e5e7eb',
        'input-bg': '#ffffff',
        'input-text': '#111827',
      },
    },
    {
      name: 'CreatePostBox',
      displayName: 'Crear Publicació',
      description: 'Component per crear noves publicacions al feed',
      filePath: 'app/dashboard/components/SocialFeed/components/CreatePostBox.tsx',
      usedIn: ['/dashboard'],
      category: 'forms',
      section: 'dashboard',
      tags: ['social', 'feed', 'post', 'create', 'form'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'border-color': '#e5e7eb',
        'shadow': '0 1px 3px rgba(0,0,0,0.1)',
        'avatar-bg': '#4f46e5',
        'avatar-color': '#ffffff',
        'user-name': '#111827',
        'icon-color': '#6b7280',
        'select-color': '#4b5563',
        'select-border': '#e5e7eb',
        'select-bg': '#ffffff',
        'textarea-border': '#e5e7eb',
        'textarea-color': '#111827',
        'textarea-bg': '#ffffff',
        'attachment-border': '#e5e7eb',
        'document-bg': '#f3f4f6',
        'document-icon': '#6b7280',
        'document-text': '#374151',
        'remove-bg': '#ef4444',
        'remove-color': '#ffffff',
        'poll-bg': '#f9fafb',
        'poll-border': '#e5e7eb',
        'poll-title': '#374151',
        'poll-close': '#9ca3af',
        'poll-input-border': '#e5e7eb',
        'poll-input-color': '#111827',
        'poll-input-bg': '#ffffff',
        'poll-active-bg': '#e0e7ff',
        'divider': '#f3f4f6',
        'action-color': '#4b5563',
        'primary-color': '#4f46e5',
        'submit-bg': '#4f46e5',
        'submit-color': '#ffffff',
        'submit-disabled-bg': '#e5e7eb',
        'submit-disabled-color': '#9ca3af',
      },
    },
    // ============================================
    // PHASE 3 - MISSATGES (CHAT)
    // ============================================
    {
      name: 'ChatSidebar',
      displayName: 'Barra Lateral Xat',
      description: 'Sidebar amb filtres, contactes i converses',
      filePath: 'app/dashboard/missatges/components/ChatSidebar.tsx',
      usedIn: ['/dashboard/missatges'],
      category: 'navigation',
      section: 'dashboard',
      tags: ['chat', 'sidebar', 'missatges', 'contacts'],
      editableProps: {
        'background': '#1e293b',
        'text-color': '#ffffff',
        'secondary-text': '#94a3b8',
        'border-color': '#334155',
        'avatar-bg': '#334155',
        'icon-color': '#9ca3af',
        'button-bg': '#4f46e5',
        'button-color': '#ffffff',
        'input-bg': '#334155',
        'input-border': '#475569',
        'filter-active-bg': '#334155',
        'badge-bg': '#ef4444',
        'badge-color': '#ffffff',
        'online-color': '#22c55e',
        'link-color': '#818cf8',
        'modal-bg': '#ffffff',
        'modal-border': '#e5e7eb',
        'modal-title': '#111827',
        'modal-text': '#111827',
        'modal-secondary': '#6b7280',
        'modal-icon': '#9ca3af',
        'modal-input-border': '#e5e7eb',
        'modal-avatar-bg': '#e0e7ff',
      },
    },
    {
      name: 'ChatWindow',
      displayName: 'Finestra de Xat',
      description: 'Finestra principal de conversa amb missatges',
      filePath: 'app/dashboard/missatges/components/ChatWindow.tsx',
      usedIn: ['/dashboard/missatges'],
      category: 'content',
      section: 'dashboard',
      tags: ['chat', 'window', 'missatges', 'messages'],
      editableProps: {
        'background': '#f9fafb',
        'header-bg': '#ffffff',
        'border-color': '#e5e7eb',
        'icon-color': '#4b5563',
        'avatar-bg': '#e5e7eb',
        'avatar-default-bg': '#e0e7ff',
        'avatar-default-color': '#4f46e5',
        'header-title': '#111827',
        'online-color': '#22c55e',
        'offline-color': '#6b7280',
        'message-own-bg': '#3b82f6',
        'message-own-color': '#ffffff',
        'message-other-bg': '#ffffff',
        'message-other-color': '#2c3e50',
        'message-other-border': '#e5e7eb',
        'input-bg': '#ffffff',
        'input-border': '#e5e7eb',
        'input-text': '#1f2937',
        'send-button-bg': '#3b82f6',
        'send-button-color': '#ffffff',
      },
    },
    {
      name: 'SavedTab',
      displayName: 'Pestanya Guardats',
      description: 'Pestanya del perfil amb contingut guardat per l\'usuari',
      filePath: 'app/dashboard/perfil/components/tabs/SavedTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'saved', 'guardats', 'bookmarks'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'title-color': '#111827',
        'subtitle-color': '#6b7280',
        'link-color': '#3b82f6',
        'card-bg': '#ffffff',
        'card-radius': '8px',
        'card-border': '#e5e7eb',
        'card-title': '#111827',
        'card-subtitle': '#6b7280',
        'price-color': '#16a34a',
        'heart-color': '#ef4444',
        'bookmark-color': '#3b82f6',
        'button-bg': 'rgba(255,255,255,0.9)',
        'primary-button-bg': '#3b82f6',
        'primary-button-text': 'white',
        'stat-blogs-bg': '#f0f9ff',
        'stat-blogs-color': '#0369a1',
        'stat-offers-bg': '#f0fdf4',
        'stat-offers-color': '#166534',
        'stat-forums-bg': '#fdf4ff',
        'stat-forums-color': '#86198f',
        'stat-anuncis-bg': '#fff7ed',
        'stat-anuncis-color': '#c2410c',
        'stat-empreses-bg': '#eef2ff',
        'stat-empreses-color': '#4338ca',
        'stat-grups-bg': '#fdf2f8',
        'stat-grups-color': '#be185d',
      },
    },
    {
      name: 'SettingsTab',
      displayName: 'Pestanya Configuració',
      description: 'Pestanya del perfil per editar configuració personal',
      filePath: 'app/dashboard/perfil/components/tabs/SettingsTab.tsx',
      usedIn: ['/dashboard/perfil'],
      category: 'tabs',
      section: 'dashboard',
      tags: ['tab', 'perfil', 'settings', 'configuracio', 'form'],
      editableProps: {
        'background': '#ffffff',
        'card-radius': '12px',
        'padding': '20px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'border-radius': '8px',
        'title-color': '#1f2937',
        'label-color': '#374151',
        'text-muted': '#6b7280',
        'input-border': '#d1d5db',
        'input-disabled-bg': '#f9fafb',
        'focus-color': '#3b82f6',
        'icon-muted': '#9ca3af',
        'primary-button': '#2563eb',
        'primary-button-hover': '#1d4ed8',
        'button-text': 'white',
        'button-disabled': '#9ca3af',
        'danger-button': '#dc2626',
        'danger-button-hover': '#b91c1c',
        'link-color': '#2563eb',
        'link-hover': '#1d4ed8',
        'toast-shadow': '0 4px 12px rgba(0,0,0,0.15)',
        'toast-success-bg': '#f0f9ff',
        'toast-success-border': '#e0f2fe',
        'toast-success-text': '#075985',
        'toast-error-bg': '#fef2f2',
        'toast-error-border': '#fecaca',
        'toast-error-text': '#dc2626',
        'progress-bg': '#e5e7eb',
        'strength-weak': '#ef4444',
        'strength-medium': '#eab308',
        'strength-strong': '#10b981',
        'strength-text': '#4b5563',
        'check-valid': '#059669',
      },
    },
    {
      name: 'EmojiPicker',
      displayName: 'Selector d\'Emojis',
      description: 'Component per seleccionar emojis als missatges',
      filePath: 'app/dashboard/missatges/components/EmojiPicker.tsx',
      usedIn: ['/dashboard/missatges'],
      category: 'overlay',
      section: 'dashboard',
      tags: ['emoji', 'picker', 'chat', 'missatges'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'shadow': '0 4px 12px rgba(0,0,0,0.15)',
        'padding': '16px',
        'border-color': '#f0f0f0',
        'title-color': '#2c3e50',
        'label-color': '#6c757d',
      },
    },
    {
      name: 'CreateGroupModal',
      displayName: 'Modal Crear Grup',
      description: 'Modal per crear grups de xat amb participants',
      filePath: 'app/dashboard/missatges/components/CreateGroupModal.tsx',
      usedIn: ['/dashboard/missatges'],
      category: 'overlay',
      section: 'dashboard',
      tags: ['modal', 'group', 'chat', 'missatges', 'create'],
      editableProps: {
        'overlay': 'rgba(0, 0, 0, 0.5)',
        'background': '#ffffff',
        'border-radius': '16px',
        'shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'border-color': '#e5e7eb',
        'icon-bg': '#dbeafe',
        'title-color': '#1f2937',
        'subtitle-color': '#6b7280',
        'label-color': '#374151',
        'input-border': '#e5e7eb',
        'input-radius': '10px',
        'input-text': '#1f2937',
        'input-bg': '#ffffff',
        'focus-color': '#3b82f6',
        'icon-muted': '#9ca3af',
        'error-bg': '#fef2f2',
        'error-text': '#dc2626',
        'cancel-bg': '#f3f4f6',
        'cancel-text': '#374151',
        'primary-button': '#3b82f6',
        'button-disabled': '#9ca3af',
        'button-text': 'white',
      },
    },
    {
      name: 'AnunciSidebar',
      displayName: 'Sidebar d\'Anunci',
      description: 'Barra lateral amb preu, botons de contacte i accions d\'anunci',
      filePath: 'app/dashboard/anuncis/[slug]/components/AnunciSidebar.tsx',
      usedIn: ['/dashboard/anuncis'],
      category: 'content',
      section: 'dashboard',
      tags: ['sidebar', 'anunci', 'detail', 'price', 'contact'],
      editableProps: {
        'background': '#ffffff',
        'border-radius': '12px',
        'padding': '24px',
        'shadow': '0 2px 8px rgba(0,0,0,0.1)',
        'border-color': '#f0f0f0',
        'button-radius': '8px',
        'category-color': '#2563eb',
        'category-bg': '#dbeafe',
        'price-oferta': '#16a34a',
        'price-demanda': '#2563eb',
        'primary-button': '#3b82f6',
        'primary-button-text': 'white',
        'phone-border': '#10b981',
        'phone-bg': '#ecfdf5',
        'phone-color': '#10b981',
        'email-border': '#f59e0b',
        'email-bg': '#fffbeb',
        'email-color': '#f59e0b',
        'secondary-border': '#e5e7eb',
        'secondary-bg': '#f9fafb',
        'secondary-color': '#6b7280',
        'saved-border': '#3b82f6',
        'saved-bg': '#dbeafe',
        'saved-color': '#2563eb',
      },
    },
  ]

  let registered = 0
  let errors = 0

  for (const component of initialComponents) {
    try {
      // Check if already exists
      const existing = await prisma.componentRegistry.findUnique({
        where: { name: component.name },
      })

      if (!existing) {
        await registerComponent(component)
        registered++
      }
    } catch (error) {
      console.error(`Error registering ${component.name}:`, error)
      errors++
    }
  }

  revalidatePath('/admin/componentes')
  return {
    success: true,
    data: { registered, errors, total: initialComponents.length },
  }
  } catch (error) {
    console.error('Error registering initial components:', error)
    return { success: false, error: 'Error registrant components inicials' }
  }
}

// ============================================
// UPDATE ROUTES
// ============================================

const CORRECT_ROUTES: Record<string, string[]> = {
  CompanyCard: ['/dashboard/empreses', '/gestio/empreses'],
  OfferCard: ['/empresa/ofertes'],
  MemberCard: ['/dashboard/membres'],
  GroupCard: ['/dashboard/grups'],
  StatCard: ['/dashboard', '/gestio', '/admin', '/empresa/dashboard'],
  LeadCard: ['/admin/empreses-pendents'],
  InvoiceCard: ['/gestio/admin/facturacio'],
  PlanCard: ['/empresa/plans', '/gestio/admin/plans'],
}

export async function updateComponentRoutes(): Promise<
  { success: true; data: { updated: number } } |
  { success: false; error: string }
> {
  try {
    let updated = 0

    for (const [componentName, routes] of Object.entries(CORRECT_ROUTES)) {
      const result = await prisma.componentRegistry.updateMany({
        where: { name: componentName },
        data: { usedIn: routes },
      })
      if (result.count > 0) updated++
    }

    revalidatePath('/admin/componentes')
    return { success: true, data: { updated } }
  } catch (error) {
    console.error('Error updating component routes:', error)
    return { success: false, error: 'Error actualitzant rutes' }
  }
}

// New editable props definitions - used to update existing components
const UPDATED_EDITABLE_PROPS: Record<string, Record<string, string>> = {
  OfferCard: {
    background: '#ffffff',
    'border-color': '#e5e7eb',
    'border-radius': '12px',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    'hover-shadow': '0 8px 16px -4px rgba(59, 130, 246, 0.15)',
    'hover-border-color': '#3b82f6',
    padding: '16px',
    'title-color': '#111827',
    'text-color': '#6b7280',
    'category-color': '#3b82f6',
    'description-color': '#4b5563',
    'price-color': '#111827',
    'original-price-color': '#9ca3af',
    'discount-background': '#dcfce7',
    'discount-color': '#166534',
    'cover-height': '160px',
    'badge-background': '#dbeafe',
    'badge-color': '#1e40af',
  },
  MemberCard: {
    background: '#ffffff',
    'border-color': '#e5e7eb',
    'border-radius': '16px',
    'border-radius-list': '12px',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    'hover-shadow': '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 0 0 2px #818cf8',
    'hover-border-color': '#818cf8',
    'hover-background': '#f9fafb',
    padding: '16px',
    'cover-height': '112px',
    'avatar-size': '88px',
    'avatar-size-list': '56px',
    'avatar-gradient': 'linear-gradient(135deg, #6366f1, #a855f7)',
    'title-color': '#111827',
    'text-color': '#6b7280',
    'description-color': '#4b5563',
    'stats-value-color': '#111827',
    'online-color': '#22c55e',
    'overlay-gradient': 'linear-gradient(to bottom, rgba(79, 70, 229, 0.95), rgba(109, 40, 217, 0.95))',
    'primary-button-bg': '#4f46e5',
    'primary-button-color': '#ffffff',
    'secondary-button-bg': '#f3f4f6',
    'secondary-button-color': '#374151',
    'danger-button-bg': '#fef2f2',
    'danger-button-color': '#dc2626',
    'warning-button-bg': '#fef3c7',
    'warning-button-color': '#b45309',
    'success-button-bg': '#16a34a',
    'success-button-color': '#ffffff',
  },
  StatCard: {
    background: '#ffffff',
    'border-radius': '8px',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    padding: '16px',
    'title-size': '14px',
    'title-color': '#4b5563',
    'value-size': '1.5rem',
    'value-weight': '700',
    'value-color': '#111827',
    'subtitle-color': '#6b7280',
    'trend-up-color': '#16a34a',
    'trend-down-color': '#dc2626',
    'badge-background': '#dbeafe',
    'badge-color': '#1e40af',
  },
}

export async function updateComponentEditableProps(): Promise<
  { success: true; data: { updated: number } } |
  { success: false; error: string }
> {
  try {
    let updated = 0

    for (const [componentName, props] of Object.entries(UPDATED_EDITABLE_PROPS)) {
      const existing = await prisma.componentRegistry.findUnique({
        where: { name: componentName },
      })

      if (existing) {
        await prisma.componentRegistry.update({
          where: { name: componentName },
          data: {
            editableProps: props,
            defaultProps: props,
            version: existing.version + 1,
            updatedAt: new Date(),
          },
        })

        // Update corresponding DesignTokens
        for (const [key, value] of Object.entries(props)) {
          await prisma.designToken.upsert({
            where: {
              category_name: {
                category: 'components',
                name: `${componentName}-${key}`,
              },
            },
            update: {
              value,
              updatedAt: new Date(),
            },
            create: {
              category: 'components',
              name: `${componentName}-${key}`,
              value,
              cssVariable: `--${componentName}-${key}`,
              description: `${existing.displayName} - ${key}`,
            },
          })
        }

        updated++
      }
    }

    revalidatePath('/admin/componentes')
    return { success: true, data: { updated } }
  } catch (error) {
    console.error('Error updating component editable props:', error)
    return { success: false, error: 'Error actualitzant propietats editables' }
  }
}

// ============================================
// CSS GENERATION
// ============================================

export async function generateComponentCSS() {
  try {
    const components = await prisma.componentRegistry.findMany({
      where: { isActive: true },
    })

    const cssLines: string[] = []

    for (const component of components) {
      const props = component.editableProps as Record<string, string>
      cssLines.push(`  /* ${component.displayName} */`)
      for (const [key, value] of Object.entries(props)) {
        cssLines.push(`  --${component.name}-${key}: ${value};`)
      }
      cssLines.push('')
    }

    const css = `:root {\n${cssLines.join('\n')}\n}`

    return { success: true, data: css }
  } catch (error) {
    console.error('Error generating CSS:', error)
    return { success: false, error: 'Error generant CSS' }
  }
}
