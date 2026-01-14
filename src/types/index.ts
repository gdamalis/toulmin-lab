/**
 * Central barrel export for all types
 * Provides convenient imports: import { User, ToulminArgument } from '@/types'
 */

export * from './base';
export * from './client';
export * from './coach';
export * from './roles';
export * from './toulmin';
export * from './users';

// Re-export MongoDB types separately to avoid conflicts
export type {
  ToulminArgumentCollection,
  UserCollection,
  SubscriberCollection,
} from './mongodb';
