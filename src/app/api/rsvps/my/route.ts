import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getUserRsvps } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rsvps = await getUserRsvps(user.id);
    return NextResponse.json(rsvps, { status: 200 });
  } catch (error: any) {
    console.error("Fetch user RSVPs error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
