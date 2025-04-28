import { Author, ToulminArgument, User } from "@/types/client";
import { AuthorCollection, ToulminArgumentCollection, UserCollection } from "@/types/mongodb";
import { ObjectId } from "mongodb";

/**
 * Converts a MongoDB ToulminArgumentCollection to a client-friendly ToulminArgument
 */
export function toClientToulminArgument(doc: ToulminArgumentCollection): ToulminArgument {
  return {
    _id: doc._id?.toString(),
    name: doc.name,
    author: {
      _id: doc.author._id.toString(),
      userId: doc.author.userId,
      name: doc.author.name,
    },
    parts: doc.parts,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Converts a client ToulminArgument to a MongoDB ToulminArgumentCollection
 * Note: This should only be used server-side
 */
export function toCollectionToulminArgument(
  clientArg: ToulminArgument
): Omit<ToulminArgumentCollection, "_id"> {
  return {
    name: clientArg.name,
    author: {
      // Author will be overridden server-side
      _id: new ObjectId(),
      userId: clientArg.author.userId,
      name: clientArg.author.name,
    },
    parts: clientArg.parts,
    createdAt: clientArg.createdAt instanceof Date ? clientArg.createdAt : new Date(clientArg.createdAt),
    updatedAt: clientArg.updatedAt instanceof Date ? clientArg.updatedAt : new Date(clientArg.updatedAt),
  };
}

/**
 * Converts a MongoDB UserCollection to a client-friendly User
 */
export function toClientUser(doc: UserCollection): User {
  return {
    _id: doc._id?.toString(),
    userId: doc.userId,
    name: doc.name,
    email: doc.email,
    picture: doc.picture,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Converts a MongoDB AuthorCollection to a client-friendly Author
 */
export function toClientAuthor(doc: AuthorCollection): Author {
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
  };
} 