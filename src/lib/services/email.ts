import { Resend } from 'resend';
import { ReactElement } from 'react';
import { getTranslations } from 'next-intl/server';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  data?: {
    id: string;
  };
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const { data, error } = await resend.emails.send({
      from: options.from ?? 'Toulmin Lab <noreply@updates.toulmin.app>',
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      data: data ? { id: data.id } : undefined,
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send user invitation email
 */
export async function sendUserInvitation(
  to: string,
  inviterName: string,
  userRole: string,
  temporaryPassword: string | null,
  locale: string = 'en'
): Promise<EmailResponse> {
  // Dynamic import to avoid circular dependencies and ensure client-side compatibility
  const { UserInvitationEmail } = await import('@/components/email-templates/UserInvitationEmail');
  
  // Get translations for email subject using server-side next-intl
  const t = await getTranslations({ locale, namespace: 'email.invitation' });
  const subject = t('subject');

  // Await the async email component
  const emailComponent = await UserInvitationEmail({
    inviterName,
    userRole,
    temporaryPassword,
    locale,
  });

  return sendEmail({
    to,
    subject,
    react: emailComponent,
  });
} 