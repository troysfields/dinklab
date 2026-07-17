# DinkLab 🎾

**Train what the tape shows.** Upload your pickleball gameplay or drill footage, tag it by skill focus and level, and DinkLab pairs every clip with current training content — drills, technique breakdowns, and strategy — so you always know what to work on next.

## Stack

Next.js 15 (App Router, TypeScript) + Tailwind CSS v4, deployed on Vercel with **Vercel Blob** for video storage — one framework covers the UI, the upload token exchange, and the feed API as serverless routes, with zero extra infrastructure.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Uploads need a Blob token. Either:

- **On Vercel**: connect a Blob store to the project (Storage → Create → Blob) — `BLOB_READ_WRITE_TOKEN` is injected automatically; or
- **Locally**: `vercel env pull .env.local` after the store is connected.

Without the token the app still runs — library/progress show a friendly "storage not connected" state and the Train tab works fully.

Optional live search for the training feed (otherwise a curated, cited corpus is used):

```bash
TAVILY_API_KEY=...    # live web search
YOUTUBE_API_KEY=...   # live video search
```

## Architecture

```
dinklab/
├── app/
│   ├── layout.tsx              # shell: nav, fonts, theme
│   ├── globals.css             # design tokens (Tailwind v4 @theme)
│   ├── page.tsx                # Library — upload + video grid
│   ├── train/page.tsx          # Training feed with skill/level filters
│   ├── progress/page.tsx       # Dashboard — uploads over time, skill focus
│   ├── video/[id]/page.tsx     # Player, tag editor, matched feed
│   └── api/
│       ├── upload/route.ts     # Blob client-upload token exchange (type/size enforced)
│       ├── videos/route.ts     # GET library
│       ├── videos/[id]/route.ts# GET / PATCH tags / DELETE
│       └── feed/route.ts       # GET matched training content
├── components/
│   ├── UploadDropzone.tsx      # drag-drop, progress, per-file error states
│   ├── VideoCard.tsx           # library card w/ thumbnail + tags
│   ├── SkillChips.tsx          # skill/level pickers + badges
│   ├── FeedList.tsx            # feed grid w/ loading/empty/error states
│   └── Nav.tsx
└── lib/
    ├── types.ts                # Skill/Level/VideoMeta/FeedItem — single source of truth
    ├── videos.ts               # Blob-backed persistence (list/get/delete)
    ├── feed/
    │   ├── index.ts            # FeedProvider interface + Tavily/YouTube/Seeded providers
    │   └── seed-data.ts        # curated, cited corpus (researched July 2026)
    └── client/
        ├── thumbnail.ts        # canvas frame-grab + duration, fully in-browser
        └── format.ts
```

### Key decisions

- **Client uploads to Blob.** The browser uploads directly to Vercel Blob after a token exchange at `/api/upload` — big videos never pass through a serverless function (4.5 MB body limit), and we get real progress events. Type and size limits are enforced server-side at token time; never trust the client.
- **No database.** Each upload writes `videos/<id>`, `thumbs/<id>.jpg`, and `meta/<id>.json`; the library is rebuilt by listing `meta/`. Right-sized for a single-user product, and the persistence layer (`lib/videos.ts`) is the one file to swap for Postgres when auth/multi-user arrives.
- **Thumbnails in the browser.** A `<video>` + canvas frame-grab at ~10% into the clip — no ffmpeg, no server compute, works for mp4/mov/webm. Best-effort: a failed thumbnail never fails the upload.
- **Feed is provider-based.** `FeedProvider` interface with Tavily (live web search) → YouTube (live video search) → Seeded (curated + cited) fallback chain. The feed always renders; a live key is a config change, not a code change. Every item cites and links its original publisher.
- **Edges handled everywhere.** Storage-unconfigured, empty library, per-file upload errors (bad format, >500 MB, network), feed provider failure, 404 video, debounced tag saves with visible save state.

## Assumptions

- Single user, no auth — the Blob store is scoped to one player. (Auth is the first thing multi-user needs; see roadmap.)
- Public blob URLs are acceptable for now (unguessable random-suffix URLs on video/thumb; only `meta/` uses fixed paths).
- "Fresh" training content = curated corpus researched at build time, upgraded to live search by adding one env key.
- 500 MB per-clip cap covers phone-recorded rally clips; raise the constant in `app/api/upload/route.ts` if needed.

## What I'd build next for real users

1. **Auth + per-user data** (Clerk or NextAuth; move meta to Postgres/Drizzle, keep Blob for bytes).
2. **AI clip analysis** — frame sampling → pose/shot detection to auto-suggest skill tags and pull matching feed content with zero manual tagging.
3. **Feed quality loop** — thumbs up/down on feed items to personalize ranking; cache live-search results.
4. **Clip trimming + moments** — mark timestamps ("bad third shot at 2:14") that link directly to matching drills.
5. **Private blobs** with signed playback URLs once auth exists.
