import Link from "next/link";
import type { Metadata } from "next";
import { PROS } from "@/lib/pros/data";

export const metadata: Metadata = { title: "Pro Watch" };

const ACCENT = {
  optic: {
    ring: "from-optic/60 to-optic/10",
    text: "text-optic",
    mono: "bg-optic text-court-950",
  },
  sky: {
    ring: "from-sky-400/60 to-sky-400/10",
    text: "text-sky-300",
    mono: "bg-sky-400 text-court-950",
  },
} as const;

export default function ProsPage() {
  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Pro <span className="text-optic">Watch.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-chalk-dim">
          We track the players defining the sport, pull their current content
          from around the web, and break down <em>why</em> they win — in moves
          you can actually steal for your own game.
        </p>
      </section>

      <div className="stagger grid grid-cols-1 gap-5 md:grid-cols-2">
        {PROS.map((pro) => {
          const a = ACCENT[pro.accent];
          return (
            <Link
              key={pro.slug}
              href={`/pros/${pro.slug}`}
              className="group relative overflow-hidden rounded-card border border-line bg-court-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-court-600 hover:shadow-[0_14px_36px_rgba(0,0,0,0.5)]"
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${a.ring} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40`}
              />
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${a.mono} transition-transform duration-300 group-hover:scale-105`}
                >
                  {pro.monogram}
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    {pro.name}
                  </h2>
                  <p className={`text-sm font-medium ${a.text}`}>{pro.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-chalk-dim">
                “{pro.tagline}”
              </p>
              <dl className="mt-5 grid grid-cols-4 gap-2">
                {pro.stats.map((s) => (
                  <div key={s.label} className="rounded-lg bg-court-800 p-2 text-center">
                    <dd className="font-display text-sm font-bold">{s.value}</dd>
                    <dt className="mt-0.5 text-[10px] uppercase tracking-wide text-chalk-faint">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm font-medium text-chalk-dim transition-colors group-hover:text-optic">
                {pro.insights.length} insights · {pro.content.length} sources →
              </p>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-chalk-faint">
        All stats and claims cite their sources on each player page. Content is
        linked or embedded from its original publishers.
      </p>
    </div>
  );
}
