import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      // Clear cookie if session is expired or deleted from DB
      const response = NextResponse.json({ authenticated: false }, { status: 200 });
      response.cookies.delete("session_token");
      return response;
    }

    return NextResponse.json({ authenticated: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
