import { saveArgument, createOrUpdateUser } from "@/lib/mongodb/service";
import { ToulminArgument } from "@/types/toulmin";
import { getToken } from "@/lib/firebase/auth-admin";

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
    const data = await request.json();
    const { argument } = data as { argument: ToulminArgument };

    if (!argument) {
      return Response.json({ error: "Missing argument data" }, { status: 400 });
    }

    // Save user info if it exists in the token
    if (decodedToken.name || decodedToken.email || decodedToken.picture) {
      await createOrUpdateUser({
        userId,
        name: decodedToken.name ?? "",
        email: decodedToken.email ?? "",
        picture: decodedToken.picture,
      });
    }

    // Save the argument to the database
    const argumentId = await saveArgument(userId, argument);

    return Response.json({ success: true, argumentId });
  } catch (error) {
    console.error("Error saving diagram:", error);
    return Response.json({ error: "Failed to save diagram" }, { status: 500 });
  }
}
