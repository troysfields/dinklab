"use client";

import {
  LEVELS,
  LEVEL_LABELS,
  SKILLS,
  SKILL_LABELS,
  type Level,
  type Skill,
} from "@/lib/types";

export function SkillChip({ skill }: { skill: Skill }) {
  return (
    <span className="rounded-full border border-optic/30 bg-optic/10 px-2.5 py-0.5 text-xs font-medium text-optic">
      {SKILL_LABELS[skill]}
    </span>
  );
}

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="rounded-full bg-court-700 px-2.5 py-0.5 text-xs font-semibold text-chalk">
      {LEVEL_LABELS[level]}
    </span>
  );
}

export function SkillPicker({
  selected,
  onToggle,
}: {
  selected: Skill[];
  onToggle: (s: Skill) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SKILLS.map((s) => {
        const on = selected.includes(s);
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
              on
                ? "bg-optic text-court-950 shadow-[0_0_16px_rgba(215,245,73,0.25)]"
                : "border border-court-600 text-chalk-dim hover:border-chalk-faint hover:text-chalk"
            }`}
          >
            {SKILL_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}

export function LevelPicker({
  selected,
  onSelect,
}: {
  selected?: Level;
  onSelect: (l: Level | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {LEVELS.map((l) => {
        const on = selected === l;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? undefined : l)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
              on
                ? "bg-chalk text-court-950"
                : "border border-court-600 text-chalk-dim hover:border-chalk-faint hover:text-chalk"
            }`}
          >
            {LEVEL_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
