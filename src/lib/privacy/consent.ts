/**
 * Cookie consent management for analytics and tracking
 * Implements Google Consent Mode v2 for GTM/GA4
 */

export type ConsentState = 'granted' | 'denied' | 'pending';

export interface ConsentPreferences {
  analytics: ConsentState;
  timestamp: number;
}

const CONSENT_COOKIE_NAME = 'tl_analytics_consent';
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Get current consent preferences from cookie
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
    ?.split('=')[1];

  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

/**
 * Save consent preferences to cookie
 */
export function saveConsentPreferences(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;

  const cookieValue = encodeURIComponent(JSON.stringify(preferences));
  document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; max-age=${CONSENT_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

/**
 * Grant analytics consent
 */
export function grantConsent(): void {
  const preferences: ConsentPreferences = {
    analytics: 'granted',
    timestamp: Date.now(),
  };
  saveConsentPreferences(preferences);
  updateGoogleConsentMode('granted');
}

/**
 * Deny analytics consent
 */
export function denyConsent(): void {
  const preferences: ConsentPreferences = {
    analytics: 'denied',
    timestamp: Date.now(),
  };
  saveConsentPreferences(preferences);
  updateGoogleConsentMode('denied');
}

/**
 * Check if user has already made a consent choice
 */
export function hasConsentChoice(): boolean {
  const prefs = getConsentPreferences();
  return prefs !== null && prefs.analytics !== 'pending';
}

/**
 * Check if analytics consent is granted
 */
export function isAnalyticsConsentGranted(): boolean {
  const prefs = getConsentPreferences();
  return prefs?.analytics === 'granted';
}

/**
 * Update Google Consent Mode (v2)
 * This should be called when consent state changes
 */
function updateGoogleConsentMode(state: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Update consent state
  window.dataLayer.push({
    event: 'consent_update',
    consent: {
      analytics_storage: state,
      ad_storage: 'denied', // We don't use ads
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted', // Required for security
    },
  });

  // Dispatch custom event for other components to react to consent changes
  window.dispatchEvent(new Event('consent_update'));
}

/**
 * Initialize Google Consent Mode defaults (call before GTM loads)
 */
export function initializeConsentDefaults(): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  // Set default consent to denied (will be updated if user has already consented)
  window.dataLayer.push({
    event: 'consent_default',
    consent: {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500, // Wait 500ms for consent choice
    },
  });

  // If user has already granted consent, update immediately
  if (isAnalyticsConsentGranted()) {
    updateGoogleConsentMode('granted');
  }
}

/**
 * Type augmentation for window.dataLayer
 */
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
