'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatCardProps } from './StatCard';

interface StatCardGridProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatCardGrid({ children, className }: Readonly<StatCardGridProps>) {
  return (
    <dl className={cn("mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </dl>
  );
}

export function useStatCardData<T>(
  data: T[],
  mapFn: (item: T) => Omit<StatCardProps, 'id'> & { id?: string | number }
): StatCardProps[] {
  return data.map((item, index) => ({
    id: `stat-${index}`,
    ...mapFn(item),
  }));
} 