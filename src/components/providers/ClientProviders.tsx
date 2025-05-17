'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationLoader } from '@/components/navigation';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthProvider>
        <NotificationProvider>
          <NavigationProvider>
            <NavigationLoader />
            {children}
          </NavigationProvider>
        </NotificationProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 