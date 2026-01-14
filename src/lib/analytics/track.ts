/**
 * Analytics tracking helper for GTM/GA4
 * 
 * Provides a consistent interface for tracking events across the application.
 * Only tracks events if user has granted analytics consent.
 */

import { isAnalyticsConsentGranted } from '@/lib/privacy/consent';

/**
 * Allowed event parameter keys (allowlist for privacy/PII protection)
 */
const ALLOWED_PARAM_KEYS = new Set([
  'method',
  'mode',
  'location',
  'tab',
  'format',
  'source',
  'result',
  'step',
  'feature',
  'status',
  'error_type',
  'http_status',
  'duration_ms',
  'locale',
  'role',
  'auth_state',
]);

/**
 * Blocked parameter keys (PII and sensitive data)
 */
const BLOCKED_PARAM_KEYS = new Set([
  'email',
  'name',
  'message',
  'content',
  'password',
  'token',
  'uid',
  'user_id',
  'userId',
  'id',
  'session_id',
  'sessionId',
]);

/**
 * Event parameters type (strongly typed allowlist)
 */
export interface TrackEventParams {
  method?: string;
  mode?: string;
  location?: string;
  tab?: string;
  format?: string;
  source?: string;
  result?: string;
  step?: string;
  feature?: string;
  status?: string;
  error_type?: string;
  http_status?: number;
  duration_ms?: number;
  locale?: string;
  role?: string;
  auth_state?: 'anonymous' | 'signed_in';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Sanitize event parameters to remove PII and enforce allowlist
 */
function sanitizeParams(params: TrackEventParams): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Block explicitly forbidden keys
    if (BLOCKED_PARAM_KEYS.has(key)) {
      console.warn(`[Analytics] Blocked parameter "${key}" (PII/sensitive data)`);
      continue;
    }

    // Warn if key is not in allowlist (but still allow it for flexibility)
    if (!ALLOWED_PARAM_KEYS.has(key)) {
      console.warn(`[Analytics] Parameter "${key}" is not in allowlist. Consider adding it or using a standard key.`);
    }

    // Only include defined, non-null values
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Track an event to GTM/GA4 dataLayer
 * 
 * @param eventName - The event name (use dot-notation: "page.view", "auth.started")
 * @param params - Event parameters (will be sanitized)
 * 
 * @example
 * ```ts
 * trackEvent('argument.save_success', { format: 'manual' });
 * trackEvent('coach.message_sent', { step: 'claim' });
 * ```
 */
export function trackEvent(eventName: string, params?: TrackEventParams): void {
  // Only track if consent is granted
  if (!isAnalyticsConsentGranted()) {
    return;
  }

  // Ensure dataLayer exists
  if (typeof window === 'undefined' || !window.dataLayer) {
    console.warn('[Analytics] dataLayer not available');
    return;
  }

  // Sanitize parameters
  const sanitizedParams = params ? sanitizeParams(params) : {};

  // Push event to dataLayer
  try {
    window.dataLayer.push({
      event: eventName,
      ...sanitizedParams,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track a page view event
 * 
 * @param path - The page path
 * @param params - Additional parameters
 */
export function trackPageView(path: string, params?: TrackEventParams): void {
  trackEvent('page.view', {
    ...params,
    location: path,
  });
}

/**
 * Type augmentation for window.dataLayer
 */
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
