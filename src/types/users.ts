import { Role } from "./roles";
import { BaseEntity } from "./base";
import { ObjectId } from "mongodb";
import { ToulminArgument } from "./client";

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
 * For API operations
 */
export interface UserInput extends Pick<BaseUser, 'userId' | 'name' | 'email'> {
  picture?: string;
}

/**
 * User response data structure
 */
export interface UserResponseData {
  user?: BaseUser;
  arguments?: ToulminArgument[];
}

/**
 * Formats user data to ensure consistent response structure
 */
export function formatUserData(user: BaseUser): BaseUser {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
  };
} 