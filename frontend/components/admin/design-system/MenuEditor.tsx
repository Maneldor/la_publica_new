'use client'

import { useState, useEffect } from 'react'
import {
  Menu,
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  Link2,
  Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MenuItem {
  id: string
  label: string
  href: string
  icon?: string
  visible: boolean
  order: number
  children?: MenuItem[]
}

export interface MenuConfig {
  name: string
  displayName: string
  description?: string
  items: MenuItem[]
}

interface MenuEditorProps {
  menu: MenuConfig
  onChange: (menu: MenuConfig) => void
  onSave?: () => void
  onReset?: () => void
}

export function MenuEditor({ menu, onChange, onSave, onReset }: MenuEditorProps) {
  const [localMenu, setLocalMenu] = useState(menu)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    setLocalMenu(menu)
  }, [menu])

  const handleItemChange = (itemId: string, field: keyof MenuItem, value: unknown) => {
    const updateItem = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, [field]: value }
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) }
        }
        return item
      })
    }

    const updated = { ...localMenu, items: updateItem(localMenu.items) }
    setLocalMenu(updated)
    onChange(updated)
  }

  const addMenuItem = (parentId?: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: 'Nou element',
      href: '#',
      visible: true,
      order: localMenu.items.length,
    }

    if (parentId) {
      const addToParent = (items: MenuItem[]): MenuItem[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newItem]
            }
          }
          if (item.children) {
            return { ...item, children: addToParent(item.children) }
          }
          return item
        })
      }
      const updated = { ...localMenu, items: addToParent(localMenu.items) }
      setLocalMenu(updated)
      onChange(updated)
    } else {
      const updated = { ...localMenu, items: [...localMenu.items, newItem] }
      setLocalMenu(updated)
      onChange(updated)
    }
  }

  const removeMenuItem = (itemId: string) => {
    const removeItem = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => {
          if (item.children) {
            return { ...item, children: removeItem(item.children) }
          }
          return item
        })
    }

    const updated = { ...localMenu, items: removeItem(localMenu.items) }
    setLocalMenu(updated)
    onChange(updated)
  }

  const toggleItemVisibility = (itemId: string) => {
    const toggleVisible = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, visible: !item.visible }
        }
        if (item.children) {
          return { ...item, children: toggleVisible(item.children) }
        }
        return item
      })
    }

    const updated = { ...localMenu, items: toggleVisible(localMenu.items) }
    setLocalMenu(updated)
    onChange(updated)
  }

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const moveInArray = (items: MenuItem[]): MenuItem[] => {
      const index = items.findIndex(item => item.id === itemId)
      if (index === -1) {
        return items.map(item => {
          if (item.children) {
            return { ...item, children: moveInArray(item.children) }
          }
          return item
        })
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length) return items

      const newItems = [...items]
      const [removed] = newItems.splice(index, 1)
      newItems.splice(newIndex, 0, removed)
      return newItems.map((item, i) => ({ ...item, order: i }))
    }

    const updated = { ...localMenu, items: moveInArray(localMenu.items) }
    setLocalMenu(updated)
    onChange(updated)
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const isExpanded = expandedItems.includes(item.id)
    const isSelected = selectedItem === item.id
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} className="select-none">
        <div
          className={cn(
            'flex items-center gap-2 p-3 rounded-lg transition-colors',
            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50',
            !item.visible && 'opacity-50'
          )}
          style={{ marginLeft: depth * 24 }}
        >
          {/* Drag Handle */}
          <button className="p-1 cursor-grab hover:bg-slate-200 rounded">
            <GripVertical className="h-4 w-4 text-slate-400" />
          </button>

          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => setExpandedItems(prev =>
                prev.includes(item.id)
                  ? prev.filter(id => id !== item.id)
                  : [...prev, item.id]
              )}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Label */}
          <input
            type="text"
            value={item.label}
            onChange={(e) => handleItemChange(item.id, 'label', e.target.value)}
            className="flex-1 px-2 py-1 text-sm font-medium text-slate-900 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
          />

          {/* Href */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-mono">
            <Link2 className="h-3 w-3" />
            <input
              type="text"
              value={item.href}
              onChange={(e) => handleItemChange(item.id, 'href', e.target.value)}
              className="w-24 bg-transparent border-0 focus:ring-0 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleItemVisibility(item.id)}
              className={cn(
                'p-1.5 rounded transition-colors',
                item.visible
                  ? 'text-slate-500 hover:bg-slate-200'
                  : 'text-slate-300 hover:bg-slate-100'
              )}
              title={item.visible ? 'Amagar' : 'Mostrar'}
            >
              {item.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => addMenuItem(item.id)}
              className="p-1.5 text-slate-500 hover:bg-slate-200 rounded"
              title="Afegir subelement"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => removeMenuItem(item.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Menu Info */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Menu className="h-5 w-5 text-slate-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{localMenu.displayName}</h3>
          {localMenu.description && (
            <p className="text-sm text-slate-500">{localMenu.description}</p>
          )}
        </div>
        <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 font-mono">
          {localMenu.name}
        </span>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Elements del menú
          </span>
          <button
            onClick={() => addMenuItem()}
            className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            <Plus className="h-4 w-4" />
            Afegir
          </button>
        </div>
        <div className="p-4 space-y-2">
          {localMenu.items.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Menu className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No hi ha elements al menú</p>
              <button
                onClick={() => addMenuItem()}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Afegir primer element
              </button>
            </div>
          ) : (
            localMenu.items.map(item => renderMenuItem(item))
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-700">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Preview</span>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            {localMenu.items
              .filter(item => item.visible)
              .map(item => (
                <div key={item.id}>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg text-sm"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </a>
                  {item.children?.filter(c => c.visible).map(child => (
                    <a
                      key={child.id}
                      href="#"
                      className="flex items-center gap-3 px-3 py-2 ml-6 text-slate-400 hover:bg-slate-800 rounded-lg text-sm"
                    >
                      {child.icon && <span>{child.icon}</span>}
                      {child.label}
                    </a>
                  ))}
                </div>
              ))}
          </nav>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ml-auto"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        )}
      </div>
    </div>
  )
}

// Menu selector component
interface MenuSelectorProps {
  menus: MenuConfig[]
  selectedMenu?: string
  onSelect: (menu: MenuConfig) => void
}

export function MenuSelector({ menus, selectedMenu, onSelect }: MenuSelectorProps) {
  return (
    <div className="space-y-2">
      {menus.map((menu) => (
        <button
          key={menu.name}
          onClick={() => onSelect(menu)}
          className={cn(
            'w-full p-4 rounded-xl border-2 text-left transition-all',
            selectedMenu === menu.name
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Menu className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{menu.displayName}</p>
              <p className="text-sm text-slate-500">{menu.items.length} elements</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
