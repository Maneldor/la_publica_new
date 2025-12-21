import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconColor =
  | 'indigo'
  | 'blue'
  | 'green'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'red'
  | 'violet'
  | 'purple'
  | 'pink'
  | 'gray'
  | 'slate'
  | 'cyan'
  | 'teal'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface IconWrapperProps {
  icon: LucideIcon
  color?: IconColor
  size?: IconSize
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

// Mapeo de colores
const colorStyles: Record<IconColor, Record<string, string>> = {
  indigo: {
    filled: 'bg-indigo-500 text-white',
    light: 'bg-indigo-100 text-indigo-600',
    outline: 'border-2 border-indigo-500 text-indigo-500',
    ghost: 'text-indigo-500',
  },
  blue: {
    filled: 'bg-blue-500 text-white',
    light: 'bg-blue-100 text-blue-600',
    outline: 'border-2 border-blue-500 text-blue-500',
    ghost: 'text-blue-500',
  },
  green: {
    filled: 'bg-green-500 text-white',
    light: 'bg-green-100 text-green-600',
    outline: 'border-2 border-green-500 text-green-500',
    ghost: 'text-green-500',
  },
  emerald: {
    filled: 'bg-emerald-500 text-white',
    light: 'bg-emerald-100 text-emerald-600',
    outline: 'border-2 border-emerald-500 text-emerald-500',
    ghost: 'text-emerald-500',
  },
  amber: {
    filled: 'bg-amber-500 text-white',
    light: 'bg-amber-100 text-amber-600',
    outline: 'border-2 border-amber-500 text-amber-500',
    ghost: 'text-amber-500',
  },
  orange: {
    filled: 'bg-orange-500 text-white',
    light: 'bg-orange-100 text-orange-600',
    outline: 'border-2 border-orange-500 text-orange-500',
    ghost: 'text-orange-500',
  },
  red: {
    filled: 'bg-red-500 text-white',
    light: 'bg-red-100 text-red-600',
    outline: 'border-2 border-red-500 text-red-500',
    ghost: 'text-red-500',
  },
  violet: {
    filled: 'bg-violet-500 text-white',
    light: 'bg-violet-100 text-violet-600',
    outline: 'border-2 border-violet-500 text-violet-500',
    ghost: 'text-violet-500',
  },
  purple: {
    filled: 'bg-purple-500 text-white',
    light: 'bg-purple-100 text-purple-600',
    outline: 'border-2 border-purple-500 text-purple-500',
    ghost: 'text-purple-500',
  },
  pink: {
    filled: 'bg-pink-500 text-white',
    light: 'bg-pink-100 text-pink-600',
    outline: 'border-2 border-pink-500 text-pink-500',
    ghost: 'text-pink-500',
  },
  gray: {
    filled: 'bg-gray-500 text-white',
    light: 'bg-gray-100 text-gray-600',
    outline: 'border-2 border-gray-500 text-gray-500',
    ghost: 'text-gray-500',
  },
  slate: {
    filled: 'bg-slate-500 text-white',
    light: 'bg-slate-100 text-slate-600',
    outline: 'border-2 border-slate-500 text-slate-500',
    ghost: 'text-slate-500',
  },
  cyan: {
    filled: 'bg-cyan-500 text-white',
    light: 'bg-cyan-100 text-cyan-600',
    outline: 'border-2 border-cyan-500 text-cyan-500',
    ghost: 'text-cyan-500',
  },
  teal: {
    filled: 'bg-teal-500 text-white',
    light: 'bg-teal-100 text-teal-600',
    outline: 'border-2 border-teal-500 text-teal-500',
    ghost: 'text-teal-500',
  },
}

// Mapeo de tamaños
const sizeStyles: Record<IconSize, { wrapper: string; icon: string }> = {
  xs: { wrapper: 'w-6 h-6', icon: 'w-3 h-3' },
  sm: { wrapper: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { wrapper: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { wrapper: 'w-12 h-12', icon: 'w-6 h-6' },
  xl: { wrapper: 'w-14 h-14', icon: 'w-7 h-7' },
}

export function IconWrapper({
  icon: Icon,
  color = 'indigo',
  size = 'md',
  variant = 'light',
  className,
}: IconWrapperProps) {
  const colorStyle = colorStyles[color][variant]
  const sizeStyle = sizeStyles[size]

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
        colorStyle,
        sizeStyle.wrapper,
        className
      )}
    >
      <Icon className={sizeStyle.icon} />
    </div>
  )
}

export default IconWrapper
