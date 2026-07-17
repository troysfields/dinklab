"use client";

import { useCallback, useEffect, useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import VideoCard from "@/components/VideoCard";
import type { VideoMeta } from "@/lib/types";

type LibraryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "unconfigured" }
  | { status: "ready"; videos: VideoMeta[] };

export default function LibraryPage() {
  const [state, setState] = useState<LibraryState>({ status: "loading" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/videos", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
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
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Couldn't load your library.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUploaded = useCallback(
    (video: VideoMeta) => {
      // Optimistic insert, then reconcile with the server
      setState((s) =>
        s.status === "ready"
          ? { status: "ready", videos: [video, ...s.videos] }
          : s,
      );
      setTimeout(load, 1500);
    },
    [load],
  );

  return (
    <div className="space-y-10">
      <section className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Your game, <span className="text-optic">on tape.</span>
        </h1>
        <p className="mt-2 max-w-xl text-chalk-dim">
          Upload gameplay or drill footage, tag what you were working on, and
          DinkLab pairs every clip with training content that targets it.
        </p>
      </section>

      <UploadDropzone onUploaded={handleUploaded} />

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Library</h2>
          {state.status === "ready" && state.videos.length > 0 && (
            <span className="text-sm text-chalk-faint">
              {state.videos.length} video{state.videos.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {state.status === "loading" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse-soft overflow-hidden rounded-card border border-line bg-court-900"
              >
                <div className="aspect-video bg-court-800" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 rounded bg-court-800" />
                  <div className="h-3 w-1/3 rounded bg-court-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
            <p className="font-medium text-danger">{state.message}</p>
            <button
              onClick={() => {
                setState({ status: "loading" });
                load();
              }}
              className="mt-3 rounded-full bg-court-700 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-court-600"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === "unconfigured" && (
          <div className="rounded-card border border-line bg-court-900 p-8 text-center">
            <p className="font-display text-lg font-semibold">
              Storage not connected yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-chalk-dim">
              Connect a Vercel Blob store to this project (or run{" "}
              <code className="rounded bg-court-800 px-1.5 py-0.5 text-xs">
                vercel env pull .env.local
              </code>{" "}
              locally) and uploads light up. The Train tab works without it.
            </p>
          </div>
        )}

        {state.status === "ready" && state.videos.length === 0 && (
          <div className="rounded-card border border-line bg-court-900 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-court-800 text-2xl">
              🎾
            </div>
            <p className="font-display text-lg font-semibold">
              No film yet — every pro started at 0–0–2
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-chalk-dim">
              Drop your first clip above. Once it's tagged, the Train tab
              tailors drills to what the tape shows.
            </p>
          </div>
        )}

        {state.status === "ready" && state.videos.length > 0 && (
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
