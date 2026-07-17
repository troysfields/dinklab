"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import FeedList from "@/components/FeedList";
import { LevelPicker, SkillPicker } from "@/components/SkillChips";
import { formatBytes, formatDate, formatDuration } from "@/lib/client/format";
import type { Level, Skill, VideoMeta } from "@/lib/types";

type PageState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "error"; message: string }
  | { status: "ready"; video: VideoMeta };

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/videos/${id}`)
      .then(async (res) => {
        if (res.status === 404) return setState({ status: "notfound" });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Couldn't load this video.");
        }
        const data = (await res.json()) as { video: VideoMeta };
        setState({ status: "ready", video: data.video });
      })
      .catch((err) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Load failed.",
        }),
      );
  }, [id]);

  const persist = useCallback(
    (video: VideoMeta) => {
      setState({ status: "ready", video });
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      // Debounce rapid chip toggles into one PATCH
      saveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/videos/${video.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              skills: video.skills,
              level: video.level ?? null,
              title: video.title,
              notes: video.notes,
            }),
          });
          if (!res.ok) throw new Error();
          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 1800);
        } catch {
          setSaveState("error");
        }
      }, 600);
    },
    [],
  );

  const handleDelete = useCallback(async () => {
    if (state.status !== "ready") return;
    if (!window.confirm(`Delete "${state.video.title}"? This can't be undone.`))
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      setDeleting(false);
      alert("Couldn't delete the video. Please try again.");
    }
  }, [id, router, state]);

  if (state.status === "loading") {
    return (
      <div className="animate-pulse-soft space-y-6">
        <div className="aspect-video w-full rounded-card bg-court-900" />
        <div className="h-6 w-1/2 rounded bg-court-900" />
        <div className="h-4 w-1/3 rounded bg-court-900" />
      </div>
    );
  }

  if (state.status === "notfound") {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl font-bold">Out of bounds</p>
        <p className="mt-2 text-chalk-dim">That video doesn&apos;t exist (anymore).</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-optic px-5 py-2 font-medium text-court-950 transition-transform hover:scale-105"
        >
          Back to library
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-card border border-danger/30 bg-danger/5 p-8 text-center text-danger">
        {state.message}
      </div>
    );
  }

  const { video } = state;
  const duration = formatDuration(video.durationSeconds);

  return (
    <div className="space-y-10">
      <div className="animate-rise">
        <Link
          href="/"
          className="text-sm text-chalk-dim transition-colors hover:text-optic"
        >
          ← Library
        </Link>
        <div className="mt-3 overflow-hidden rounded-card border border-line bg-black">
          <video
            src={video.videoUrl}
            poster={video.thumbUrl}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <input
              aria-label="Video title"
              value={video.title}
              onChange={(e) => persist({ ...video, title: e.target.value })}
              className="w-full max-w-xl truncate rounded bg-transparent font-display text-2xl font-bold tracking-tight outline-none transition-colors focus:bg-court-900 sm:text-3xl"
            />
            <p className="mt-1 text-sm text-chalk-faint">
              {formatDate(video.uploadedAt)}
              {duration && ` · ${duration}`} · {formatBytes(video.sizeBytes)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs text-chalk-faint transition-opacity"
              aria-live="polite"
            >
              {saveState === "saving" && "Saving…"}
              {saveState === "saved" && <span className="text-optic">Saved ✓</span>}
              {saveState === "error" && (
                <span className="text-danger">Save failed — retrying on next change</span>
              )}
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full border border-danger/40 px-4 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <section className="animate-rise rounded-card border border-line bg-court-900 p-6">
        <h2 className="font-display text-lg font-semibold">
          What were you working on?
        </h2>
        <p className="mt-1 text-sm text-chalk-dim">
          Tag skills and your level — the training feed below tunes itself to
          match.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-chalk-faint">
              Skill focus
            </p>
            <SkillPicker
              selected={video.skills}
              onToggle={(s: Skill) =>
                persist({
                  ...video,
                  skills: video.skills.includes(s)
                    ? video.skills.filter((x) => x !== s)
                    : [...video.skills, s],
                })
              }
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-chalk-faint">
              Rating level
            </p>
            <LevelPicker
              selected={video.level}
              onSelect={(l: Level | undefined) => persist({ ...video, level: l })}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-xl font-semibold">
          Train what this clip shows
        </h2>
        <p className="mb-4 text-sm text-chalk-dim">
          {video.skills.length
            ? "Matched to this video's tags."
            : "Tag a skill above to narrow this down — showing everything for now."}
        </p>
        <FeedList skills={video.skills} level={video.level} limit={9} />
      </section>
    </div>
  );
}
