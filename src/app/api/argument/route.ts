import { getToken } from "@/lib/firebase/auth-admin";
import clientPromise from "@/lib/mongodb/config";
import { COLLECTIONS } from "@/constants/database.constants";
import { NextRequest, NextResponse } from "next/server";

// GET /api/arguments - Get all toulmin arguments for the authenticated user
export async function GET(request: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db("toulmin_lab");

    const toulminArguments = await db
      .collection(COLLECTIONS.ARGUMENTS)
      .find({ "author.userId": userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(toulminArguments);
  } catch (error) {
    console.error("Error fetching toulmin arguments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/arguments - Create a new toulmin argument
export async function POST(request: NextRequest) {
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

    const data = await request.json();

    if (!data.diagram) {
      return NextResponse.json(
        { error: "Diagram data is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("toulmin_lab");

    const diagramData = {
      userId,
      diagram: data.diagram,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("toulminArguments")
      .insertOne(diagramData);

    return NextResponse.json({
      id: result.insertedId,
      ...diagramData,
    });
  } catch (error) {
    console.error("Error creating argument:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
