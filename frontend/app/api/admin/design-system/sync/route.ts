import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Colors reals extrets de l'anàlisi del codebase
// Basats en Tailwind CSS i colors hardcoded trobats als components
const REAL_COLORS = {
  // Colors primaris - basats en blue-500/600 (124+ usos)
  'color-primary': { value: '#3b82f6', description: 'Blue-500 - Color primari principal' },
  'color-primary-dark': { value: '#2563eb', description: 'Blue-600 - Hover/Active' },
  'color-primary-darker': { value: '#1d4ed8', description: 'Blue-700 - Pressed' },
  'color-primary-light': { value: '#60a5fa', description: 'Blue-400 - Subtle' },
  'color-primary-lighter': { value: '#93c5fd', description: 'Blue-300 - Very light' },
  'color-primary-bg': { value: '#eff6ff', description: 'Blue-50 - Background' },

  // Color secundari - Slate/Text oscur (#2c3e50 molt usat)
  'color-secondary': { value: '#2c3e50', description: 'Slate fosc - Text principals' },
  'color-secondary-light': { value: '#34495e', description: 'Slate mig - Hover' },

  // Colors de text (basats en gray/slate)
  'color-text-primary': { value: '#111827', description: 'Gray-900 - Text principal' },
  'color-text-secondary': { value: '#374151', description: 'Gray-700 - Text secundari' },
  'color-text-tertiary': { value: '#6b7280', description: 'Gray-500 - Text terciari' },
  'color-text-muted': { value: '#9ca3af', description: 'Gray-400 - Text desactivat' },
  'color-text-placeholder': { value: '#9ca3af', description: 'Gray-400 - Placeholders' },

  // Colors de fons
  'color-background': { value: '#ffffff', description: 'Fons principal' },
  'color-surface': { value: '#f8fafc', description: 'Slate-50 - Cards/Surfaces' },
  'color-muted': { value: '#f1f5f9', description: 'Slate-100 - Fons secundari' },
  'color-subtle': { value: '#e2e8f0', description: 'Slate-200 - Fons hover' },

  // Borders (trobats freqüentment)
  'color-border': { value: '#e5e7eb', description: 'Gray-200 - Borders principals' },
  'color-border-light': { value: '#f3f4f6', description: 'Gray-100 - Borders suaus' },
  'color-border-strong': { value: '#d1d5db', description: 'Gray-300 - Borders marcats' },

  // Colors semàntics (trobats amb alta freqüència)
  'color-success': { value: '#10b981', description: 'Green-500 - Èxit' },
  'color-success-dark': { value: '#059669', description: 'Green-600 - Hover' },
  'color-success-light': { value: '#d1fae5', description: 'Green-100 - Background' },

  'color-warning': { value: '#f59e0b', description: 'Amber-500 - Avís' },
  'color-warning-dark': { value: '#d97706', description: 'Amber-600 - Hover' },
  'color-warning-light': { value: '#fef3c7', description: 'Amber-100 - Background' },

  'color-error': { value: '#ef4444', description: 'Red-500 - Error' },
  'color-error-dark': { value: '#dc2626', description: 'Red-600 - Hover' },
  'color-error-light': { value: '#fee2e2', description: 'Red-100 - Background' },

  'color-info': { value: '#3b82f6', description: 'Blue-500 - Informació' },
  'color-info-dark': { value: '#2563eb', description: 'Blue-600 - Hover' },
  'color-info-light': { value: '#dbeafe', description: 'Blue-100 - Background' },

  // Colors d'accent (#8b5cf6 - purple)
  'color-accent': { value: '#8b5cf6', description: 'Violet-500 - Accent' },
  'color-accent-dark': { value: '#7c3aed', description: 'Violet-600 - Hover' },
  'color-accent-light': { value: '#ede9fe', description: 'Violet-100 - Background' },
}

// Tipografia real (basada en Tailwind defaults + fonts del projecte)
const REAL_TYPOGRAPHY = {
  // Font families
  'font-family-sans': { value: 'Inter, system-ui, -apple-system, sans-serif', description: 'Font principal' },
  'font-family-serif': { value: 'Playfair Display, Georgia, serif', description: 'Font decorativa' },
  'font-family-mono': { value: 'ui-monospace, Menlo, Monaco, monospace', description: 'Font codi' },

  // Font sizes (Tailwind defaults)
  'font-size-xs': { value: '0.75rem', description: '12px - Molt petit' },
  'font-size-sm': { value: '0.875rem', description: '14px - Petit' },
  'font-size-base': { value: '1rem', description: '16px - Base' },
  'font-size-lg': { value: '1.125rem', description: '18px - Gran' },
  'font-size-xl': { value: '1.25rem', description: '20px - Molt gran' },
  'font-size-2xl': { value: '1.5rem', description: '24px - Títol petit' },
  'font-size-3xl': { value: '1.875rem', description: '30px - Títol mig' },
  'font-size-4xl': { value: '2.25rem', description: '36px - Títol gran' },
  'font-size-5xl': { value: '3rem', description: '48px - Hero' },

  // Line heights
  'line-height-none': { value: '1', description: 'Sense espaiat' },
  'line-height-tight': { value: '1.25', description: 'Ajustat' },
  'line-height-snug': { value: '1.375', description: 'Compacte' },
  'line-height-normal': { value: '1.5', description: 'Normal' },
  'line-height-relaxed': { value: '1.625', description: 'Relaxat' },
  'line-height-loose': { value: '2', description: 'Ample' },
}

// Border radius (Tailwind defaults)
const REAL_RADIUS = {
  'radius-none': { value: '0', description: 'Sense radius' },
  'radius-sm': { value: '0.125rem', description: '2px' },
  'radius-default': { value: '0.25rem', description: '4px' },
  'radius-md': { value: '0.375rem', description: '6px' },
  'radius-lg': { value: '0.5rem', description: '8px' },
  'radius-xl': { value: '0.75rem', description: '12px' },
  'radius-2xl': { value: '1rem', description: '16px' },
  'radius-3xl': { value: '1.5rem', description: '24px' },
  'radius-full': { value: '9999px', description: 'Circular' },
}

// Shadows (Tailwind defaults)
const REAL_SHADOWS = {
  'shadow-none': { value: 'none', description: 'Sense ombra' },
  'shadow-sm': { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', description: 'Suau' },
  'shadow-default': { value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', description: 'Normal' },
  'shadow-md': { value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', description: 'Mitjana' },
  'shadow-lg': { value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', description: 'Gran' },
  'shadow-xl': { value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', description: 'Molt gran' },
  'shadow-2xl': { value: '0 25px 50px -12px rgb(0 0 0 / 0.25)', description: 'Màxima' },
}

// Spacing (Tailwind defaults)
const REAL_SPACING = {
  'spacing-0': { value: '0', description: '0px' },
  'spacing-1': { value: '0.25rem', description: '4px' },
  'spacing-2': { value: '0.5rem', description: '8px' },
  'spacing-3': { value: '0.75rem', description: '12px' },
  'spacing-4': { value: '1rem', description: '16px' },
  'spacing-5': { value: '1.25rem', description: '20px' },
  'spacing-6': { value: '1.5rem', description: '24px' },
  'spacing-8': { value: '2rem', description: '32px' },
  'spacing-10': { value: '2.5rem', description: '40px' },
  'spacing-12': { value: '3rem', description: '48px' },
  'spacing-16': { value: '4rem', description: '64px' },
  'spacing-20': { value: '5rem', description: '80px' },
  'spacing-24': { value: '6rem', description: '96px' },
}

// Cards - Tokens per a les cards base
const REAL_CARDS = {
  // Card Base
  'card-background': { value: '#ffffff', description: 'Fons de la card' },
  'card-background-hover': { value: '#fafafa', description: 'Fons en hover' },
  'card-border-color': { value: '#e5e7eb', description: 'Color del border' },
  'card-border-width': { value: '1px', description: 'Gruix del border' },
  'card-border-radius': { value: '0.75rem', description: 'Radius de les cantonades (12px)' },
  'card-shadow': { value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', description: 'Ombra per defecte' },
  'card-shadow-hover': { value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', description: 'Ombra en hover' },

  // Card Header
  'card-header-padding': { value: '1.25rem', description: 'Padding del header (20px)' },
  'card-header-padding-compact': { value: '1rem', description: 'Padding compacte (16px)' },
  'card-header-gap': { value: '0.375rem', description: 'Espai entre elements (6px)' },
  'card-header-border-color': { value: '#f3f4f6', description: 'Border inferior del header' },

  // Card Content
  'card-content-padding': { value: '1.25rem', description: 'Padding del contingut (20px)' },
  'card-content-padding-compact': { value: '1rem', description: 'Padding compacte (16px)' },
  'card-content-padding-large': { value: '1.5rem', description: 'Padding gran (24px)' },

  // Card Footer
  'card-footer-padding': { value: '1rem', description: 'Padding del footer (16px)' },
  'card-footer-background': { value: '#f9fafb', description: 'Fons del footer' },
  'card-footer-border-color': { value: '#f3f4f6', description: 'Border superior del footer' },

  // Card Title
  'card-title-color': { value: '#111827', description: 'Color del títol' },
  'card-title-font-size': { value: '1rem', description: 'Mida del títol (16px)' },
  'card-title-font-weight': { value: '600', description: 'Pes del títol' },
  'card-title-line-height': { value: '1.5rem', description: 'Alçada de línia (24px)' },

  // Card Description
  'card-description-color': { value: '#6b7280', description: 'Color de la descripció' },
  'card-description-font-size': { value: '0.875rem', description: 'Mida descripció (14px)' },

  // Card Variant: Highlighted
  'card-highlighted-border-color': { value: '#3b82f6', description: 'Border de card destacada' },
  'card-highlighted-background': { value: '#eff6ff', description: 'Fons de card destacada' },

  // Card Variant: Interactive
  'card-interactive-hover-border-color': { value: '#3b82f6', description: 'Border en hover interactiu' },
  'card-interactive-hover-shadow': { value: '0 8px 16px -4px rgba(59, 130, 246, 0.2)', description: 'Ombra en hover interactiu' },

  // Card Variant: Interactive Expand
  'card-expand-scale': { value: '1.02', description: 'Escala en hover expand' },
  'card-expand-transition': { value: '300ms', description: 'Duració de la transició' },
  'card-expand-translate-y': { value: '-2px', description: 'Desplaçament vertical' },

  // Card Icon Container
  'card-icon-size': { value: '2.5rem', description: 'Mida del contenidor d\'icona (40px)' },
  'card-icon-background': { value: '#f3f4f6', description: 'Fons del contenidor d\'icona' },
  'card-icon-border-radius': { value: '0.5rem', description: 'Radius de l\'icona (8px)' },
}

export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autoritzat' },
        { status: 401 }
      )
    }

    const counts = {
      colors: 0,
      typography: 0,
      radius: 0,
      shadows: 0,
      spacing: 0,
      cards: 0,
      total: 0
    }

    // Sincronitzar colors
    for (const [name, data] of Object.entries(REAL_COLORS)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'colors', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'colors',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.colors,
        },
      })
      counts.colors++
    }

    // Sincronitzar tipografia
    for (const [name, data] of Object.entries(REAL_TYPOGRAPHY)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'typography', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'typography',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.typography,
        },
      })
      counts.typography++
    }

    // Sincronitzar radius
    for (const [name, data] of Object.entries(REAL_RADIUS)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'radius', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'radius',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.radius,
        },
      })
      counts.radius++
    }

    // Sincronitzar shadows
    for (const [name, data] of Object.entries(REAL_SHADOWS)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'shadows', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'shadows',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.shadows,
        },
      })
      counts.shadows++
    }

    // Sincronitzar spacing
    for (const [name, data] of Object.entries(REAL_SPACING)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'spacing', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'spacing',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.spacing,
        },
      })
      counts.spacing++
    }

    // Sincronitzar cards
    for (const [name, data] of Object.entries(REAL_CARDS)) {
      await prisma.designToken.upsert({
        where: { category_name: { category: 'cards', name } },
        update: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
        create: {
          category: 'cards',
          name,
          value: data.value,
          cssVariable: `--${name}`,
          description: data.description,
          isDefault: true,
          order: counts.cards,
        },
      })
      counts.cards++
    }

    counts.total = counts.colors + counts.typography + counts.radius + counts.shadows + counts.spacing + counts.cards

    revalidatePath('/admin/componentes')

    return NextResponse.json({
      success: true,
      message: `Sincronitzat amb els estils reals de la web`,
      counts,
    })
  } catch (error) {
    console.error('Error syncing design system:', error)
    return NextResponse.json(
      { error: 'Error sincronitzant el Design System' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No autoritzat' },
        { status: 401 }
      )
    }

    // Retornar els tokens que es sincronitzarien
    return NextResponse.json({
      colors: REAL_COLORS,
      typography: REAL_TYPOGRAPHY,
      radius: REAL_RADIUS,
      shadows: REAL_SHADOWS,
      spacing: REAL_SPACING,
      cards: REAL_CARDS,
    })
  } catch (error) {
    console.error('Error fetching sync data:', error)
    return NextResponse.json(
      { error: 'Error obtenint dades' },
      { status: 500 }
    )
  }
}
