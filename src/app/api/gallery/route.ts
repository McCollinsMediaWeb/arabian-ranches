import { NextRequest } from "next/server";
import { getGallery, saveGallery } from "@/lib/db";

// GET: Fetch all gallery items
export async function GET() {
  try {
    const gallery = await getGallery();
    return Response.json(gallery, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { message: "Failed to load gallery items", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add or update gallery item (authorized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const newItem = await request.json();
    const { month, title, meta, photos, g1, g2, deco, images } = newItem;

    if (!month || !title || !meta || !photos || !g1 || !g2 || !deco) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const gallery = await getGallery();
    const existingIndex = gallery.findIndex((item: any) => item.title === title);

    if (existingIndex > -1) {
      // Update existing
      gallery[existingIndex] = {
        month,
        title,
        meta,
        photos,
        g1,
        g2,
        deco,
        images: images || gallery[existingIndex].images || []
      };
    } else {
      // Add new
      gallery.unshift({ month, title, meta, photos, g1, g2, deco, images: images || [] });
    }
    
    await saveGallery(gallery);

    return Response.json({ message: "Gallery item saved successfully" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to save gallery item", error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a gallery item (authorized)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");

    if (!title) {
      return Response.json({ message: "Missing title query parameter" }, { status: 400 });
    }

    const gallery = await getGallery();
    const updatedGallery = gallery.filter((item: any) => item.title !== title);

    if (gallery.length === updatedGallery.length) {
      return Response.json({ message: "Gallery item not found" }, { status: 404 });
    }

    await saveGallery(updatedGallery);
    return Response.json({ message: "Gallery item deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to delete gallery item", error: error.message }, { status: 500 });
  }
}
