import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Video from "@/models/Video";

export async function GET(req: NextRequest) {
  await connectToDB();

  try {
    const videos = await Video.find({});
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
