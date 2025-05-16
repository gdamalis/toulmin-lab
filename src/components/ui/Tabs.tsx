'use client';

import { useState, ReactNode, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
}: Readonly<TabsProps>) {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  
  const currentValue = value ?? selectedValue;
  const handleValueChange = onValueChange ?? setSelectedValue;
  
  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
      }}
    >
      <div className={cn('', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: Readonly<TabsListProps>) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-gray-100 p-1',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({
  children,
  value,
  className,
  disabled = false,
}: Readonly<TabsTriggerProps>) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isSelected = context.value === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-primary-600 shadow'
          : 'text-gray-500 hover:text-gray-900',
        className
      )}
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
}

export function TabsContent({
  children,
  value,
  className,
}: Readonly<TabsContentProps>) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const isSelected = context.value === value;
  
  if (!isSelected) return null;
  
  return (
    <div
      role="tabpanel"
      className={cn('mt-2', className)}
    >
      {children}
    </div>
  );
} 