import { NextRequest } from "next/server";
import { getSubmissions, updateSubmissionStatus, assignBuddyToRequest, addTeamMember } from "@/lib/db";

// GET: Fetch all form submissions (authorized)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const submissions = await getSubmissions();
    return Response.json(submissions, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { message: "Failed to load submissions", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Process submission actions (Approve/Decline)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, action, buddySubmissionId } = await request.json();
    if (!submissionId || !action || !["approve", "decline", "assign"].includes(action)) {
      return Response.json({ message: "Invalid parameters" }, { status: 400 });
    }

    if (action === "assign") {
      if (!buddySubmissionId) {
        return Response.json({ message: "Please select an available buddy" }, { status: 400 });
      }
      await assignBuddyToRequest(submissionId, buddySubmissionId);
      return Response.json({ message: "Buddy assigned successfully" }, { status: 200 });
    }

    const submissions = await getSubmissions();
    const targetSubmission = submissions.find((submission: any) => submission.id === submissionId);
    if (!targetSubmission) {
      return Response.json({ message: "Submission not found" }, { status: 404 });
    }
    if (action === "approve" && targetSubmission.formType === "request-buddy") {
      return Response.json({ message: "Select and assign an available buddy instead" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "declined";
    const sub = await updateSubmissionStatus(submissionId, status);
    if (!sub) {
      return Response.json({ message: "Submission not found" }, { status: 404 });
    }

    // If it is a seat request (register) and approved, automatically register them as a team member
    if (action === "approve" && sub.form_type === "register") {
      await addTeamMember({
        name: sub.name,
        role: "Member",
        location: sub.address || "Arabian Ranches",
        bio: sub.note || `${sub.name} is a member of the Arabian Ranches Circle community.`,
        image: null,
        g1: "#d9a48a",
        g2: "#b8533a"
      });
    }

    return Response.json({ message: `Submission ${action}d successfully` }, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { message: "Failed to update submission status", error: error.message },
      { status: error.message?.includes("not available") || error.message?.includes("already") || error.message?.includes("not found") ? 400 : 500 }
    );
  }
}
