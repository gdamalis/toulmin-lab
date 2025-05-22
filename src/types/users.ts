import { Role } from "./roles";
import { BaseEntity } from "./base";
import { ObjectId, WithId } from "mongodb";

/**
 * Base user interface with common properties
 */
export interface BaseUser {
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role?: Role;
}

/**
 * Extended for MongoDB with ObjectId
 */
export interface UserCollection extends BaseUser, BaseEntity {
  _id?: ObjectId;
  role: Role; // Required in DB
}

/**
 * For client responses
 */
export interface UserResponse extends BaseUser {
  _id?: string;
}

/**
 * User input data for creation/updates
 */
export interface UserInput {
  name: string;
  email: string;
  picture?: string;
}

/**
 * Formatted user data for client
 */
export interface UserData {
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role: Role;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * User with their toulmin arguments
 */
export interface UserWithArguments {
  user: WithId<UserCollection>;
  arguments: unknown[];
}

/**
 * Formats user data for client by removing sensitive or internal fields
 */
export function formatUserData(user: WithId<UserCollection> | BaseUser): UserData | BaseUser {
  if ('createdAt' in user && 'updatedAt' in user) {
    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as UserData;
  }
  
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
  } as BaseUser;
} 