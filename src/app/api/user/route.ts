import { NextRequest, NextResponse } from "next/server";
import {
  getUser,
  createOrUpdateUser,
  updateUserRole,
  deleteUser
} from "./actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  const result = await getUser(userId);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get("Authorization")?.split("Bearer ")[1] ?? "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const result = await createOrUpdateUser(body, token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "error" in result ? result.error : "Failed to create user" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateUserRole(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "error" in result ? result.error : "Failed to update user role" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PATCH /api/user:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  const result = await deleteUser(userId);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "error" in result ? result.error : "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
