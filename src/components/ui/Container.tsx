import { ReactNode, ElementType } from 'react';

interface ContainerProps<T extends ElementType = 'div'> {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: T;
  readonly maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full' | 'none';
  readonly padding?: boolean;
}

export function Container<T extends ElementType = 'div'>({
  children,
  className = '',
  as,
  maxWidth = '7xl',
  padding = true,
}: ContainerProps<T>) {
  const Component = as ?? 'div';
  
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
    none: '',
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  
  return (
    <Component className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses} ${className}`}>
      {children}
    </Component>
  );
} 