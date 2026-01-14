'use client';

import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { isAnalyticsConsentGranted } from '@/lib/privacy/consent';

export function Analytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check consent on mount and when window focuses (in case consent changed in another tab)
    const checkConsent = () => {
      setHasConsent(isAnalyticsConsentGranted());
    };

    checkConsent();
    window.addEventListener('focus', checkConsent);
    
    // Also listen for consent updates via custom event
    const handleConsentUpdate = () => checkConsent();
    window.addEventListener('consent_update', handleConsentUpdate);

    return () => {
      window.removeEventListener('focus', checkConsent);
      window.removeEventListener('consent_update', handleConsentUpdate);
    };
  }, []);

  // Only render analytics if consent is granted
  if (!hasConsent) {
    return null;
  }

  return <VercelAnalytics />;
} 