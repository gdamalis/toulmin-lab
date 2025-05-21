import { createErrorResponse, createSuccessResponse } from "@/lib/api/responses";
import { getToken, setUserRole } from "@/lib/firebase/auth-admin";
import { createOrUpdateUser, findUserById } from "@/lib/mongodb/service";
import { Role } from "@/types/roles";
import { NextRequest } from "next/server";

// This endpoint is called immediately after Firebase authentication completes
// It handles setting the role claim and creating/updating the user in the database
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { idToken, callbackUrl } = body;
    
    if (!idToken) {
      return createErrorResponse('ID token is required', 400);
    }
    
    // Verify the token directly with Firebase Admin
    const decodedToken = await getToken(idToken);
    if (!decodedToken?.uid) {
      return createErrorResponse('Invalid token', 401);
    }
    
    const uid = decodedToken.uid;
    
    // Get user data from the token
    const email = decodedToken.email ?? '';
    const name = decodedToken.name ?? email.split('@')[0] ?? 'User';
    const picture = decodedToken.picture;
    
    // Check if user exists in our database
    const existingUser = await findUserById(uid);
    const isNewUser = !existingUser;
    
    // For new users, assign the default role
    // For existing users, keep the current role
    const role = isNewUser ? Role.USER : (existingUser?.role ?? Role.USER);
    
    // Set the custom claim for this user
    await setUserRole(uid, role);
    
    // Create or update the user in the database
    if (isNewUser) {
      await createOrUpdateUser({
        userId: uid,
        name,
        email,
        picture,
        role
      });
    }
    
    // Return success with user info and the nextAuth parameters
    return createSuccessResponse({ 
      success: true, 
      role,
      isNewUser,
      // Include information needed for the client to proceed with NextAuth
      auth: {
        provider: "firebase",
        idToken,
        callbackUrl
      }
    });
  } catch (error) {
    console.error("Error in auth callback:", error);
    return createErrorResponse("Authentication failed", 500);
  }
} 