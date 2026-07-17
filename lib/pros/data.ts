import type { Skill } from "@/lib/types";

/**
 * Pro Watch — tracked players.
 * Facts, insights, and content researched July 2026; every claim links its
 * source. Content is linked/embedded from its original publishers (we never
 * rehost pro footage — that's their copyright).
 */

export interface ProInsight {
  id: string;
  /** Which of our five skill areas this maps to — powers personalization. */
  skill: Skill;
  title: string;
  /** What the pro actually does, specifically. */
  proHabit: string;
  /** The everyday-player translation: what to steal and how. */
  stealThis: string;
  sourceUrl: string;
  sourceName: string;
}

export interface ProContentItem {
  id: string;
  type: "video" | "article" | "interview" | "course";
  title: string;
  url: string;
  source: string;
  summary: string;
  /** Set for YouTube items → renders an inline embed instead of just a link. */
  youtubeId?: string;
}

export interface ProPlayer {
  slug: string;
  name: string;
  role: string;
  tagline: string;
  monogram: string;
  /** Accent hue for the player's identity on cards/pages. */
  accent: "optic" | "sky";
  stats: { label: string; value: string; source?: string }[];
  bio: string;
  /** The reasoning layer: why this player wins, mapped to trainable skills. */
  insights: ProInsight[];
  content: ProContentItem[];
  /** Query used by the live-search provider for fresh content. */
  searchQuery: string;
}

export const PROS: ProPlayer[] = [
  {
    slug: "ben-johns",
    name: "Ben Johns",
    role: "PPA #1 — Men's & Mixed Doubles",
    tagline: "The most patient, disciplined player on tour.",
    monogram: "BJ",
    accent: "optic",
    stats: [
      { label: "DUPR", value: "7.12" },
      { label: "PPA titles", value: "120+" },
      { label: "Triple Crowns", value: "Most ever" },
      { label: "Doubles rank", value: "#1" },
    ],
    bio: "Widely considered the greatest pickleball player of all time, Johns has held #1 in all three divisions for most of the time since 2020. In 2026 the field has caught up to him in singles — but not in doubles, where his patience and shot discipline keep the gap growing. He teaches his complete system on Pickleball 360 with his brother Collin.",
    searchQuery: "Ben Johns pickleball",
    insights: [
      {
        id: "bj-backhand-roll",
        skill: "dinks",
        title: "The disguised backhand roll",
        proHabit:
          "Johns' signature attack starts looking exactly like a normal dink — same setup, same posture — until the last moment, when legs, hips, and forearm extension (not a wrist flick) turn it into a topspin roll aimed at the right hip of the nearest opponent.",
        stealThis:
          "Stop announcing your attacks. Practice one dink motion that can become either a soft dink or a roll — knees bent, paddle below the ball, upward path at ~40°. If your opponent can't read which is coming, even a modest roll wins hands battles.",
        sourceUrl:
          "https://pickleballunion.com/ben-johns-backhand-roll/",
        sourceName: "Pickleball Union",
      },
      {
        id: "bj-patience",
        skill: "third-shot-drops",
        title: "Patience as a weapon",
        proHabit:
          "What separates Johns in 2026 isn't pace — it's that he's the most patient and disciplined player on tour. He resets and drops until the odds flip, refusing low-percentage speedups that the power generation lives on.",
        stealThis:
          "Count your unforced errors from impatience in your next game film. If you're attacking balls below net height, you're donating points. Drill drops until the reset feels safer than the speedup — that's when your win rate moves.",
        sourceUrl:
          "https://thekitchenpickle.com/blogs/news/top-20-mens-pickleball-players-ranked-by-anonymous-pro/",
        sourceName: "The Kitchen",
      },
      {
        id: "bj-plays",
        skill: "positioning",
        title: "Runs plays, not shots",
        proHabit:
          "Johns thinks in sequences — serve deep to pin, drop to advance, press the line together, isolate the weaker defender. His court position is always part of a plan two shots ahead.",
        stealThis:
          "Pick one pattern per rec game (e.g., 'deep serve → drop → both to the line') and run it every rally. One rehearsed play beats ten improvised shots — and it makes your partner predictable to you, not to opponents.",
        sourceUrl: "https://m.youtube.com/watch?v=UkHWIy_4l2k",
        sourceName: "Ben Johns (YouTube)",
      },
      {
        id: "bj-third",
        skill: "serves",
        title: "Serve depth sets up everything",
        proHabit:
          "Johns' serve isn't his flashiest weapon, but it lands deep with pace consistently, buying the extra half-second his third-shot drop needs to be unattackable.",
        stealThis:
          "Chase depth before spin. Target the back third of the box on every serve for a week — a deep, medium-pace serve improves your third shot more than any serve trick, because the return comes back slower and shorter.",
        sourceUrl: "https://www.youtube.com/watch?v=mIzddYkHV6Q",
        sourceName: "Pickleball 360 (YouTube)",
      },
    ],
    content: [
      {
        id: "bj-yt",
        type: "video",
        title: "Ben Johns' official channel — monthly tips & insight",
        url: "https://www.youtube.com/@BenJohns_pb",
        source: "YouTube",
        summary:
          "The world #1's own channel: exclusive technique tips and match insight, new videos monthly.",
      },
      {
        id: "bj-plays-video",
        type: "video",
        title: "5 Pickleball Plays Ben Johns Uses to DOMINATE",
        url: "https://www.youtube.com/watch?v=UkHWIy_4l2k",
        source: "YouTube",
        summary:
          "Johns breaks down the actual play sequences he runs in pro matches — and when to trigger each one.",
        youtubeId: "UkHWIy_4l2k",
      },
      {
        id: "bj-third-video",
        type: "video",
        title: "Ben Johns teaches the secret to pickleball's 3rd shot",
        url: "https://www.youtube.com/watch?v=mIzddYkHV6Q",
        source: "YouTube",
        summary:
          "The GOAT's own breakdown of the shot that decides whether the serving team ever reaches the kitchen.",
        youtubeId: "mIzddYkHV6Q",
      },
      {
        id: "bj-360",
        type: "course",
        title: "Pickleball 360 — Johns' full instructional system",
        url: "https://pickleball360.com/",
        source: "Pickleball 360",
        summary:
          "200+ step-by-step lessons from Ben, Collin Johns, and Dekel Bar, from fundamentals to pro-level strategy.",
      },
      {
        id: "bj-roll-breakdown",
        type: "article",
        title: "Mastering the backhand roll: tips from Ben Johns",
        url: "https://joola.com/blogs/updates/mastering-the-backhand-roll-in-pickleball-tips-from-ben-johns",
        source: "JOOLA",
        summary:
          "Full mechanics of the signature shot — kinetic chain, contact point, and when to pull the trigger.",
      },
      {
        id: "bj-mesa",
        type: "article",
        title: "Johns' 2026 singles comeback at the Mesa Cup",
        url: "https://georgianbaynews.com/ben-johns-2026-pro-singles-comeback-at-mesa-cup-paddle-setup-opponents-and-what-it-means-for-ppa-dominance/",
        source: "Georgian Bay News",
        summary:
          "How Johns adapted his game (and paddle setup) returning to a singles field reshaped by power players.",
      },
    ],
  },
  {
    slug: "anna-leigh-waters",
    name: "Anna Leigh Waters",
    role: "PPA #1 — Singles, Doubles & Mixed",
    tagline: "The aggression that rewrote the women's game.",
    monogram: "AW",
    accent: "sky",
    stats: [
      { label: "World rank", value: "#1 ×3" },
      { label: "Career golds", value: "181+" },
      { label: "Triple Crowns", value: "39" },
      { label: "2026 US Open", value: "2× gold" },
    ],
    bio: "The best female player ever at just 19 — #1 in all three divisions, with the gap to #2 still widening in 2026. Waters blended tennis power into pickleball and shifted the entire women's meta toward speedups, hand battles, and athletic attacking. First pickleball athlete signed by Nike.",
    searchQuery: "Anna Leigh Waters pickleball",
    insights: [
      {
        id: "alw-split",
        skill: "footwork",
        title: "Split step on every single ball",
        proHabit:
          "Waters split steps every time her opponent hits — her words: \"If I don't split step, I'm just standing there, so I split step so I'm ready for a speed up.\" It's why her counters look impossibly fast.",
        stealThis:
          "The single most stealable pro habit, and it's free. Land a small hop the instant your opponent makes contact — every ball, both games of every rec night, until it's automatic. Your reaction speed 'improves' overnight because you were never flat-footed.",
        sourceUrl:
          "https://pickleball.com/learn/how-to-counter-attack-like-anna-leigh-waters",
        sourceName: "Pickleball.com",
      },
      {
        id: "alw-speedup",
        skill: "dinks",
        title: "Speed up from low — with spin, not hope",
        proHabit:
          "\"You can speed up any ball if you get low enough and get enough spin. It might not be the right decision, but I don't think you should be waiting around for the perfect ball.\" Waters attacks opponents while they're moving and off balance, not when the ball is perfect.",
        stealThis:
          "Attack timing beats attack quality: watch your opponent's feet, and speed up the moment they're mid-shuffle. But earn it first — get low and brush topspin so the ball dips. A dipping mediocre speedup is safer than a flat perfect one.",
        sourceUrl:
          "https://pickleball.com/people/waters-on-her-aggressive-game-style-find-your-strengths-and-use-them-to-your-advantage",
        sourceName: "Pickleball.com",
      },
      {
        id: "alw-strengths",
        skill: "positioning",
        title: "Build the game around YOUR strengths",
        proHabit:
          "Waters didn't mold herself to pickleball orthodoxy — she kept her tennis-bred power game and forced the sport to adapt: \"Find your strengths and use them to your advantage.\" Her positioning is engineered to create the hands battles she wins.",
        stealThis:
          "Stop copying the style of whoever beat you last. Tag five of your clips, find the skill where you win the most rallies, then position to force that situation more often. Strong forehand counter? Shade middle and invite the speedup.",
        sourceUrl:
          "https://pickleball.com/people/waters-on-her-aggressive-game-style-find-your-strengths-and-use-them-to-your-advantage",
        sourceName: "Pickleball.com",
      },
      {
        id: "alw-defense",
        skill: "third-shot-drops",
        title: "Grit defense wins finals",
        proHabit:
          "Her 2026 US Open mixed final was won 11-9 in what observers called 'an amazing display of grit and defensive pickleball' — the sport's most aggressive player wins her biggest matches with resets and defense.",
        stealThis:
          "Aggression needs an escape hatch. When you get sped up on, your only job is one soft reset into the kitchen — not a counter-attack. Drill the reset until being attacked feels like an opportunity to make them overhit.",
        sourceUrl:
          "https://www.forbes.com/sites/toddboss/2026/04/20/waters-takes-home-double-gold-at-the-2026-franklin-us-open/",
        sourceName: "Forbes",
      },
    ],
    content: [
      {
        id: "alw-yt",
        type: "video",
        title: "Anna Leigh Waters' official channel",
        url: "https://www.youtube.com/@Anna.Leigh.Waters",
        source: "YouTube",
        summary:
          "On-court moments, behind-the-scenes pro life, and her 'In the Kitchen' cooking-and-conversation series.",
      },
      {
        id: "alw-counter",
        type: "article",
        title: "How to counter attack like Anna Leigh Waters",
        url: "https://pickleball.com/learn/how-to-counter-attack-like-anna-leigh-waters",
        source: "Pickleball.com",
        summary:
          "The split-step habit and ready-position details behind the fastest hands in the women's game.",
      },
      {
        id: "alw-attack",
        type: "article",
        title: "How to attack like Anna Leigh Waters",
        url: "https://pickleball.com/learn/how-to-attack-like-anna-leigh-waters",
        source: "Pickleball.com",
        summary:
          "Her speedup selection rules: attack off-balance opponents, get low, and never wait for perfect.",
      },
      {
        id: "alw-interview",
        type: "interview",
        title: "Her unfiltered truth about being #1 in the world",
        url: "https://www.youtube.com/watch?v=xxg741fHJNk",
        source: "YouTube",
        summary:
          "Long-form conversation on pressure, preparation, and what it costs to stay on top.",
        youtubeId: "xxg741fHJNk",
      },
      {
        id: "alw-usopen",
        type: "article",
        title: "Double gold at the 2026 US Open",
        url: "https://www.forbes.com/sites/toddboss/2026/04/20/waters-takes-home-double-gold-at-the-2026-franklin-us-open/",
        source: "Forbes",
        summary:
          "Match-by-match account of her Naples sweep — including the 11-9 defensive masterclass in the mixed final.",
      },
      {
        id: "alw-profile",
        type: "article",
        title: "The best female player ever. And only 19.",
        url: "https://www.nbcnews.com/sports/pickleball/anna-leigh-waters-pickleball-sports-rcna343381",
        source: "NBC News",
        summary:
          "Profile of the player whose aggression shifted the entire meta of women's pickleball.",
      },
    ],
  },
];

export function getPro(slug: string): ProPlayer | undefined {
  return PROS.find((p) => p.slug === slug);
}
