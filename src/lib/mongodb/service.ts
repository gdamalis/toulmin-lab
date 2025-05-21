import { 
  createOrUpdateUser,
  deleteUser,
  findUserById,
  findAllUsers,
  updateUserRole,
  getUserAnalytics
} from "./users";

import {
  createToulminArgument,
  findToulminArgumentById,
  findToulminArgumentByIdForUser,
  findToulminArgumentsByUserId,
  findRawToulminArgumentsByUserId,
  updateToulminArgument,
  deleteToulminArgument,
  getToulminArgumentAnalytics
} from "./toulmin-arguments";

// Re-export all needed functions
export {
  // Users
  createOrUpdateUser,
  deleteUser,
  findUserById,
  findAllUsers,
  updateUserRole,
  getUserAnalytics,

  // Toulmin Arguments
  createToulminArgument,
  findToulminArgumentById,
  findToulminArgumentByIdForUser,
  findToulminArgumentsByUserId,
  findRawToulminArgumentsByUserId,
  updateToulminArgument,
  deleteToulminArgument,
  getToulminArgumentAnalytics
};
