import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Enable in production only
  enabled: process.env.NODE_ENV === 'production',

  // Enable logs per .cursorrules
  enableLogs: true,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],

  // Scrub sensitive data
  beforeSend(event) {
    // Remove Authorization headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['authorization'];
    }

    // Scrub request data that may contain PII
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      
      // Remove passwords
      if ('password' in data) {
        data.password = '[REDACTED]';
      }
      if ('temporaryPassword' in data) {
        data.temporaryPassword = '[REDACTED]';
      }

      // Remove email in request body (use userId instead for tracking)
      if ('email' in data) {
        data.email = '[REDACTED]';
      }

      // Remove user message content from coach endpoints
      if ('message' in data && typeof data.message === 'string') {
        data.message = `[REDACTED - length: ${(data.message as string).length}]`;
      }

      // Remove auth tokens
      if ('idToken' in data) {
        data.idToken = '[REDACTED]';
      }
    }

    // Remove cookies that may contain tokens
    if (event.request?.cookies) {
      delete event.request.cookies['next-auth.session-token'];
      delete event.request.cookies['__Secure-next-auth.session-token'];
    }

    return event;
  },
});
