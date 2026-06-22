import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, createRsvp } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getSessionUser(sessionToken);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { eventTitle } = await request.json();
    if (!eventTitle) {
      return NextResponse.json({ message: "Event title is required" }, { status: 400 });
    }

    const rsvpId = `rsvp-${Date.now()}`;
    await createRsvp(rsvpId, user.id, eventTitle);

    // Send email notification to admin(s)
    const adminEmails = process.env.NOTIFICATION_EMAIL || user.email; // Fallback to user if not set
    const subject = `[Connecting Hearts] New Seat Request: ${user.name} for "${eventTitle}"`;
    const text = `Hello Admin,

A new seat request has been submitted for an upcoming gathering.

Member Details:
- Name: ${user.name}
- Email: ${user.email}

Gathering:
- Event: ${eventTitle}

Please log in to the admin dashboard to review and approve this request.

Warmly,
Connecting Hearts Bot`;

    const html = `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #c79a4b; font-weight: normal; margin-bottom: 20px;">New Gathering Seat Request</h2>
      <p>Hello Admin,</p>
      <p>A new seat request has been submitted for an upcoming gathering.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">Member Name:</td>
          <td style="padding: 8px 0;">${user.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Member Email:</td>
          <td style="padding: 8px 0;">${user.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Gathering:</td>
          <td style="padding: 8px 0; color: #b8533a; font-weight: bold;">${eventTitle}</td>
        </tr>
      </table>
      <p>Please log in to the admin dashboard to review and approve this request.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #888;">This is an automated notification from Connecting Hearts.</p>
    </div>`;

    try {
      await sendEmail({
        to: adminEmails,
        subject,
        text,
        html
      });
    } catch (mailError) {
      console.error("Failed to send admin email notification:", mailError);
    }

    return NextResponse.json({ message: "Seat request submitted successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Create RSVP error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
