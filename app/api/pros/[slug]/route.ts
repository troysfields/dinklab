import { NextResponse } from "next/server";
import { getPro, type ProContentItem } from "@/lib/pros/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/pros/[slug] — fresh content for a tracked player.
 * Same provider philosophy as the training feed: live search when a key is
 * configured (Tavily → YouTube), curated cited corpus as the guaranteed
 * fallback. `live` tells the UI which one it got.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pro = getPro(slug);
  if (!pro) {
    return NextResponse.json({ error: "Player not tracked" }, { status: 404 });
  }

  // Live providers
  try {
    if (process.env.TAVILY_API_KEY) {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query: `${pro.searchQuery} latest news technique 2026`,
          max_results: 8,
          topic: "news",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results?: { title: string; url: string; content: string }[];
        };
        const items: ProContentItem[] = (data.results ?? []).map((r, i) => ({
          id: `live-${i}`,
          type: "article",
          title: r.title,
          url: r.url,
          source: hostname(r.url),
          summary: r.content.slice(0, 200),
        }));
        if (items.length) {
          return NextResponse.json({ items, live: true });
        }
      }
    }
    if (process.env.YOUTUBE_API_KEY) {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.search = new URLSearchParams({
        part: "snippet",
        q: pro.searchQuery,
        type: "video",
        maxResults: "8",
        order: "date",
        key: process.env.YOUTUBE_API_KEY,
      }).toString();
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = (await res.json()) as {
          items?: {
            id: { videoId: string };
            snippet: { title: string; channelTitle: string; description: string };
          }[];
        };
        const items: ProContentItem[] = (data.items ?? []).map((v) => ({
          id: `yt-${v.id.videoId}`,
          type: "video",
          title: v.snippet.title,
          url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          source: v.snippet.channelTitle,
          summary: v.snippet.description.slice(0, 200),
          youtubeId: v.id.videoId,
        }));
        if (items.length) {
          return NextResponse.json({ items, live: true });
        }
      }
    }
  } catch (err) {
    console.error(`[pros] live search failed for ${slug}:`, err);
    // fall through to curated
  }

  return NextResponse.json({ items: pro.content, live: false });
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}
