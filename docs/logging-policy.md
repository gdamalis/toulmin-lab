# Logging Policy

## Sensitive Data - NEVER Log

The following data types must NEVER be logged in any environment:

### Authentication & Security
- **Passwords** (including temporary passwords)
- **Authentication tokens** (Bearer tokens, ID tokens, session tokens)
- **API keys** (Resend, OpenAI, MongoDB connection strings)
- **Firebase credentials** (private keys, service account details)

### Personal Identifiable Information (PII)
- **Email addresses** - Use user IDs instead
- **Full names** - Use user IDs instead  
- **User message content** in coach/AI interactions - Log only metadata (sessionId, step, messageLength)

### Request/Response Data
- **Authorization headers** - Strip before logging
- **Full request bodies** that may contain PII
- **Password reset tokens**

## What CAN Be Logged

### Production
- User IDs (stable, non-PII identifiers)
- Session IDs
- Argument/document IDs
- Error types and stack traces (sanitized)
- Performance metrics (duration, counts)
- Feature flags and configuration (non-secret)

### Development Only
- Sanitized request/response shapes (no actual values)
- Validation errors (field names only, not values)

## Logging Patterns

### ✅ Good
```typescript
logger.error('Failed to create user', { 
  userId: result.userId,
  errorCode: error.code 
});

logger.info('Coach message sent', { 
  sessionId,
  step,
  messageLength: message.length 
});
```

### ❌ Bad
```typescript
console.error('Auth failed:', authHeader); // Contains Bearer token
console.log('User data:', { email, password }); // PII + secrets
console.log('Request body:', requestBody); // May contain sensitive data
```

## Implementation

1. Use the structured logger (`src/lib/logger.ts`) for all logging
2. The logger automatically redacts sensitive fields
3. In production, only errors are sent to Sentry (with scrubbing)
4. Use `logger.debug()` for verbose logging (disabled in production)
