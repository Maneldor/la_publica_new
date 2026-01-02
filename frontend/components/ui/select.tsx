"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const triggerStyles: React.CSSProperties = {
  display: 'flex',
  height: 'var(--Select-height, 40px)',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 'var(--Select-border-radius, 6px)',
  border: '1px solid var(--Select-border-color, #e2e8f0)',
  backgroundColor: 'var(--Select-background, #ffffff)',
  padding: 'var(--Select-padding, 8px 12px)',
  fontSize: 'var(--Select-font-size, 14px)',
  color: 'var(--Select-color, #0f172a)',
  outline: 'none',
  cursor: 'pointer',
}

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, style, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "ring-offset-white focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
        )}
        style={{ ...triggerStyles, ...style }}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown style={{
              width: '16px',
              height: '16px',
              opacity: 0.5,
              color: 'var(--Select-icon-color, currentColor)',
            }} />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const scrollButtonStyles: React.CSSProperties = {
  display: 'flex',
  cursor: 'default',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 0',
}

const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, style, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
        ref={ref}
        className={className}
        style={{ ...scrollButtonStyles, ...style }}
        {...props}
    >
        <ChevronUp style={{ width: '16px', height: '16px' }} />
    </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, style, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
        ref={ref}
        className={className}
        style={{ ...scrollButtonStyles, ...style }}
        {...props}
    >
        <ChevronDown style={{ width: '16px', height: '16px' }} />
    </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName

const contentStyles: React.CSSProperties = {
  position: 'relative',
  zIndex: 50,
  maxHeight: '384px',
  minWidth: '8rem',
  overflow: 'hidden',
  borderRadius: 'var(--Select-content-border-radius, 6px)',
  border: '1px solid var(--Select-content-border-color, #e2e8f0)',
  backgroundColor: 'var(--Select-content-background, #ffffff)',
  color: 'var(--Select-content-color, #0f172a)',
  boxShadow: 'var(--Select-content-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
}

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", style, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className
            )}
            style={{ ...contentStyles, ...style }}
            position={position}
            {...props}
        >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
                className={cn(
                    "p-1",
                    position === "popper" &&
                    "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const labelStyles: React.CSSProperties = {
  padding: '6px 8px 6px 32px',
  fontSize: 'var(--Select-label-font-size, 14px)',
  fontWeight: 600,
  color: 'var(--Select-label-color, #64748b)',
}

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, style, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={className}
        style={{ ...labelStyles, ...style }}
        {...props}
    />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const itemStyles: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  width: '100%',
  cursor: 'default',
  userSelect: 'none',
  alignItems: 'center',
  borderRadius: 'var(--Select-item-border-radius, 4px)',
  padding: '6px 8px 6px 32px',
  fontSize: 'var(--Select-item-font-size, 14px)',
  outline: 'none',
}

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, style, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        style={{ ...itemStyles, ...style }}
        {...props}
    >
        <span style={{
          position: 'absolute',
          left: '8px',
          display: 'flex',
          height: '14px',
          width: '14px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
            <SelectPrimitive.ItemIndicator>
                <Check style={{
                  width: '16px',
                  height: '16px',
                  color: 'var(--Select-check-color, #2563eb)',
                }} />
            </SelectPrimitive.ItemIndicator>
        </span>

        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const separatorStyles: React.CSSProperties = {
  margin: '4px -4px',
  height: '1px',
  backgroundColor: 'var(--Select-separator-color, #f1f5f9)',
}

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, style, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={className}
        style={{ ...separatorStyles, ...style }}
        {...props}
    />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
}
