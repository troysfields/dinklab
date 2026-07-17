import { NextResponse } from "next/server";
import { blobConfigured, listVideos } from "@/lib/videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/videos — the user's library, newest first. */
export async function GET() {
  if (!blobConfigured()) {
    return NextResponse.json({ videos: [], storageConfigured: false });
  }
  try {
    const videos = await listVideos();
    return NextResponse.json({ videos, storageConfigured: true });
  } catch (err) {
    console.error("[videos] list failed:", err);
    return NextResponse.json(
      { error: "Couldn't load your library. Please try again." },
      { status: 500 },
    );
  }
}
