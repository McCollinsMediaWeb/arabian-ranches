import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers, addTeamMember, deleteTeamMember } from "@/lib/db";

// GET: Fetch all team members
export async function GET() {
  try {
    const team = await getTeamMembers();
    return NextResponse.json(team, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to load team members", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add or update a team member (authorized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, role, location, bio, image, g1, g2 } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    await addTeamMember({
      id,
      name,
      role,
      location,
      bio,
      image,
      g1,
      g2
    });

    return NextResponse.json({ message: "Team member saved successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to save team member", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a team member (authorized)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing id query parameter" }, { status: 400 });
    }

    await deleteTeamMember(id);
    return NextResponse.json({ message: "Team member deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete team member", error: error.message },
      { status: 500 }
    );
  }
}
