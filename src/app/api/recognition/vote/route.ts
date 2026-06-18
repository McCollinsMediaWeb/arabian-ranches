import { NextRequest } from "next/server";
import { getRecognition, saveRecognition } from "@/lib/db";

// POST: Cast a vote for a nominee
export async function POST(request: NextRequest) {
  try {
    const { nomineeId } = await request.json();

    if (!nomineeId) {
      return Response.json({ message: "Missing nomineeId" }, { status: 400 });
    }

    const recognition = await getRecognition();
    const nominees = recognition.buddyOfMonth?.nominees || [];

    const nominee = nominees.find((n: any) => n.id === nomineeId);

    if (!nominee) {
      return Response.json({ message: "Nominee not found" }, { status: 404 });
    }

    // Increment vote count
    nominee.votes = (nominee.votes || 0) + 1;
    await saveRecognition(recognition);

    return Response.json({ message: "Vote cast successfully", nominee }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to cast vote", error: error.message }, { status: 500 });
  }
}
