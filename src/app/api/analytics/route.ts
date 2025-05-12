import { NextResponse } from "next/server";
import { getToken } from "@/lib/firebase/auth-admin";
import { getUserAnalytics } from "@/lib/mongodb/users";
import { getToulminArgumentAnalytics } from "@/lib/mongodb/toulmin-arguments";
export async function GET(request: Request) {
  try {
    // Extract the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await getToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userAnalytics = await getUserAnalytics();
    const argumentAnalytics = await getToulminArgumentAnalytics();
    
    return NextResponse.json({
      ...userAnalytics,
      ...argumentAnalytics,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
} 