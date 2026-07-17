import type { FeedItem, FeedResponse, Level, Skill } from "@/lib/types";
import { SKILLS, LEVELS, SKILL_LABELS } from "@/lib/types";
import { SEED_FEED } from "./seed-data";

/**
 * Feed architecture
 * ─────────────────
 * A FeedProvider turns a query (skills + level) into training content.
 * Providers are tried in priority order; the seeded corpus is the guaranteed
 * fallback, so the feed always renders even with zero API keys configured.
 *
 *   TavilyProvider   — live web search  (TAVILY_API_KEY)
 *   YouTubeProvider  — live video search (YOUTUBE_API_KEY)
 *   SeededProvider   — curated, cited corpus (always available)
 */
export interface FeedQuery {
  skills: Skill[];
  level?: Level;
  limit?: number;
}

export interface FeedProvider {
  name: string;
  live: boolean;
  available(): boolean;
  fetch(query: FeedQuery): Promise<FeedItem[]>;
}

/* ── Seeded provider ─────────────────────────────────────────────────────── */

const seededProvider: FeedProvider = {
  name: "seeded",
  live: false,
  available: () => true,
  async fetch({ skills, level, limit = 12 }) {
    const wanted = skills.length ? skills : [...SKILLS];
    const scored = SEED_FEED.filter((i) => wanted.includes(i.skill)).map(
      (i) => ({
        item: { ...i, provider: "seeded" } as FeedItem,
        score:
          (level && i.levels.includes(level) ? 2 : 0) +
          // prefer drills slightly — "what to work on next" is actionable
          (i.type === "drill" ? 0.5 : 0),
      }),
    );
    scored.sort((a, b) => b.score - a.score);
    // Interleave across skills so one area doesn't dominate the top of the feed
    const bySkill = new Map<Skill, FeedItem[]>();
    for (const { item } of scored) {
      const arr = bySkill.get(item.skill) ?? [];
      arr.push(item);
      bySkill.set(item.skill, arr);
    }
    const out: FeedItem[] = [];
    let added = true;
    while (out.length < limit && added) {
      added = false;
      for (const skill of wanted) {
        const arr = bySkill.get(skill);
        const next = arr?.shift();
        if (next) {
          out.push(next);
          added = true;
          if (out.length >= limit) break;
        }
      }
    }
    return out;
  },
};

/* ── Tavily provider (live web search) ───────────────────────────────────── */

const tavilyProvider: FeedProvider = {
  name: "tavily",
  live: true,
  available: () => Boolean(process.env.TAVILY_API_KEY),
  async fetch({ skills, level, limit = 12 }) {
    const wanted = skills.length ? skills : [...SKILLS];
    const perSkill = Math.max(2, Math.ceil(limit / wanted.length));
    const results = await Promise.allSettled(
      wanted.map(async (skill) => {
        const q = `pickleball ${SKILL_LABELS[skill]} ${
          level ? `${level} level ` : ""
        }drills technique tips`;
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
          },
          body: JSON.stringify({ query: q, max_results: perSkill }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`Tavily ${res.status}`);
        const data = (await res.json()) as {
          results?: { title: string; url: string; content: string }[];
        };
        return (data.results ?? []).map(
          (r, i): FeedItem => ({
            id: `tavily-${skill}-${i}`,
            title: r.title,
            url: r.url,
            source: safeHostname(r.url),
            skill,
            type: /drill/i.test(r.title) ? "drill" : "technique",
            levels: level ? [level] : [...LEVELS],
            summary: r.content.slice(0, 220),
            provider: "tavily",
          }),
        );
      }),
    );
    const items = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );
    if (!items.length) throw new Error("Tavily returned no results");
    return items.slice(0, limit);
  },
};

/* ── YouTube provider (live video search) ────────────────────────────────── */

const youtubeProvider: FeedProvider = {
  name: "youtube",
  live: true,
  available: () => Boolean(process.env.YOUTUBE_API_KEY),
  async fetch({ skills, level, limit = 12 }) {
    const wanted = skills.length ? skills : [...SKILLS];
    const perSkill = Math.max(2, Math.ceil(limit / wanted.length));
    const results = await Promise.allSettled(
      wanted.map(async (skill) => {
        const q = `pickleball ${SKILL_LABELS[skill]} ${level ?? ""} drill tutorial`;
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.search = new URLSearchParams({
          part: "snippet",
          q,
          type: "video",
          maxResults: String(perSkill),
          order: "relevance",
          key: process.env.YOUTUBE_API_KEY!,
        }).toString();
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`YouTube ${res.status}`);
        const data = (await res.json()) as {
          items?: {
            id: { videoId: string };
            snippet: { title: string; channelTitle: string; description: string };
          }[];
        };
        return (data.items ?? []).map(
          (v): FeedItem => ({
            id: `yt-${v.id.videoId}`,
            title: decodeHtml(v.snippet.title),
            url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
            source: v.snippet.channelTitle,
            skill,
            type: "drill",
            levels: level ? [level] : [...LEVELS],
            summary: v.snippet.description.slice(0, 220),
            provider: "youtube",
          }),
        );
      }),
    );
    const items = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    );
    if (!items.length) throw new Error("YouTube returned no results");
    return items.slice(0, limit);
  },
};

/* ── Orchestration ───────────────────────────────────────────────────────── */

const PROVIDERS: FeedProvider[] = [tavilyProvider, youtubeProvider, seededProvider];

export async function getFeed(query: FeedQuery): Promise<FeedResponse> {
  for (const p of PROVIDERS) {
    if (!p.available()) continue;
    try {
      const items = await p.fetch(query);
      return { items, provider: p.name, live: p.live };
    } catch (err) {
      console.error(`[feed] provider "${p.name}" failed:`, err);
      // fall through to the next provider — the seed corpus never throws
    }
  }
  return { items: [], provider: "none", live: false };
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
