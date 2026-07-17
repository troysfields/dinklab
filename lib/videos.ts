import { list, del } from "@vercel/blob";
import type { VideoMeta } from "./types";

/**
 * Persistence model: no database. Each upload writes three blobs —
 *   videos/<id>.<ext>   the video file (client-uploaded, streams to playback)
 *   thumbs/<id>.jpg     canvas-captured thumbnail
 *   meta/<id>.json      VideoMeta record
 * The library is rebuilt by listing meta/ — right-sized for a single-user
 * product and trivially swappable for Postgres when auth/multi-user lands.
 */

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function listVideos(): Promise<VideoMeta[]> {
  const { blobs } = await list({ prefix: "meta/", limit: 1000 });
  const metas = await Promise.all(
    blobs.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: "no-store" });
        if (!res.ok) return null;
        return (await res.json()) as VideoMeta;
      } catch {
        return null; // a corrupt/missing meta blob shouldn't break the library
      }
    }),
  );
  return metas
    .filter((m): m is VideoMeta => m !== null && typeof m.id === "string")
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function getVideo(id: string): Promise<VideoMeta | null> {
  if (!/^[a-z0-9-]+$/i.test(id)) return null;
  const { blobs } = await list({ prefix: `meta/${id}.json` });
  const blob = blobs.find((b) => b.pathname === `meta/${id}.json`);
  if (!blob) return null;
  try {
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as VideoMeta;
  } catch {
    return null;
  }
}

export async function deleteVideo(meta: VideoMeta): Promise<void> {
  // Only pass genuine blob-store URLs to del() — a corrupt meta record with a
  // foreign URL must not make the whole delete fail.
  const urls = [meta.videoUrl, meta.thumbUrl].filter(
    (u): u is string => Boolean(u) && u!.includes(".blob.vercel-storage.com"),
  );
  const { blobs } = await list({ prefix: `meta/${meta.id}.json` });
  await del([...urls, ...blobs.map((b) => b.url)]);
}
