import { ObjectId } from "mongodb";
import { BaseAuthor, BaseEntity, BaseToulminArgument } from "./base";
import { Role } from "./roles";

// MongoDB collection types - only for server-side code
export interface UserCollection extends BaseEntity {
  _id?: ObjectId;
  userId: string;
  name: string;
  email: string;
  picture?: string;
  role: Role;
}

export interface AuthorCollection extends BaseAuthor {
  _id: ObjectId;
}

export interface ToulminArgumentCollection extends BaseToulminArgument {
  _id?: ObjectId;
  author: AuthorCollection;
}
