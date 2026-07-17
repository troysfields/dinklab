"use client";

import { upload } from "@vercel/blob/client";
import { useCallback, useRef, useState } from "react";
import { extractThumbnail } from "@/lib/client/thumbnail";
import { formatBytes, newId } from "@/lib/client/format";
import type { VideoMeta } from "@/lib/types";

const ACCEPTED = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPT_ATTR = ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm";
const MAX_BYTES = 500 * 1024 * 1024;

type UploadState =
  | { phase: "preparing" }
  | { phase: "uploading"; progress: number }
  | { phase: "finalizing" }
  | { phase: "done" }
  | { phase: "error"; message: string };

interface ActiveUpload {
  id: string;
  name: string;
  size: number;
  state: UploadState;
}

export default function UploadDropzone({
  onUploaded,
}: {
  onUploaded?: (video: VideoMeta) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<ActiveUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const setState = (id: string, state: UploadState) =>
    setUploads((u) => u.map((x) => (x.id === id ? { ...x, state } : x)));

  const processFile = useCallback(
    async (file: File) => {
      const id = newId();
      // Validate before any network traffic
      const typeOk =
        ACCEPTED.includes(file.type) || /\.(mp4|mov|webm)$/i.test(file.name);
      if (!typeOk) {
        setUploads((u) => [
          {
            id,
            name: file.name,
            size: file.size,
            state: {
              phase: "error",
              message: "Unsupported format — use MP4, MOV, or WebM.",
            },
          },
          ...u,
        ]);
        return;
      }
      if (file.size > MAX_BYTES) {
        setUploads((u) => [
          {
            id,
            name: file.name,
            size: file.size,
            state: {
              phase: "error",
              message: `Too large (${formatBytes(file.size)}). Max is 500 MB.`,
            },
          },
          ...u,
        ]);
        return;
      }

      setUploads((u) => [
        { id, name: file.name, size: file.size, state: { phase: "preparing" } },
        ...u,
      ]);

      try {
        // 1) Thumbnail + duration, fully client-side
        const { thumb, duration } = await extractThumbnail(file);

        // 2) Video → Blob, direct from browser, with real progress
        const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
        setState(id, { phase: "uploading", progress: 0 });
        const videoBlob = await upload(`videos/${id}.${ext}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: file.type || "video/mp4",
          onUploadProgress: ({ percentage }) =>
            setState(id, { phase: "uploading", progress: percentage }),
        });

        setState(id, { phase: "finalizing" });

        // 3) Thumbnail (best-effort — a missing thumb never fails the upload)
        let thumbUrl: string | undefined;
        if (thumb) {
          try {
            const t = await upload(`thumbs/${id}.jpg`, thumb, {
              access: "public",
              handleUploadUrl: "/api/upload",
              contentType: "image/jpeg",
            });
            thumbUrl = t.url;
          } catch {
            /* keep going */
          }
        }

        // 4) Metadata record
        const meta: VideoMeta = {
          id,
          title: file.name.replace(/\.[^.]+$/, ""),
          filename: file.name,
          videoUrl: videoBlob.url,
          thumbUrl,
          sizeBytes: file.size,
          durationSeconds: duration ?? undefined,
          contentType: file.type || "video/mp4",
          uploadedAt: new Date().toISOString(),
          skills: [],
        };
        await upload(`meta/${id}.json`, JSON.stringify(meta), {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "application/json",
        });

        setState(id, { phase: "done" });
        onUploaded?.(meta);
        // clear the completed row after a beat
        setTimeout(
          () => setUploads((u) => u.filter((x) => x.id !== id)),
          2500,
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message.includes("Storage isn't configured")
              ? "Storage isn't configured — see README to connect Vercel Blob."
              : err.message
            : "Upload failed. Check your connection and try again.";
        setState(id, { phase: "error", message });
      }
    },
    [onUploaded],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      Array.from(files).forEach(processFile);
    },
    [processFile],
  );

  return (
    <section>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload videos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current++;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          if (--dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-card border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
          dragging
            ? "border-optic bg-optic/10 scale-[1.01]"
            : "border-court-600 bg-court-900 hover:border-chalk-faint hover:bg-court-800"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            dragging ? "bg-optic scale-110" : "bg-court-700 group-hover:scale-105"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dragging ? "#0a0f14" : "#d7f549"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-display text-lg font-semibold">
          {dragging ? "Drop it in the kitchen" : "Drag & drop your game film"}
        </p>
        <p className="mt-1 text-sm text-chalk-dim">
          or <span className="text-optic underline underline-offset-2">browse files</span>{" "}
          — MP4, MOV, or WebM up to 500 MB
        </p>
      </div>

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {uploads.map((u) => (
            <li
              key={u.id}
              className="animate-rise rounded-card border border-line bg-court-900 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{u.name}</span>
                <span className="shrink-0 text-xs text-chalk-dim">
                  {u.state.phase === "preparing" && "Reading video…"}
                  {u.state.phase === "uploading" &&
                    `${Math.round(u.state.progress)}%`}
                  {u.state.phase === "finalizing" && "Finishing…"}
                  {u.state.phase === "done" && (
                    <span className="text-optic">✓ Uploaded</span>
                  )}
                  {u.state.phase === "error" && (
                    <span className="text-danger">Failed</span>
                  )}
                </span>
              </div>
              {u.state.phase === "error" ? (
                <p className="mt-1 text-xs text-danger">{u.state.message}</p>
              ) : (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-court-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      u.state.phase === "done" ? "bg-optic" : "bg-optic-dim"
                    } ${
                      u.state.phase === "preparing" ||
                      u.state.phase === "finalizing"
                        ? "animate-pulse-soft"
                        : ""
                    }`}
                    style={{
                      width:
                        u.state.phase === "uploading"
                          ? `${u.state.progress}%`
                          : u.state.phase === "done"
                            ? "100%"
                            : "30%",
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
