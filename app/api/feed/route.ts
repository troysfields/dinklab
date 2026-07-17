import { NextResponse } from "next/server";
import { getFeed } from "@/lib/feed";
import { LEVELS, SKILLS, type Level, type Skill } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/feed?skills=dinks,serves&level=3.5%2B&limit=12
 * Returns matched training content. Falls back to the curated seed corpus
 * when no live-search key is configured — the feed never comes back empty
 * because of missing infrastructure.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const skills = (url.searchParams.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Skill => SKILLS.includes(s as Skill));
  const levelParam = url.searchParams.get("level");
  const level =
    levelParam && LEVELS.includes(levelParam as Level)
      ? (levelParam as Level)
      : undefined;
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "12", 10) || 12, 1),
    30,
  );

  try {
    const feed = await getFeed({ skills, level, limit });
    return NextResponse.json(feed);
  } catch (err) {
    console.error("[feed] failed:", err);
    return NextResponse.json(
      { error: "Couldn't load training content. Please try again." },
      { status: 500 },
    );
  }
}
