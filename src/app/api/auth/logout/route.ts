import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.delete("session_token");
    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed", error: error.message }, { status: 500 });
  }
}
