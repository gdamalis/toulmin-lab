'use client';

import { useNavigation } from '@/contexts/NavigationContext';
import { Loader } from '@/components/ui/Loader';
import { useTranslations } from 'next-intl';

export function NavigationLoader() {
  const { isNavigating } = useNavigation();
  const t = useTranslations('common');
  
  if (!isNavigating) return null;
  
  return (
    <Loader 
      fullScreen 
      text={t('loading')} 
      className="z-[100]" // Ensure loader is above everything else
    />
  );
} 