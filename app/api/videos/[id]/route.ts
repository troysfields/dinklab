import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { blobConfigured, deleteVideo, getVideo } from "@/lib/videos";
import { LEVELS, SKILLS, type Level, type Skill, type VideoMeta } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!blobConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const video = await getVideo(id);
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
  return NextResponse.json({ video });
}

/** PATCH — update tags (skills / level / title / notes). */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  if (!blobConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const existing = await getVideo(id);
  if (!existing) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  let body: Partial<VideoMeta>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate — never trust the client
  const skills = Array.isArray(body.skills)
    ? (body.skills.filter((s): s is Skill => SKILLS.includes(s as Skill)) as Skill[])
    : existing.skills;
  const level =
    body.level && LEVELS.includes(body.level as Level)
      ? (body.level as Level)
      : body.level === undefined
        ? existing.level
        : undefined;
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : existing.title;
  const notes =
    typeof body.notes === "string" ? body.notes.slice(0, 2000) : existing.notes;

  const updated: VideoMeta = { ...existing, skills, level, title, notes };

  try {
    await put(`meta/${id}.json`, JSON.stringify(updated), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      // Blob overwrites propagate through the CDN; keep staleness ≤60s (the
      // minimum). The UI holds optimistic state, so edits still feel instant.
      cacheControlMaxAge: 60,
    });
    return NextResponse.json({ video: updated });
  } catch (err) {
    console.error("[videos] patch failed:", err);
    return NextResponse.json(
      { error: "Couldn't save changes. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!blobConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  const video = await getVideo(id);
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
  try {
    await deleteVideo(video);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[videos] delete failed:", err);
    return NextResponse.json(
      { error: "Couldn't delete the video. Please try again." },
      { status: 500 },
    );
  }
}
