/**
 * Legal page configuration
 * Provides env-driven contact information for Privacy Policy and Terms of Service
 */

/**
 * Get the privacy/legal contact email from environment
 * Falls back to support email if not set
 */
export function getPrivacyEmail(): string | null {
  return process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;
}

/**
 * Get the general support email from environment
 */
export function getSupportEmail(): string | null {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;
}

/**
 * Check if contact emails are configured
 */
export function hasContactEmails(): boolean {
  return !!(getPrivacyEmail() || getSupportEmail());
}

/**
 * Get contact method display text
 * Returns mailto link if email is configured, otherwise returns generic text
 */
export function getContactMethodText(t: (key: string) => string): {
  hasEmail: boolean;
  email: string | null;
  text: string;
} {
  const email = getPrivacyEmail();
  
  if (email) {
    return {
      hasEmail: true,
      email,
      text: t('contactEmail'),
    };
  }
  
  return {
    hasEmail: false,
    email: null,
    text: t('contactGeneric'),
  };
}
