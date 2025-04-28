import clientPromise from "@/lib/mongodb/config";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

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

    const toulminArgument = await db.collection("toulminArguments").findOne({
      _id: new ObjectId(id),
      userId,
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
