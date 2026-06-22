import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make sure public/uploads/snapshots directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", "snapshots");
    await mkdir(uploadDir, { recursive: true });

    // Clean file name
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = join(uploadDir, cleanFileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: `/uploads/snapshots/${cleanFileName}`
    }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed", error: error.message }, { status: 500 });
  }
}
