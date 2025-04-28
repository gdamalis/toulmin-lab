import { ToulminArgumentPart } from "./toulmin";

/**
 * Base types shared between client and server implementations
 */

export interface BaseEntity {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BaseAuthor {
  userId: string;
  name: string;
}

export interface BaseToulminArgument extends BaseEntity {
  name: string;
  parts: ToulminArgumentPart;
} 