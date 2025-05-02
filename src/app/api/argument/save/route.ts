import { getToken } from "@/lib/firebase/auth-admin";
import { saveToulminArgument } from "@/lib/mongodb/service";
import { ToulminArgument } from "@/types/client";

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
    const data = (await request.json()) as ToulminArgument;

    if (!data) {
      return Response.json({ error: "Missing argument data" }, { status: 400 });
    }

    // Save the argument to the database
    const toulminArgumentId = await saveToulminArgument(data, userId);

    return Response.json({ success: true, toulminArgumentId });
  } catch (error) {
    console.error("Error saving diagram:", error);
    return Response.json({ error: "Failed to save diagram" }, { status: 500 });
  }
}
