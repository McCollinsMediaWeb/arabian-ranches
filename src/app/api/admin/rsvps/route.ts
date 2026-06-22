import { NextRequest, NextResponse } from "next/server";
import { getAllRsvps, updateRsvpStatus } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

// GET: Fetch all RSVPs (admin auth required)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rsvps = await getAllRsvps();
    return NextResponse.json(rsvps, { status: 200 });
  } catch (error: any) {
    console.error("Admin list RSVPs error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

// POST: Approve or Decline an RSVP (admin auth required)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rsvpId, action } = body;

    if (!rsvpId || !action || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "declined";
    const rsvp = await updateRsvpStatus(rsvpId, status);

    if (!rsvp) {
      return NextResponse.json({ message: "RSVP record not found" }, { status: 404 });
    }

    // Send email notification to user
    const isApproved = status === "approved";
    const subject = isApproved 
      ? `[Connecting Hearts] Seat Request Approved! - "${rsvp.eventTitle}"`
      : `[Connecting Hearts] Update on your seat request - "${rsvp.eventTitle}"`;

    const text = isApproved 
      ? `Hello ${rsvp.userName},

We are delighted to inform you that your seat request for "${rsvp.eventTitle}" has been approved!

We look forward to welcoming you to our gathering.

Warmly,
The Connecting Hearts Team`
      : `Hello ${rsvp.userName},

Thank you for your interest in joining our gathering: "${rsvp.eventTitle}".

Unfortunately, we are unable to approve your seat request for this event as all slots have been fully booked. We hope to see you at another event in the near future!

Warmly,
The Connecting Hearts Team`;

    const html = isApproved
      ? `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #c79a4b; font-weight: normal; margin-bottom: 20px;">Seat Request Approved!</h2>
          <p>Hello ${rsvp.userName},</p>
          <p>We are delighted to inform you that your seat request for <strong style="color: #b8533a;">"${rsvp.eventTitle}"</strong> has been approved!</p>
          <p>We look forward to welcoming you to our gathering. Please let us know if your plans change and you can no longer attend.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888;">Warmly,<br/>The Connecting Hearts Team</p>
         </div>`
      : `<div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #8f3d29; font-weight: normal; margin-bottom: 20px;">Gathering Seat Request Update</h2>
          <p>Hello ${rsvp.userName},</p>
          <p>Thank you for your interest in joining our gathering: <strong>"${rsvp.eventTitle}"</strong>.</p>
          <p>Unfortunately, we are unable to approve your seat request for this event as all slots have been fully booked. We hope to see you at another event in the near future!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888;">Warmly,<br/>The Connecting Hearts Team</p>
         </div>`;

    try {
      await sendEmail({
        to: rsvp.userEmail,
        subject,
        text,
        html
      });
    } catch (mailError) {
      console.error("Failed to send user email notification:", mailError);
    }

    return NextResponse.json({ message: `RSVP request successfully ${status}`, rsvp }, { status: 200 });
  } catch (error: any) {
    console.error("Admin approve/decline RSVP error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
