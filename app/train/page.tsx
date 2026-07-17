"use client";

import { useState } from "react";
import FeedList from "@/components/FeedList";
import { LevelPicker, SkillPicker } from "@/components/SkillChips";
import type { Level, Skill } from "@/lib/types";

export default function TrainPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [level, setLevel] = useState<Level | undefined>(undefined);

  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Training <span className="text-optic">feed.</span>
        </h1>
        <p className="mt-2 max-w-xl text-chalk-dim">
          Drills, technique breakdowns, and strategy from real coaching sources
          — filtered to the skills you&apos;re working on.
        </p>
      </section>

      <section className="animate-rise rounded-card border border-line bg-court-900 p-5">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-chalk-faint">
              Skill areas{" "}
              <span className="font-normal normal-case">
                (none selected = all)
              </span>
            </p>
            <SkillPicker
              selected={skills}
              onToggle={(s: Skill) =>
                setSkills((prev) =>
                  prev.includes(s)
                    ? prev.filter((x) => x !== s)
                    : [...prev, s],
                )
              }
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-chalk-faint">
              Level
            </p>
            <LevelPicker selected={level} onSelect={setLevel} />
          </div>
        </div>
      </section>

      <FeedList skills={skills} level={level} limit={15} />
    </div>
  );
}
