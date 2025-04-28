import { COLLECTIONS } from "@/constants/database.constants";
import clientPromise from "@/lib/mongodb/config";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/firebase/auth-admin";
import { updateToulminArgument } from "@/lib/mongodb/service";
import { ToulminArgument } from "@/types/client";
import { getAuth } from 'firebase-admin/auth';

// GET /api/argument/:id - Get a specific diagram by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid argument ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("toulmin_lab");

    const toulminArgument = await db
      .collection(COLLECTIONS.ARGUMENTS)
      .findOne({
        _id: new ObjectId(id),
        "author.userId": userId,
      });

    if (!toulminArgument) {
      return NextResponse.json(
        { error: "ToulminArgument not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(toulminArgument);
  } catch (error) {
    console.error("Error fetching argument:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/argument/:id - Update a specific diagram by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token
    const decodedToken = await getToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid argument ID" },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = (await req.json()) as ToulminArgument;

    if (!data) {
      return NextResponse.json({ error: "Missing argument data" }, { status: 400 });
    }

    // Update the argument
    const updated = await updateToulminArgument(id, data, userId);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update argument" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, toulminArgumentId: id });
  } catch (error) {
    console.error("Error updating argument:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the argument ID from the URL
    const { id } = await params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid argument ID format' },
        { status: 400 }
      );
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    let userId;
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (authError) {
      console.error('Error verifying auth token:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired authorization token' },
        { status: 401 }
      );
    }
    
    // Get MongoDB client and database
    const client = await clientPromise;
    const db = client.db("toulmin_lab");
    
    // Delete the argument if it belongs to the authenticated user
    const result = await db.collection(COLLECTIONS.ARGUMENTS).deleteOne({
      _id: new ObjectId(id),
      'author.userId': userId // Only delete if the argument belongs to this user
    });
    
    if (result.deletedCount === 0) {
      // Either the argument doesn't exist or doesn't belong to this user
      return NextResponse.json(
        { error: 'Argument not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting argument:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
