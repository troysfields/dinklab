"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SKILLS, SKILL_LABELS, type Skill, type VideoMeta } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "unconfigured" }
  | { status: "ready"; videos: VideoMeta[] };

const WEEKS = 8;

export default function ProgressPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    fetch("/api/videos", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Couldn't load progress data.");
        }
        const data = (await res.json()) as {
          videos: VideoMeta[];
          storageConfigured: boolean;
        };
        setState(
          data.storageConfigured
            ? { status: "ready", videos: data.videos }
            : { status: "unconfigured" },
        );
      })
      .catch((err) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Load failed.",
        }),
      );
  }, []);

  const stats = useMemo(() => {
    if (state.status !== "ready") return null;
    const { videos } = state;

    // Uploads per week for the last WEEKS weeks
    const now = new Date();
    const weekStart = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
      return x;
    };
    const thisWeek = weekStart(now);
    const weeks = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(thisWeek);
      start.setDate(start.getDate() - 7 * (WEEKS - 1 - i));
      return { start, count: 0 };
    });
    for (const v of videos) {
      const t = new Date(v.uploadedAt).getTime();
      for (const w of weeks) {
        const end = new Date(w.start);
        end.setDate(end.getDate() + 7);
        if (t >= w.start.getTime() && t < end.getTime()) {
          w.count++;
          break;
        }
      }
    }

    // Skill focus breakdown
    const skillCounts = Object.fromEntries(SKILLS.map((s) => [s, 0])) as Record<
      Skill,
      number
    >;
    for (const v of videos) for (const s of v.skills) skillCounts[s]++;
    const maxSkill = Math.max(1, ...Object.values(skillCounts));

    const totalSeconds = videos.reduce(
      (acc, v) => acc + (v.durationSeconds ?? 0),
      0,
    );
    const tagged = videos.filter((v) => v.skills.length > 0).length;
    const topSkill = (Object.entries(skillCounts) as [Skill, number][]).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      weeks,
      maxWeek: Math.max(1, ...weeks.map((w) => w.count)),
      skillCounts,
      maxSkill,
      totalSeconds,
      tagged,
      topSkill: topSkill[1] > 0 ? topSkill[0] : null,
      total: videos.length,
    };
  }, [state]);

  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Progress <span className="text-optic">check.</span>
        </h1>
        <p className="mt-2 max-w-xl text-chalk-dim">
          How much film you&apos;re putting up, and where the work is going.
        </p>
      </section>

      {state.status === "loading" && (
        <div className="animate-pulse-soft grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-card border border-line bg-court-900" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-card border border-danger/30 bg-danger/5 p-8 text-center text-danger">
          {state.message}
        </div>
      )}

      {state.status === "unconfigured" && (
        <div className="rounded-card border border-line bg-court-900 p-10 text-center">
          <p className="font-display text-lg font-semibold">
            Storage not connected yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-chalk-dim">
            Progress tracking lights up once uploads are configured.
          </p>
        </div>
      )}

      {state.status === "ready" && stats && stats.total === 0 && (
        <div className="rounded-card border border-line bg-court-900 p-10 text-center">
          <p className="font-display text-lg font-semibold">Nothing to chart yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-dim">
            Upload and tag a few clips — this page turns into your training
            story.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-optic px-5 py-2 text-sm font-semibold text-court-950 transition-transform hover:scale-105"
          >
            Upload your first video
          </Link>
        </div>
      )}

      {state.status === "ready" && stats && stats.total > 0 && (
        <>
          {/* Stat cards */}
          <section className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Videos on file" value={String(stats.total)} />
            <StatCard
              label="Footage logged"
              value={
                stats.totalSeconds > 0
                  ? `${Math.max(1, Math.round(stats.totalSeconds / 60))} min`
                  : "—"
              }
            />
            <StatCard
              label="Tagged"
              value={`${stats.tagged}/${stats.total}`}
              hint={
                stats.tagged < stats.total
                  ? "Tag the rest to sharpen your feed"
                  : "All film tagged — nice"
              }
            />
            <StatCard
              label="Biggest focus"
              value={stats.topSkill ? SKILL_LABELS[stats.topSkill] : "—"}
            />
          </section>

          {/* Uploads over time */}
          <section className="animate-rise rounded-card border border-line bg-court-900 p-6">
            <h2 className="font-display text-lg font-semibold">
              Uploads · last {WEEKS} weeks
            </h2>
            <div className="mt-5 flex h-36 items-end gap-2 sm:gap-3">
              {stats.weeks.map((w, i) => (
                <div
                  key={i}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs tabular-nums text-chalk-faint opacity-0 transition-opacity group-hover:opacity-100">
                    {w.count}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      w.count > 0 ? "bg-optic" : "bg-court-700"
                    } group-hover:bg-optic-dim`}
                    style={{
                      height: `${Math.max(6, (w.count / stats.maxWeek) * 100)}%`,
                    }}
                    title={`${w.count} upload${w.count === 1 ? "" : "s"}`}
                  />
                  <span className="text-[10px] text-chalk-faint">
                    {w.start.toLocaleDateString(undefined, {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Skill focus */}
          <section className="animate-rise rounded-card border border-line bg-court-900 p-6">
            <h2 className="font-display text-lg font-semibold">
              Where the work is going
            </h2>
            <p className="mt-1 text-sm text-chalk-dim">
              Skill tags across your library.
            </p>
            <div className="mt-5 space-y-3">
              {SKILLS.map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-chalk-dim">
                    {SKILL_LABELS[s]}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-court-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-optic-dim to-optic transition-all duration-700"
                      style={{
                        width: `${(stats.skillCounts[s] / stats.maxSkill) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm tabular-nums text-chalk-faint">
                    {stats.skillCounts[s]}
                  </span>
                </div>
              ))}
            </div>
            {Object.values(stats.skillCounts).every((c) => c === 0) && (
              <p className="mt-4 text-sm italic text-chalk-faint">
                No skill tags yet — tag your videos to see where your training
                time goes.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-court-900 p-5 transition-colors hover:border-court-600">
      <p className="text-xs font-semibold uppercase tracking-wider text-chalk-faint">
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-optic">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-chalk-faint">{hint}</p>}
    </div>
  );
}
