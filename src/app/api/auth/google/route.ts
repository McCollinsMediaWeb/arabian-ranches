import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, createSession } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ message: "Missing credential token" }, { status: 400 });
    }

    // Call Google's tokeninfo API to securely verify the JWT ID Token
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) {
      return NextResponse.json({ message: "Invalid Google ID token" }, { status: 400 });
    }

    const payload = await verifyRes.json();

    // Verify audience matches the client ID
    if (payload.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      return NextResponse.json({ message: "Audience mismatch" }, { status: 400 });
    }

    const { sub, email, name, picture } = payload;
    if (!email) {
      return NextResponse.json({ message: "Email not provided by Google account" }, { status: 400 });
    }

    // Save user in DB
    const user = await findOrCreateUser(sub, email, name, picture);

    // Create session in DB
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    await createSession(user.id, sessionToken, expiresAt);

    // Create response and set HTTP-only cookie
    const response = NextResponse.json({ message: "Login successful", user }, { status: 200 });
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Google login error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
