"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ElementType, ReactNode } from "react";
import { useTranslations } from "next-intl";

export interface StatCardProps {
  readonly id: number | string;
  readonly name: string;
  readonly stat: string;
  readonly icon: ElementType;
  readonly change?: string;
  readonly changeType?: "increase" | "decrease" | "neutral";
  readonly description?: string;
  readonly href?: string;
  readonly linkText?: string;
  readonly className?: string;
}
interface StatCardGridProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatCard({
  id,
  name,
  stat,
  icon: Icon,
  change,
  changeType = "neutral",
  description,
  href,
  linkText,
  className,
}: StatCardProps) {
  const t = useTranslations('stats');
  const commonT = useTranslations('common');
  
  const colorMap = {
    increase: "text-green-600",
    decrease: "text-red-600",
    neutral: "text-gray-500"
  };
  
  const changeColorClass = colorMap[changeType];
  
  const iconMap = {
    increase: <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" aria-hidden="true" />,
    decrease: <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" aria-hidden="true" />,
    neutral: null
  };
  
  const changeIcon = iconMap[changeType];

  return (
    <div
      id={String(id)}
      className={cn(
        "relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6 border border-gray-200",
        className
      )}
    >
      <dt>
        <div className="absolute rounded-md bg-primary-500 p-3">
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">
          {name}
        </p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
        <p className="text-2xl font-semibold text-gray-900">{stat}</p>
        {change && (
          <p
            className={cn(
              changeColorClass,
              "ml-2 flex items-baseline text-sm font-semibold"
            )}
          >
            {changeIcon}
            <span className="sr-only">
              {changeType === 'increase' ? t('increasedBy') : 
               changeType === 'decrease' ? t('decreasedBy') : ''}
            </span>
            {change}
          </p>
        )}
        {description && (
          <p className="ml-2 text-sm text-gray-500 truncate">{description}</p>
        )}
        {href && linkText && (
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href={href}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {linkText}
                <span className="sr-only"> {name} {commonT('stats')}</span>
              </Link>
            </div>
          </div>
        )}
      </dd>
    </div>
  );
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