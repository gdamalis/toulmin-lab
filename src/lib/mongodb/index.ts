// Core database functionality
export * from "./client";

// Domain-specific functions
export * from "./toulmin-arguments";
export * from "./users";

// Types re-exports for convenience
export type { ToulminArgument } from "@/types/client";
export type {
  ToulminArgumentCollection,
  UserCollection,
} from "@/types/mongodb";
