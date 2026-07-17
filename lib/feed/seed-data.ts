import type { FeedItem } from "@/lib/types";

/**
 * Curated, real training content gathered via web research (July 2026).
 * Every URL is a genuine published resource; `source` is shown as the citation.
 * This is the fallback corpus when no live-search API key is configured.
 */
export const SEED_FEED: Omit<FeedItem, "provider">[] = [
  // ── Dinks ────────────────────────────────────────────────────────────────
  {
    id: "dink-01",
    title: "How to Dink in Pickleball: Ultimate Step-by-Step Guide (2026)",
    url: "https://www.thedinkpickleball.com/how-to-dink-in-pickleball-ultimate-step-by-step-guide-2026/",
    source: "The Dink Pickleball",
    skill: "dinks",
    type: "technique",
    levels: ["beginner", "intermediate"],
    summary:
      "Continental grip, paddle face open 5–10°, contact in front at knee height, low-to-high lift with a quiet wrist — the full mechanics of a reliable dink.",
  },
  {
    id: "dink-02",
    title: "5 Pickleball Dink Drills to Instantly Improve Your Game",
    url: "https://www.thedinkpickleball.com/5-pickleball-dink-drills-to-instantly-improve-your-game/",
    source: "The Dink Pickleball",
    skill: "dinks",
    type: "drill",
    levels: ["beginner", "intermediate", "3.5+"],
    summary:
      "Five partner drills including cross-court rallies to 50 and target-zone dinking — build soft hands and consistency at the kitchen line.",
  },
  {
    id: "dink-03",
    title: "Pickleball Dink Strategy: How to Win the Kitchen",
    url: "https://playbookpaddles.com/blog/pickleball-dink-strategy",
    source: "Pickleball Playbook",
    skill: "dinks",
    type: "strategy",
    levels: ["3.5+", "4.0+"],
    summary:
      "When to dink cross-court vs. straight on, attacking off high dinks, and aiming at feet instead of open court to force pop-ups.",
  },
  {
    id: "dink-04",
    title: "Master the Pickleball Dink: Technique, Strategy & Drills",
    url: "https://www.utrsports.net/blogs/news/master-the-pickleball-dink-technique-strategy-drills-utr-sports",
    source: "UTR Sports",
    skill: "dinks",
    type: "technique",
    levels: ["intermediate", "3.5+"],
    summary:
      "Grip pressure around 4/10, legs and shoulder doing the work — fixes for the tension pop-up, the most common dink error.",
  },
  {
    id: "dink-05",
    title: "Pickleball Dinking Technique: The Complete Beginner's Guide",
    url: "https://www.thedinkpickleball.com/pickleball-dinking-technique-the-complete-beginners-guide/",
    source: "The Dink Pickleball",
    skill: "dinks",
    type: "technique",
    levels: ["beginner"],
    summary:
      "Neutral ready position, shuffle-step footwork between dinks, and 'Protect the Castle' — the beginner-friendly path into the soft game.",
  },
  {
    id: "dink-06",
    title: "The 12 Pickleball Drills You Need for Your Best Game in 2026",
    url: "https://www.thedinkpickleball.com/the-12-drills-you-need-to-play-your-best-pickleball-in-2026/",
    source: "The Dink Pickleball",
    skill: "dinks",
    type: "drill",
    levels: ["intermediate", "3.5+", "4.0+"],
    summary:
      "A full 2026 drill program — includes the dink warm-up with angled shuffle steps and taking balls out of the air.",
  },

  // ── Serves ───────────────────────────────────────────────────────────────
  {
    id: "serve-01",
    title: "The Only Pickleball Serve You Need in 2026",
    url: "https://www.thedinkpickleball.com/the-only-pickleball-serve-you-need-in-2026/",
    source: "The Dink Pickleball",
    skill: "serves",
    type: "technique",
    levels: ["intermediate", "3.5+", "4.0+"],
    summary:
      "The modern deep power serve: leg drive → hip rotation → arm acceleration, landing between the 10-foot line and baseline.",
  },
  {
    id: "serve-02",
    title: "7 Pickleball Serve Drills: Technique and Strategy",
    url: "https://paddlespeed.com/blog/pickleball-serve-technique",
    source: "PaddleSpeed",
    skill: "serves",
    type: "drill",
    levels: ["beginner", "intermediate", "3.5+"],
    summary:
      "Target practice with cones and towels in the service box, shrinking targets progressively — accuracy before power.",
  },
  {
    id: "serve-03",
    title: "3 Pickleball Serves That Create Instant Pressure",
    url: "https://www.thedinkpickleball.com/3-pickleball-serves-that-create-instant-pressure/",
    source: "The Dink Pickleball",
    skill: "serves",
    type: "strategy",
    levels: ["3.5+", "4.0+"],
    summary:
      "Mixing the flat serve, sidespin 'screwball,' and deep topspin serve to break returner timing and force weak returns.",
  },
  {
    id: "serve-04",
    title: "The Pickleball Serve Basics: Rules, Technique & Pro Tips",
    url: "https://www.thedinkpickleball.com/the-pickleball-serve-basics-rules-technique-pro-tips-from-michael-loyd/",
    source: "The Dink Pickleball",
    skill: "serves",
    type: "technique",
    levels: ["beginner"],
    summary:
      "Legal serve mechanics from the ground up with pro Michael Loyd — stance, contact rules, and building a repeatable motion.",
  },
  {
    id: "serve-05",
    title: "Effective Drills to Improve Your Serve",
    url: "https://www.pickleballdoctors.com/articles/effective-drills-improve-your-serve",
    source: "Pickleball Doctors",
    skill: "serves",
    type: "drill",
    levels: ["beginner", "intermediate"],
    summary:
      "Staggered stance with knee bend (standing straight up kills your power) plus depth-ladder drills for consistent deep serves.",
  },
  {
    id: "serve-06",
    title: "5 Pickleball Serve Techniques That Force Weak Returns",
    url: "https://www.thedinkpickleball.com/5-pickleball-serve-techniques-that-force-weak-returns/",
    source: "The Dink Pickleball",
    skill: "serves",
    type: "strategy",
    levels: ["intermediate", "3.5+"],
    summary:
      "Placement patterns — backhand-side serves, body serves, and depth changes — that turn the serve into a point-starting weapon.",
  },

  // ── Third-shot drops ─────────────────────────────────────────────────────
  {
    id: "tsd-01",
    title: "Third Shot Drop Pickleball: 3rd Shot Guide",
    url: "https://www.thedinkpickleball.com/third-shot-drop-pickleball-3rd-shot-guide/",
    source: "The Dink Pickleball",
    skill: "third-shot-drops",
    type: "technique",
    levels: ["intermediate", "3.5+"],
    summary:
      "Why the third shot drop exists, when to drop vs. drive, and the dink-like motion — firm base, loose grip, push from the shoulder.",
  },
  {
    id: "tsd-02",
    title: "Step-by-Step Drill to Improve Your Third Shot Drop (Catherine Parenteau)",
    url: "https://www.selkirk.com/blogs/pickleball-education/step-by-step-drill-to-improve-your-pickleball-third-shot-drop-tips-from-pro-catherine-parenteau",
    source: "Selkirk Sport",
    skill: "third-shot-drops",
    type: "drill",
    levels: ["intermediate", "3.5+", "4.0+"],
    summary:
      "Pro Catherine Parenteau's progressive-distance drill: start dinking at the kitchen, step back after each success until you're dropping from the baseline.",
  },
  {
    id: "tsd-03",
    title: "How to Practice the Third Shot Drop Alone: Solo Drill Guide",
    url: "https://www.thedinkpickleball.com/how-to-practice-the-third-shot-drop-alone-solo-drill-guide/",
    source: "The Dink Pickleball",
    skill: "third-shot-drops",
    type: "drill",
    levels: ["beginner", "intermediate"],
    summary:
      "No partner needed: self-feed from a basket at the baseline, 50 reps focused purely on arc and landing zone in the kitchen.",
  },
  {
    id: "tsd-04",
    title: "This Third Shot Drop Drill May Be the Only One You Need (The Slinky)",
    url: "https://thekitchenpickle.com/blogs/instruction/third-shot-drop-drill",
    source: "The Kitchen",
    skill: "third-shot-drops",
    type: "drill",
    levels: ["intermediate", "3.5+"],
    summary:
      "The slinky drill — two dinks, two steps back, two drops — trains one motion that scales smoothly from kitchen line to baseline.",
  },
  {
    id: "tsd-05",
    title: "How to Hit an Aggressive Third-Shot Drop",
    url: "https://crbnpickleball.com/blogs/crbn-coaching/how-to-hit-an-aggressive-third-shot-drop-in-pickleball",
    source: "CRBN Pickleball",
    skill: "third-shot-drops",
    type: "strategy",
    levels: ["3.5+", "4.0+"],
    summary:
      "Turning the drop from a neutral reset into an attacking shot — shaping it low over the net with placement that pins opponents.",
  },
  {
    id: "tsd-06",
    title: "Master the Third Drop Shot with Catherine Parenteau",
    url: "https://pickleball.com/learn/master-the-third-drop-shot-with-catherine-parenteau",
    source: "Pickleball.com",
    skill: "third-shot-drops",
    type: "technique",
    levels: ["beginner", "intermediate"],
    summary:
      "Video lesson on contact point, arc height, and using the drop to earn your way from the baseline to the kitchen line.",
  },

  // ── Positioning ──────────────────────────────────────────────────────────
  {
    id: "pos-01",
    title: "Pickleball Basics: Positioning, Patience, and Kitchen Line Strategy",
    url: "https://usapickleball.org/blog/pickleball-basics-positioning-tips/",
    source: "USA Pickleball",
    skill: "positioning",
    type: "strategy",
    levels: ["beginner", "intermediate"],
    summary:
      "The governing body's guide to getting to the kitchen line fast, why the NVZ line is the most powerful spot on the court, and patient shot selection.",
  },
  {
    id: "pos-02",
    title: "Pickleball Court Positioning Guide: Where to Stand Correctly",
    url: "https://www.dupr.com/post/pickleball-court-positioning-guide-learn-where-to-stand-correctly",
    source: "DUPR",
    skill: "positioning",
    type: "technique",
    levels: ["beginner", "intermediate", "3.5+"],
    summary:
      "Covering the centerline (body between ball and court center), staying linked with your partner at 6–8 ft spacing, and moving through no-man's-land fast.",
  },
  {
    id: "pos-03",
    title: "Pickleball Stacking: The Complete Guide to Court Positions",
    url: "https://nighttrainpickleball.com/pickleball-stacking/",
    source: "Night Train Pickleball",
    skill: "positioning",
    type: "strategy",
    levels: ["3.5+", "4.0+"],
    summary:
      "Full stacking playbook — keep forehands in the middle and your best matchups intact regardless of who's serving.",
  },
  {
    id: "pos-04",
    title: "Pickleball Strategy Guide: How to Win More Points, Games, and Matches",
    url: "https://pickleball.com/docs/en/article/pickleball-strategy-guide-how-to-win-more-points-games-and-matches",
    source: "Pickleball.com",
    skill: "positioning",
    type: "strategy",
    levels: ["intermediate", "3.5+"],
    summary:
      "Transition-zone discipline, when to speed up vs. reset, and doubles movement patterns that win rallies without hero shots.",
  },
  {
    id: "pos-05",
    title: "Pickleball Doubles Positioning Explained",
    url: "https://www.onixpickleball.com/blogs/learn-pickleball/pickleball-doubles-positioning-explained",
    source: "Onix Pickleball",
    skill: "positioning",
    type: "technique",
    levels: ["beginner", "intermediate"],
    summary:
      "Side-by-side vs. up-and-back, who takes the middle ball, and how to shift as a unit when the ball moves.",
  },
  {
    id: "pos-06",
    title: "Pickleball Kitchen Rules: Clear Guide, Examples, and Pro Tips",
    url: "https://www.utrsports.net/blogs/news/pickleball-kitchen-rules-clear-guide-examples-and-pro-tips",
    source: "UTR Sports",
    skill: "positioning",
    type: "technique",
    levels: ["beginner"],
    summary:
      "Exactly what you can and can't do at the non-volley zone — momentum faults, re-establishing, and legal kitchen play.",
  },

  // ── Footwork ─────────────────────────────────────────────────────────────
  {
    id: "foot-01",
    title: "How to Improve Pickleball Footwork: 5 Pro Drills",
    url: "https://www.thedinkpickleball.com/how-to-improve-pickleball-footwork-5-pro-drills/",
    source: "The Dink Pickleball",
    skill: "footwork",
    type: "drill",
    levels: ["intermediate", "3.5+", "4.0+"],
    summary:
      "Figure-8 shuffle, transition sprint-and-stop, lunge-and-recover, and shadowing — each mapped to a real in-game movement pattern.",
  },
  {
    id: "foot-02",
    title: "5 Pickleball Footwork Drills to Boost Your Agility",
    url: "https://www.pb5star.com/a/blog/5-pickleball-footwork-drills-to-boost-your-agility",
    source: "PB5star",
    skill: "footwork",
    type: "drill",
    levels: ["beginner", "intermediate"],
    summary:
      "Lateral shuffles, cone drills, and agility-ladder patterns — 15–20 minutes a few times a week measurably improves court coverage.",
  },
  {
    id: "foot-03",
    title: "Footwork in Pickleball: Techniques for Agility & Balance",
    url: "https://www.pickletip.com/footwork-in-pickleball/",
    source: "PickleTip",
    skill: "footwork",
    type: "technique",
    levels: ["beginner", "intermediate", "3.5+"],
    summary:
      "The split step — a small hop timed to your opponent's contact — plus shuffle vs. crossover steps and hitting in front of your body.",
  },
  {
    id: "foot-04",
    title: "Pickleball Agility Training: Drills to Get Faster on Court",
    url: "https://www.paddletek.com/blogs/news/pickleball-agility-training",
    source: "Paddletek",
    skill: "footwork",
    type: "drill",
    levels: ["3.5+", "4.0+"],
    summary:
      "Reaction-training and change-of-direction work for players who already move well and want tournament-level first-step speed.",
  },
  {
    id: "foot-05",
    title: "How to Improve Footwork Off Court for Pickleball",
    url: "https://www.thedinkpickleball.com/how-to-improve-footwork-off-court-for-pickleball/",
    source: "The Dink Pickleball",
    skill: "footwork",
    type: "drill",
    levels: ["beginner", "intermediate"],
    summary:
      "No court needed — three 15-minute at-home sessions per week produce measurable agility gains in 4–6 weeks.",
  },
  {
    id: "foot-06",
    title: "Pickleball Footwork Fundamentals: How to Improve Your Game",
    url: "https://volair.com/blogs/news/pickleball-footwork-fundamentals",
    source: "Volair Pickleball",
    skill: "footwork",
    type: "technique",
    levels: ["intermediate"],
    summary:
      "Balance, base width, and recovering to neutral between shots — the movement habits that keep you stable through fast exchanges.",
  },
];
