"use client";

import Link from "next/link";
import { formatDate, formatDuration } from "@/lib/client/format";
import type { VideoMeta } from "@/lib/types";
import { LevelBadge, SkillChip } from "./SkillChips";

export default function VideoCard({ video }: { video: VideoMeta }) {
  const duration = formatDuration(video.durationSeconds);
  return (
    <Link
      href={`/video/${video.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-court-900 transition-all duration-300 hover:-translate-y-1 hover:border-court-600 hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-video overflow-hidden bg-court-800">
        {video.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-chalk-faint">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
            </svg>
          </div>
        )}
        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-court-950/85 px-1.5 py-0.5 text-xs font-medium tabular-nums">
            {duration}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-court-950/0 transition-colors duration-300 group-hover:bg-court-950/30">
          <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-optic opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0f14" aria-hidden>
              <polygon points="6 3 21 12 6 21" />
            </svg>
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate font-display font-semibold" title={video.title}>
          {video.title}
        </h3>
        <p className="mt-0.5 text-xs text-chalk-faint">
          {formatDate(video.uploadedAt)}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {video.level && <LevelBadge level={video.level} />}
          {video.skills.slice(0, 3).map((s) => (
            <SkillChip key={s} skill={s} />
          ))}
          {video.skills.length === 0 && !video.level && (
            <span className="text-xs italic text-chalk-faint">
              Untagged — click to tag
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
