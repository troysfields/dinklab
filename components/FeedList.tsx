"use client";

import { useEffect, useState } from "react";
import type { FeedItem, FeedResponse, Level, Skill } from "@/lib/types";
import { SKILL_LABELS } from "@/lib/types";

const TYPE_STYLE: Record<FeedItem["type"], string> = {
  drill: "bg-optic/15 text-optic border-optic/30",
  technique: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  strategy: "bg-violet-400/10 text-violet-300 border-violet-400/25",
};

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-card border border-line bg-court-900 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-court-600 hover:shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_STYLE[item.type]}`}
        >
          {item.type}
        </span>
        <span className="text-xs text-chalk-faint">
          {SKILL_LABELS[item.skill]}
        </span>
      </div>
      <h3 className="mt-2.5 font-display font-semibold leading-snug group-hover:text-optic">
        {item.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-chalk-dim">{item.summary}</p>
      <div className="mt-auto flex items-center justify-between pt-3">
        <cite className="text-xs not-italic text-chalk-faint">
          {item.source}
        </cite>
        <span
          className="text-chalk-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-optic"
          aria-hidden
        >
          ↗
        </span>
      </div>
    </a>
  );
}

type FeedState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; feed: FeedResponse };

export default function FeedList({
  skills,
  level,
  limit = 12,
  emptyHint,
}: {
  skills: Skill[];
  level?: Level;
  limit?: number;
  emptyHint?: string;
}) {
  const [state, setState] = useState<FeedState>({ status: "loading" });
  const key = `${skills.join(",")}|${level ?? ""}|${limit}`;

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const params = new URLSearchParams();
    if (skills.length) params.set("skills", skills.join(","));
    if (level) params.set("level", level);
    params.set("limit", String(limit));
    fetch(`/api/feed?${params}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Couldn't load training content.");
        }
        return (await res.json()) as FeedResponse;
      })
      .then((feed) => !cancelled && setState({ status: "ready", feed }))
      .catch(
        (err) =>
          !cancelled &&
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Feed failed.",
          }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (state.status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse-soft h-44 rounded-card border border-line bg-court-900 p-5"
          >
            <div className="h-4 w-16 rounded-full bg-court-800" />
            <div className="mt-3 h-4 w-4/5 rounded bg-court-800" />
            <div className="mt-2 h-3 w-full rounded bg-court-800" />
            <div className="mt-1.5 h-3 w-2/3 rounded bg-court-800" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center text-sm text-danger">
        {state.message}
      </div>
    );
  }

  const { feed } = state;
  if (feed.items.length === 0) {
    return (
      <div className="rounded-card border border-line bg-court-900 p-8 text-center text-sm text-chalk-dim">
        {emptyHint ?? "No training content matched. Try widening your filters."}
      </div>
    );
  }

  return (
    <div>
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feed.items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
      <p className="mt-4 text-xs text-chalk-faint">
        {feed.live
          ? `Live results via ${feed.provider} web search.`
          : "Curated from published coaching resources (July 2026). Add a TAVILY_API_KEY or YOUTUBE_API_KEY to switch to live search."}{" "}
        All content credits and links to its original publisher.
      </p>
    </div>
  );
}
