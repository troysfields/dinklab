"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getPro, type ProContentItem, type ProInsight } from "@/lib/pros/data";
import { SKILL_LABELS, type Skill, type VideoMeta } from "@/lib/types";

const ACCENT = {
  optic: { text: "text-optic", mono: "bg-optic text-court-950", border: "border-optic/40" },
  sky: { text: "text-sky-300", mono: "bg-sky-400 text-court-950", border: "border-sky-400/40" },
} as const;

const TYPE_LABEL: Record<ProContentItem["type"], string> = {
  video: "Video",
  article: "Article",
  interview: "Interview",
  course: "Course",
};

export default function ProPage() {
  const { slug } = useParams<{ slug: string }>();
  const pro = getPro(slug);

  // Personalization: rank insights by the skills the user actually trains
  const [mySkills, setMySkills] = useState<Skill[] | null>(null);
  useEffect(() => {
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { videos?: VideoMeta[] } | null) => {
        if (!d?.videos) return setMySkills([]);
        const counts = new Map<Skill, number>();
        for (const v of d.videos)
          for (const s of v.skills) counts.set(s, (counts.get(s) ?? 0) + 1);
        setMySkills(
          [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s),
        );
      })
      .catch(() => setMySkills([]));
  }, []);

  // Fresh content (live search when configured, curated otherwise)
  const [content, setContent] = useState<{
    items: ProContentItem[];
    live: boolean;
  } | null>(null);
  const [contentError, setContentError] = useState(false);
  useEffect(() => {
    if (!pro) return;
    fetch(`/api/pros/${pro.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setContent)
      .catch(() => {
        setContentError(true);
        setContent({ items: pro.content, live: false });
      });
  }, [pro]);

  const rankedInsights = useMemo(() => {
    if (!pro) return [];
    if (!mySkills?.length) return pro.insights;
    const rank = (i: ProInsight) => {
      const idx = mySkills.indexOf(i.skill);
      return idx === -1 ? 99 : idx;
    };
    return [...pro.insights].sort((a, b) => rank(a) - rank(b));
  }, [pro, mySkills]);

  if (!pro) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl font-bold">Not on our radar (yet)</p>
        <p className="mt-2 text-chalk-dim">We're not tracking that player.</p>
        <Link
          href="/pros"
          className="mt-6 inline-block rounded-full bg-optic px-5 py-2 font-medium text-court-950 transition-transform hover:scale-105"
        >
          Back to Pro Watch
        </Link>
      </div>
    );
  }

  const a = ACCENT[pro.accent];
  const focused = mySkills?.length ? mySkills[0] : null;
  const matchedInsight = focused
    ? pro.insights.find((i) => i.skill === focused)
    : null;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="animate-rise">
        <Link href="/pros" className="text-sm text-chalk-dim transition-colors hover:text-optic">
          ← Pro Watch
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <span
            className={`flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-bold ${a.mono}`}
          >
            {pro.monogram}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {pro.name}
            </h1>
            <p className={`mt-1 font-medium ${a.text}`}>{pro.role}</p>
          </div>
        </div>
        <p className="mt-5 max-w-3xl leading-relaxed text-chalk-dim">{pro.bio}</p>
        <dl className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          {pro.stats.map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-court-900 p-3 text-center">
              <dd className="font-display text-lg font-bold">{s.value}</dd>
              <dt className="mt-0.5 text-[11px] uppercase tracking-wide text-chalk-faint">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Personalized callout */}
      {matchedInsight && (
        <section
          className={`animate-rise rounded-card border ${a.border} bg-court-900 p-5`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-chalk-faint">
            Matched to your training
          </p>
          <p className="mt-1.5 text-sm text-chalk-dim">
            Your library says you've been working on{" "}
            <span className={`font-semibold ${a.text}`}>
              {SKILL_LABELS[focused!]}
            </span>{" "}
            more than anything else — start with{" "}
            <span className="font-semibold text-chalk">
              “{matchedInsight.title}”
            </span>{" "}
            below.
          </p>
        </section>
      )}

      {/* Why they win */}
      <section>
        <h2 className="font-display text-xl font-semibold">
          Why {pro.name.split(" ")[0]} wins — and what to steal
        </h2>
        <p className="mt-1 text-sm text-chalk-dim">
          Each habit maps to a skill area you can tag and train.
          {mySkills?.length
            ? " Ordered by what you've been working on."
            : " Tag your videos and this list reorders around your game."}
        </p>
        <div className="stagger mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rankedInsights.map((ins) => {
            const isFocus = focused === ins.skill;
            return (
              <article
                key={ins.id}
                className={`flex flex-col rounded-card border bg-court-900 p-5 transition-colors ${
                  isFocus ? a.border : "border-line hover:border-court-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-optic/30 bg-optic/10 px-2.5 py-0.5 text-xs font-medium text-optic">
                    {SKILL_LABELS[ins.skill]}
                  </span>
                  {isFocus && (
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${a.text}`}>
                      Your focus area
                    </span>
                  )}
                </div>
                <h3 className="mt-2.5 font-display text-lg font-semibold">
                  {ins.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-chalk-dim">
                  {ins.proHabit}
                </p>
                <div className="mt-4 rounded-lg border-l-2 border-optic bg-court-800/60 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-optic">
                    Steal this
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{ins.stealThis}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3.5">
                  <a
                    href={ins.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-chalk-faint underline-offset-2 transition-colors hover:text-optic hover:underline"
                  >
                    Source: {ins.sourceName} ↗
                  </a>
                  <Link
                    href="/train"
                    className="text-xs font-medium text-chalk-dim transition-colors hover:text-optic"
                  >
                    Drills for {SKILL_LABELS[ins.skill]} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Latest content */}
      <section>
        <h2 className="font-display text-xl font-semibold">
          Latest from & about {pro.name.split(" ")[0]}
        </h2>
        {content === null ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse-soft h-36 rounded-card border border-line bg-court-900" />
            ))}
          </div>
        ) : (
          <>
            <div className="stagger mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-card border border-line bg-court-900 transition-colors hover:border-court-600"
                >
                  {item.youtubeId && (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
                        title={item.title}
                        allow="accelerometer; encrypted-media; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="h-full w-full"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="w-fit rounded-full bg-court-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-chalk-dim">
                      {TYPE_LABEL[item.type]}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 font-display font-semibold leading-snug transition-colors hover:text-optic"
                    >
                      {item.title} ↗
                    </a>
                    <p className="mt-1.5 line-clamp-2 text-sm text-chalk-dim">
                      {item.summary}
                    </p>
                    <cite className="mt-auto pt-3 text-xs not-italic text-chalk-faint">
                      {item.source}
                    </cite>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-chalk-faint">
              {content.live
                ? "Live results, refreshed on every visit."
                : contentError
                  ? "Live refresh unavailable right now — showing our curated picks (researched July 2026)."
                  : "Curated picks (researched July 2026). Add a TAVILY_API_KEY or YOUTUBE_API_KEY to refresh this live on every visit."}{" "}
              All content belongs to and links to its original publishers.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
