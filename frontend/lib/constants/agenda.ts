// Event categories with their visual styles
export const EVENT_CATEGORIES = [
  {
    id: 'personal',
    name: 'Personal',
    color: '#3B82F6',
    bgColor: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500'
  },
  {
    id: 'feina',
    name: 'Feina',
    color: '#A855F7',
    bgColor: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500'
  },
  {
    id: 'salut',
    name: 'Salut',
    color: '#22C55E',
    bgColor: 'bg-green-500',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-500'
  },
  {
    id: 'social',
    name: 'Social',
    color: '#F97316',
    bgColor: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500'
  },
  {
    id: 'formacio',
    name: 'Formacio',
    color: '#EAB308',
    bgColor: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-500'
  },
  {
    id: 'altres',
    name: 'Altres',
    color: '#6B7280',
    bgColor: 'bg-gray-500',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-500'
  },
] as const

export type EventCategoryId = typeof EVENT_CATEGORIES[number]['id']

export type CategoryStyles = {
  bgColor: string
  bgLight: string
  textColor: string
  borderColor: string
  color: string
  name: string
  id: string
}

export function getCategoryById(id: string | undefined): CategoryStyles {
  const category = EVENT_CATEGORIES.find(cat => cat.id === id)
  if (category) {
    return category
  }
  // Default to 'altres' if not found
  return EVENT_CATEGORIES[5]
}

export function getCategoryColor(categoryId: string | undefined): string {
  return getCategoryById(categoryId).color
}

export function getCategoryStyles(categoryId: string | undefined): CategoryStyles {
  return getCategoryById(categoryId)
}

// Categories amb colors (usades a la pàgina d'agenda)
export const CATEGORIES = [
  { id: 'personal', name: 'Personal', color: '#22C55E', bgClass: 'bg-green-500', bgLight: 'bg-green-100', textClass: 'text-green-700', borderClass: 'border-green-500' },
  { id: 'work', name: 'Feina', color: '#3B82F6', bgClass: 'bg-blue-500', bgLight: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-500' },
  { id: 'health', name: 'Salut', color: '#EF4444', bgClass: 'bg-red-500', bgLight: 'bg-red-100', textClass: 'text-red-700', borderClass: 'border-red-500' },
  { id: 'social', name: 'Social', color: '#A855F7', bgClass: 'bg-purple-500', bgLight: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-500' },
  { id: 'other', name: 'Altres', color: '#F97316', bgClass: 'bg-orange-500', bgLight: 'bg-orange-100', textClass: 'text-orange-700', borderClass: 'border-orange-500' },
] as const

export function getCategoryStyle(categoryId: string) {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[4]
}

// Tipus d'esdeveniment de l'agenda
export interface AgendaEvent {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string | null
  endTime: string | null
  allDay: boolean
  category: string
  reminder: boolean
  location: string | null
}
