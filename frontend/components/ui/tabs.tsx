'use client';

import { ReactNode, createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Tabs({ children, value, onValueChange, className = '', style }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} style={{ width: '100%', ...style }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function TabsList({ children, className = '', style }: TabsListProps) {
  const listStyles: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid var(--Tabs-border-color, #e5e7eb)',
    gap: 'var(--Tabs-gap, 0)',
    ...style,
  };

  return (
    <div className={className} style={listStyles}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TabsTrigger({ children, value, className = '', style }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  const triggerStyles: React.CSSProperties = {
    padding: 'var(--Tabs-trigger-padding, 8px 16px)',
    fontSize: 'var(--Tabs-trigger-font-size, 14px)',
    fontWeight: 'var(--Tabs-trigger-font-weight, 500)' as any,
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: isActive
      ? 'var(--Tabs-active-border-color, #2563eb)'
      : 'transparent',
    color: isActive
      ? 'var(--Tabs-active-color, #2563eb)'
      : 'var(--Tabs-inactive-color, #6b7280)',
    ...style,
  };

  return (
    <button
      className={className}
      style={triggerStyles}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  children: ReactNode;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export function TabsContent({ children, value, className = '', style }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  const contentStyles: React.CSSProperties = {
    paddingTop: 'var(--Tabs-content-padding, 16px)',
    ...style,
  };

  return (
    <div className={className} style={contentStyles}>
      {children}
    </div>
  );
}
