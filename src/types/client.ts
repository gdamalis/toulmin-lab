import { BaseAuthor, BaseEntity, BaseToulminArgument } from "./base";
import { Role } from "./roles";

// Client-side types with string IDs instead of ObjectId
export interface User extends BaseEntity {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role: Role;
}

export interface Author extends BaseAuthor {
  _id: string;
}

export interface ToulminArgument extends BaseToulminArgument {
  _id?: string;
  author: Author;
} 