import * as Sentry from '@sentry/nextjs';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Additional context for logging
 */
export interface LogContext {
  userId?: string;
  sessionId?: string;
  argumentId?: string;
  step?: string;
  errorCode?: string;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Structured logger with Sentry integration
 * 
 * Usage:
 *   logger.error('Failed to create user', { userId, errorCode: 'USER_CREATE_FAILED' });
 *   logger.info('Argument created', { argumentId, userId });
 */
class Logger {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, context ?? '');
    }
  }

  /**
   * Info logging
   */
  info(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, context ?? '');
    }
    // In production, we generally don't log info to reduce noise
  }

  /**
   * Warning logging
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context ?? '');
    
    if (this.isProduction && Sentry) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  /**
   * Error logging with Sentry integration
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context ?? '');
    
    if (this.isProduction && Sentry) {
      // If error is an Error object, capture it with additional context
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            message,
            ...context,
          },
        });
      } else {
        // Otherwise capture as a message with error details
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error,
            ...context,
          },
        });
      }
    }
  }

  /**
   * Set user context for Sentry
   */
  setUser(userId: string | null, email?: string): void {
    if (this.isProduction && Sentry) {
      if (userId) {
        Sentry.setUser({
          id: userId,
          // Don't set email to avoid PII in Sentry
        });
      } else {
        Sentry.setUser(null);
      }
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    if (this.isProduction && Sentry) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  }
}

export const logger = new Logger();
