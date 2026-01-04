import { Role, isAdmin } from '@/types/roles';
import { 
  getCoachUsageCollection, 
  ensureCoachUsageIndexes,
  CoachUsageDocument 
} from '@/lib/mongodb/collections/coach-usage';

/**
 * Result of a quota check or consumption operation
 */
export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number | null; // null means unlimited
  remaining: number | null; // null means unlimited
  resetAt: Date;
  isUnlimited: boolean;
}

/**
 * Get the monthly quota limit for a given role
 * Returns null for unlimited roles
 */
export function getMonthlyCoachQuotaLimit(role: Role): number | null {
  // Administrators have unlimited access
  if (isAdmin(role)) {
    return null;
  }
  
  // All other roles: 200/month
  // Can be overridden by environment variables in the future
  const defaultLimit = 200;
  
  // Optional: read from env (e.g., COACH_QUOTA_USER, COACH_QUOTA_PROFESSOR)
  // For now, keep it simple: everyone except admin gets 200
  return defaultLimit;
}

/**
 * Get the UTC month key for a given date (YYYY-MM format)
 */
export function getUtcMonthKey(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the UTC reset date (first day of next month at 00:00 UTC)
 */
export function getUtcMonthResetAt(now: Date = new Date()): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  
  // Create date for first day of next month
  const resetDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  
  return resetDate;
}

/**
 * Get the current quota status for a user without consuming
 * This is used for UI display and gating
 */
export async function getCoachQuotaStatus(
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<QuotaResult> {
  await ensureCoachUsageIndexes();
  
  const limit = getMonthlyCoachQuotaLimit(role);
  const monthKey = getUtcMonthKey(now);
  const resetAt = getUtcMonthResetAt(now);
  
  // Unlimited for admins
  if (limit === null) {
    return {
      allowed: true,
      used: 0,
      limit: null,
      remaining: null,
      resetAt,
      isUnlimited: true,
    };
  }
  
  // Fetch current usage
  const collection = await getCoachUsageCollection();
  const usageDoc = await collection.findOne({ userId, monthKey });
  
  const used = usageDoc?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: remaining > 0,
    used,
    limit,
    remaining,
    resetAt,
    isUnlimited: false,
  };
}

/**
 * Atomically consume one quota unit for a user
 * Returns whether the consumption was allowed and updated quota state
 * 
 * This operation is atomic and safe under high concurrency
 */
export async function consumeCoachMonthlyQuota(
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<QuotaResult> {
  await ensureCoachUsageIndexes();
  
  const limit = getMonthlyCoachQuotaLimit(role);
  const monthKey = getUtcMonthKey(now);
  const resetAt = getUtcMonthResetAt(now);
  
  // Unlimited for admins - always allow without tracking
  if (limit === null) {
    return {
      allowed: true,
      used: 0,
      limit: null,
      remaining: null,
      resetAt,
      isUnlimited: true,
    };
  }
  
  const collection = await getCoachUsageCollection();
  
  // Atomic operation: conditionally increment only if under limit
  // Using aggregation pipeline for atomic read-modify-write
  const result = await collection.findOneAndUpdate(
    { userId, monthKey },
    [
      {
        $set: {
          used: {
            $cond: {
              if: { $lt: [{ $ifNull: ['$used', 0] }, limit] },
              then: { $add: [{ $ifNull: ['$used', 0] }, 1] },
              else: { $ifNull: ['$used', 0] }
            }
          },
          updatedAt: now,
        }
      }
    ],
    {
      upsert: true,
      returnDocument: 'after',
      // Set initial values on insert
      setDefaultsOnInsert: true,
    }
  );
  
  // If upsert created a new document, we need to set createdAt
  if (result && !result.createdAt) {
    await collection.updateOne(
      { userId, monthKey },
      { $setOnInsert: { createdAt: now } }
    );
  }
  
  const doc = result as CoachUsageDocument | null;
  
  if (!doc) {
    // Shouldn't happen with upsert, but handle gracefully
    return {
      allowed: false,
      used: limit,
      limit,
      remaining: 0,
      resetAt,
      isUnlimited: false,
    };
  }
  
  const used = doc.used;
  const remaining = Math.max(0, limit - used);
  
  // Check if this request was allowed (used increased)
  // We allowed it if used <= limit (the increment happened)
  const allowed = used <= limit;
  
  return {
    allowed,
    used: allowed ? used : used - 1, // Adjust for display (actual used vs attempted)
    limit,
    remaining,
    resetAt,
    isUnlimited: false,
  };
}

