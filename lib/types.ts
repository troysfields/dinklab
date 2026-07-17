/** Skill areas the platform organizes everything around. */
export const SKILLS = [
  "dinks",
  "serves",
  "third-shot-drops",
  "positioning",
  "footwork",
] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<Skill, string> = {
  dinks: "Dinks",
  serves: "Serves",
  "third-shot-drops": "Third-Shot Drops",
  positioning: "Positioning",
  footwork: "Footwork",
};

/** Player rating levels used for tagging + feed matching. */
export const LEVELS = ["beginner", "intermediate", "3.5+", "4.0+"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  "3.5+": "3.5+",
  "4.0+": "4.0+",
};

/** Metadata stored as meta/<id>.json in Blob storage — one per uploaded video. */
export interface VideoMeta {
  id: string;
  title: string;
  filename: string;
  /** Public blob URL of the video file. */
  videoUrl: string;
  /** Public blob URL of the generated thumbnail (may be absent if generation failed). */
  thumbUrl?: string;
  sizeBytes: number;
  durationSeconds?: number;
  contentType: string;
  uploadedAt: string; // ISO timestamp
  skills: Skill[];
  level?: Level;
  notes?: string;
}

export type FeedItemType = "drill" | "technique" | "strategy";

/** A single piece of training content surfaced in the feed. */
export interface FeedItem {
  id: string;
  title: string;
  url: string;
  source: string; // publisher name, shown as the citation
  skill: Skill;
  type: FeedItemType;
  levels: Level[];
  summary: string;
  /** Which provider produced this item ("seeded" | "tavily" | "youtube"). */
  provider: string;
}

export interface FeedResponse {
  items: FeedItem[];
  provider: string;
  live: boolean;
}
