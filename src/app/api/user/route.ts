import { getToken } from "@/lib/firebase/auth-admin";
import {
  createOrUpdateUser,
  getToulminArgumentsByUserId,
} from "@/lib/mongodb/service";

export async function GET(request: Request) {
  try {
    // Extract the authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token
    const decodedToken = await getToken(token);
    if (!decodedToken) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get arguments for this user
    const userToulminArguments = await getToulminArgumentsByUserId(userId);

    // Return the arguments
    return Response.json({
      success: true,
      arguments: userToulminArguments,
    });
  } catch (error) {
    console.error("Error retrieving user diagrams:", error);
    return Response.json(
      { error: "Failed to retrieve diagrams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token
    const decodedToken = await getToken(token);
    if (!decodedToken) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Parse the request body
    const { name, email } = await request.json();

    // Create or update user in the database
    await createOrUpdateUser({
      userId,
      name: name ?? decodedToken.name ?? "",
      email: email ?? decodedToken.email ?? "",
      picture: decodedToken.picture,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
