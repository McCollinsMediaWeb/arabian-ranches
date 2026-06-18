import { NextRequest } from "next/server";
import { getSubmissions } from "@/lib/db";

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
