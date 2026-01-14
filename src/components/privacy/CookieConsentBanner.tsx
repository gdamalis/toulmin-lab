'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  hasConsentChoice,
  grantConsent,
  denyConsent,
} from '@/lib/privacy/consent';
import { useTranslations } from 'next-intl';

export function CookieConsentBanner() {
  const t = useTranslations('privacy.consent');
  const [showBanner, setShowBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Show banner if user hasn't made a choice
    if (!hasConsentChoice()) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    grantConsent();
    setShowBanner(false);
  };

  const handleReject = () => {
    denyConsent();
    setShowBanner(false);
  };

  // Don't render anything during SSR or if banner shouldn't show
  if (!isClient || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {t('message')}{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary-600 hover:text-primary-500 underline"
                  >
                    {t('privacyPolicy')}
                  </Link>
                  .
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReject}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {t('reject')}
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {t('accept')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Cookie settings button/link component
 * Can be used in footer or settings page to reopen consent banner
 */
export function CookieSettingsButton() {
  const t = useTranslations('privacy.consent');

  const handleOpenSettings = () => {
    // Remove the consent cookie to show banner again
    document.cookie = 'tl_analytics_consent=; max-age=0; path=/';
    // Reload page to show banner
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleOpenSettings}
      className="text-sm text-gray-300 hover:text-white transition-colors"
    >
      {t('cookieSettings')}
    </button>
  );
}
