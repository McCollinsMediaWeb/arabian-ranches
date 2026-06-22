import { NextRequest, NextResponse } from "next/server";
import { getSnapshots, addSnapshot, deleteSnapshot } from "@/lib/db";

// GET: Fetch all snapshots
export async function GET() {
  try {
    const snapshots = await getSnapshots();
    return NextResponse.json(snapshots, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to load snapshots", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new snapshot (authorized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, imageUrl, caption, p1, p2, rotation, marginTop } = body;

    // We require caption or image URL
    if (!caption && !imageUrl) {
      return NextResponse.json(
        { message: "Either caption or image is required" },
        { status: 400 }
      );
    }

    await addSnapshot({
      id: id || Date.now().toString(),
      imageUrl: imageUrl || null,
      caption: caption || "",
      p1: p1 || "#b8533a",
      p2: p2 || "#d9a48a",
      rotation: rotation !== undefined ? parseInt(rotation) : 0,
      marginTop: marginTop || "0px"
    });

    return NextResponse.json({ message: "Snapshot added successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to add snapshot", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a snapshot (authorized)
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

    await deleteSnapshot(id);
    return NextResponse.json({ message: "Snapshot deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete snapshot", error: error.message },
      { status: 500 }
    );
  }
}
