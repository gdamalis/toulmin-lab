import { describe, it, expect } from 'vitest';
import {
  getMonthlyCoachQuotaLimit,
  getUtcMonthKey,
  getUtcMonthResetAt,
} from './quota';
import { Role } from '@/types/roles';

describe('quota utilities', () => {
  describe('getMonthlyCoachQuotaLimit', () => {
    it('returns null for administrators (unlimited)', () => {
      expect(getMonthlyCoachQuotaLimit(Role.ADMINISTRATOR)).toBeNull();
    });

    it('returns 200 for regular users', () => {
      expect(getMonthlyCoachQuotaLimit(Role.USER)).toBe(200);
    });

    it('returns 200 for students', () => {
      expect(getMonthlyCoachQuotaLimit(Role.STUDENT)).toBe(200);
    });

    it('returns 200 for professors', () => {
      expect(getMonthlyCoachQuotaLimit(Role.PROFESSOR)).toBe(200);
    });

    it('returns 200 for beta testers', () => {
      expect(getMonthlyCoachQuotaLimit(Role.BETA_TESTER)).toBe(200);
    });
  });

  describe('getUtcMonthKey', () => {
    it('returns correct format YYYY-MM', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      expect(getUtcMonthKey(date)).toBe('2025-01');
    });

    it('handles single-digit months with zero padding', () => {
      const date = new Date('2025-03-01T00:00:00Z');
      expect(getUtcMonthKey(date)).toBe('2025-03');
    });

    it('handles December correctly', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      expect(getUtcMonthKey(date)).toBe('2024-12');
    });

    it('handles January correctly', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      expect(getUtcMonthKey(date)).toBe('2025-01');
    });
  });

  describe('getUtcMonthResetAt', () => {
    it('returns first day of next month at midnight UTC', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const reset = getUtcMonthResetAt(date);
      
      expect(reset.getUTCFullYear()).toBe(2025);
      expect(reset.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(reset.getUTCDate()).toBe(1);
      expect(reset.getUTCHours()).toBe(0);
      expect(reset.getUTCMinutes()).toBe(0);
      expect(reset.getUTCSeconds()).toBe(0);
      expect(reset.getUTCMilliseconds()).toBe(0);
    });

    it('handles December rollover to next year', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      const reset = getUtcMonthResetAt(date);
      
      expect(reset.getUTCFullYear()).toBe(2025);
      expect(reset.getUTCMonth()).toBe(0); // January (0-indexed)
      expect(reset.getUTCDate()).toBe(1);
    });

    it('handles edge case of first day of month', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const reset = getUtcMonthResetAt(date);
      
      expect(reset.getUTCFullYear()).toBe(2025);
      expect(reset.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(reset.getUTCDate()).toBe(1);
    });

    it('handles February rollover to March (non-leap year)', () => {
      const date = new Date('2025-02-15T12:00:00Z');
      const reset = getUtcMonthResetAt(date);
      
      expect(reset.getUTCFullYear()).toBe(2025);
      expect(reset.getUTCMonth()).toBe(2); // March (0-indexed)
      expect(reset.getUTCDate()).toBe(1);
    });

    it('handles February rollover to March (leap year)', () => {
      const date = new Date('2024-02-15T12:00:00Z');
      const reset = getUtcMonthResetAt(date);
      
      expect(reset.getUTCFullYear()).toBe(2024);
      expect(reset.getUTCMonth()).toBe(2); // March (0-indexed)
      expect(reset.getUTCDate()).toBe(1);
    });
  });
});

