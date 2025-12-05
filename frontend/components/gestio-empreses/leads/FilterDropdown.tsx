// components/gestio-empreses/leads/FilterDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  color?: string
}

interface FilterDropdownProps {
  label: string
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  multiple?: boolean
  searchable?: boolean
  placeholder?: string
}

export function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiple = true,
  searchable = true,
  placeholder = 'Seleccionar...',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value))
      } else {
        onChange([...selected, value])
      }
    } else {
      onChange(selected.includes(value) ? [] : [value])
      setIsOpen(false)
    }
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors min-w-[140px]',
          selected.length > 0
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
        )}
      >
        <span className="flex-1 text-left truncate">
          {selected.length === 0 && label}
          {selected.length === 1 && options.find((o) => o.value === selected[0])?.label}
          {selected.length > 1 && `${label} (${selected.length})`}
        </span>
        {selected.length > 0 ? (
          <X
            className="h-4 w-4 text-blue-500 hover:text-blue-700"
            strokeWidth={1.5}
            onClick={clearAll}
          />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
          {searchable && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cercar..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">Cap resultat</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                    selected.includes(option.value) && 'bg-blue-50'
                  )}
                >
                  <div className={cn(
                    'h-4 w-4 rounded border flex items-center justify-center',
                    selected.includes(option.value)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300'
                  )}>
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" strokeWidth={2} />
                    )}
                  </div>
                  {option.color && (
                    <span className={cn('w-2 h-2 rounded-full', option.color)} />
                  )}
                  <span className="flex-1 text-left text-slate-700">{option.label}</span>
                </button>
              ))
            )}
          </div>

          {multiple && selected.length > 0 && (
            <div className="border-t border-slate-100 mt-2 pt-2 px-3">
              <button
                onClick={() => onChange([])}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Netejar selecció
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}