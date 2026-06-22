import { NextRequest } from "next/server";
import { getEvents, saveEvents } from "@/lib/db";

// GET: Fetch all gatherings
export async function GET() {
  try {
    const events = await getEvents();
    return Response.json(events, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { message: "Failed to load events", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add new gathering (authorized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const newEvent = await request.json();
    const { month, monthFull, day, title, host, location, time } = newEvent;
    const bringOptions = Array.isArray(newEvent.bringOptions)
      ? [...new Set(newEvent.bringOptions.map((option: unknown) => String(option).trim()).filter(Boolean))]
      : [];

    if (!month || !monthFull || !day || !title || !host || !location || !time) {
      return Response.json({ message: "Missing required fields" }, { status: 400 });
    }

    const events = await getEvents();
    
    // Avoid duplicates
    if (events.some((e: any) => e.title.toLowerCase() === title.toLowerCase())) {
      return Response.json({ message: "An event with this title already exists" }, { status: 400 });
    }

    events.push({ month, monthFull, day, title, host, location, time, bringOptions });
    await saveEvents(events);

    return Response.json({ message: "Gathering added successfully" }, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: "Failed to add event", error: error.message }, { status: 500 });
  }
}

// PATCH: Update the optional contribution list for an existing gathering (authorized)
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-password");
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, bringOptions: rawBringOptions } = await request.json();
    if (!title || !Array.isArray(rawBringOptions)) {
      return Response.json({ message: "Invalid contribution list" }, { status: 400 });
    }
    const bringOptions = [...new Set(rawBringOptions.map((option: unknown) => String(option).trim()).filter(Boolean))];
    const events = await getEvents();
    const event = events.find((item: any) => item.title === title);
    if (!event) {
      return Response.json({ message: "Gathering not found" }, { status: 404 });
    }

    event.bringOptions = bringOptions;
    await saveEvents(events);
    return Response.json({ message: "Contribution list updated" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to update contribution list", error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a gathering (authorized)
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

    const events = await getEvents();
    const updatedEvents = events.filter((e: any) => e.title !== title);

    if (events.length === updatedEvents.length) {
      return Response.json({ message: "Event not found" }, { status: 404 });
    }

    await saveEvents(updatedEvents);
    return Response.json({ message: "Gathering deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: "Failed to delete event", error: error.message }, { status: 500 });
  }
}
