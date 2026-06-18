import { NextRequest } from "next/server";
import { getRecognition, saveRecognition } from "@/lib/db";

// GET: Fetch recognition details
export async function GET() {
  try {
    const recognition = await getRecognition();
    return Response.json(recognition, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { message: "Failed to load recognition details", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Update recognition details (authorized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { type, data } = payload;

    if (!type || !data) {
      return Response.json({ message: "Missing type or data payload" }, { status: 400 });
    }

    const recognition = await getRecognition();

    if (type === "weekly") {
      const { name, role, avatar, story, attribution } = data;
      if (!name || !role || !avatar || !story || !attribution) {
        return Response.json({ message: "Missing weekly buddy fields" }, { status: 400 });
      }
      recognition.buddyOfWeek = { name, role, avatar, story, attribution };
    } else if (type === "monthly") {
      const { title, description, note, nominees } = data;
      if (!title || !description || !note || !nominees) {
        return Response.json({ message: "Missing monthly buddy fields" }, { status: 400 });
      }
      recognition.buddyOfMonth = { title, description, note, nominees };
    } else {
      return Response.json({ message: "Invalid type. Must be 'weekly' or 'monthly'." }, { status: 400 });
    }

    await saveRecognition(recognition);

    return Response.json({ message: "Recognition details updated successfully" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to update recognition", error: error.message }, { status: 500 });
  }
}
