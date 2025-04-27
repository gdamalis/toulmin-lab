import { ObjectId } from 'mongodb';
import { ToulminArgument } from './toulmin';

export interface DBUser {
  _id?: ObjectId;
  userId: string;
  name: string;
  email: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBArgument {
  _id?: ObjectId;
  userId: string;
  argument: ToulminArgument;
  createdAt: Date;
  updatedAt: Date;
} 