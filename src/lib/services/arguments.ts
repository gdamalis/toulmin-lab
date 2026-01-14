import { ToulminArgument } from "@/types/client";
import { ToulminArgumentInput } from "@/types/toulmin";
import { 
  findRawToulminArgumentsByUserId,
  findToulminArgumentByIdForUser,
  createToulminArgument,
  updateToulminArgument,
  deleteToulminArgument
} from "@/lib/mongodb/service";
import { ApiResponse } from "@/lib/api/responses";
import { ObjectId } from "mongodb";
import { toClientToulminArgument } from "@/utils/typeConverters";

/**
 * Get all arguments for a user
 */
export async function getUserArguments(userId: string): Promise<ApiResponse<ToulminArgument[]>> {
  try {
    const argumentDocs = await findRawToulminArgumentsByUserId(userId);
    return { success: true, data: argumentDocs.map(toClientToulminArgument) };
  } catch (error) {
    console.error("Error fetching user arguments:", error);
    return { success: false, error: "Failed to fetch arguments" };
  }
}

/**
 * Get a specific argument by ID for a user
 */
export async function getArgumentById(
  id: string, 
  userId: string
): Promise<ApiResponse<ToulminArgument>> {
  try {
    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "Invalid argument ID" };
    }

    const argument = await findToulminArgumentByIdForUser(id, userId);
    
    if (!argument) {
      return { success: false, error: "Argument not found" };
    }
    
    return { success: true, data: argument };
  } catch (error) {
    console.error("Error fetching argument:", error);
    return { success: false, error: "Failed to fetch argument" };
  }
}

/**
 * Create a new argument for a user
 */
export async function createArgument(
  diagram: ToulminArgumentInput,
  userId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    if (!diagram) {
      return { success: false, error: "Diagram data is required" };
    }
    
    const id = await createToulminArgument(diagram, userId);
    
    return { 
      success: true, 
      data: { id } 
    };
  } catch (error) {
    console.error("Error creating argument:", error);
    return { success: false, error: "Failed to create argument" };
  }
}

/**
 * Update an existing argument
 */
export async function updateArgument(
  id: string,
  diagram: ToulminArgument,
  userId: string
): Promise<ApiResponse> {
  try {
    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "Invalid argument ID" };
    }

    if (!diagram) {
      return { success: false, error: "Diagram data is required" };
    }
    
    const updated = await updateToulminArgument(id, diagram, userId);
    
    if (!updated) {
      return { success: false, error: "Failed to update argument" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating argument:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update argument" 
    };
  }
}

/**
 * Delete an argument by ID
 */
export async function deleteArgument(id: string, userId: string): Promise<ApiResponse> {
  try {
    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "Invalid argument ID" };
    }
    
    const deleted = await deleteToulminArgument(id, userId);
    
    if (!deleted) {
      return { 
        success: false, 
        error: "Argument not found or you do not have permission to delete it" 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting argument:", error);
    return { success: false, error: "Failed to delete argument" };
  }
} 