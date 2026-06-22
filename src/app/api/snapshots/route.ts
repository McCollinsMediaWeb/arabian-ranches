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
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image URL is required" },
        { status: 400 }
      );
    }

    // Automatically generate layout features for random organic scattering
    const rotations = [-5, -3, -1, 1, 3, 5, -4, 2, -2, 4];
    const margins = ["0px", "10px", "20px", "30px", "40px"];
    const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
    const randomMargin = margins[Math.floor(Math.random() * margins.length)];

    // Preset nice gradient borders
    const gradients = [
      { g1: "#b8533a", g2: "#d9a48a" },
      { g1: "#8f3d29", g2: "#c79a4b" },
      { g1: "#6b6b3a", g2: "#c79a4b" },
      { g1: "#d9a48a", g2: "#b8533a" }
    ];
    const randomGrad = gradients[Math.floor(Math.random() * gradients.length)];

    await addSnapshot({
      id: Date.now().toString(),
      imageUrl: imageUrl,
      caption: "",
      p1: randomGrad.g1,
      p2: randomGrad.g2,
      rotation: randomRot,
      marginTop: randomMargin
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
