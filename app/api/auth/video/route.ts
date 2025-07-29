import { authOptions } from "@/lib/authOptions";
import { conToDb } from "@/lib/db";
import { IVideo, Video } from "@/models/Video";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/authOptions";

export async function GET() {
  try {
    await conToDb(); // Connect to database
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean(); // Fetch videos sorted by newest
    return NextResponse.json(videos); // Return videos as JSON
  } catch (error) {
    console.error("Failed to get videos", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(); // Get current user session checks authorization
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 }); // Unauthorized if no session
    }

    await conToDb(); // Ensure DB connection

    const body: IVideo = await req.json();
    const { title, description, videoUrl, thumbnailUrl } = body;

    if (!title || !description || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 }
      ); // Validate required fields
    }

    // Set default quality if not provided; rely on schema for other defaults
    const videoData = {
      ...body,
      transformation: {
        ...body.transformation,
        quality: body.transformation?.quality ?? 100,
      },
    };

    const newVideo = await Video.create(videoData); // Create new video record
    return NextResponse.json(newVideo, { status: 201 }); // Return created video
  } catch (error) {
    console.error("Failed to create video", error);
    return NextResponse.json(
      { error: "failed to create video" },
      { status: 500 }
    );
  }
}
