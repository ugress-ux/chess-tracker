# Chess Tournament Tracker

A modern, production-ready web application for tracking Chess.com tournaments using the public API. View standings, rounds, groups, pairings, and player data for any Chess.com tournament in near-real-time.

> **⚠️ Important:** This is a *public API tracker*, not a live broadcast system. Chess.com's public endpoints have caching delays and do not support WebSocket/move streaming. Data freshness is clearly indicated throughout the UI.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Setup & Development](#setup--development)
5. [Deployment (Vercel)](#deployment-vercel)
6. [API Routes](#api-routes)
7. [Data Flow](#data-flow)
8. [Configuration](#configuration)
9. [Phase 2 Roadmap](#phase-2-roadmap)
10. [Assumptions & API Limitations](#assumptions--api-limitations)
11. [Known Limitations](#known-limitations)

---

## Features

- 🏆 **Tournament overview** — name, status, time control, player count, creator
- 🔄 **Rounds navigation** — browse all rounds with one click
- 👥 **Groups grid** — see all groups in a round
- 📊 **Standings table** — ranked leaderboard with points, tiebreak, W/L/D
- ♟️ **Pairings/games** — game results with links to Chess.com game pages
- 👤 **Player cards** — profile links for every participant
- 🕐 **Freshness indicators** — last fetched time, source URL, delay warning
- 🔄 **Manual & auto refresh** — configurable auto-refresh on group pages
- 🐛 **Raw JSON inspector** — debug panel for every fetched resource
- 🛡️ **Graceful error states** — 404, rate limit, network, parse errors all handled
- 🌙 **Dark mode first** — chess-inspired dark aesthetic throughout

---

## Architecture

```
Browser (React + React Query)
       │
       ▼
Next.js App Router (pages + layouts)
       │
       ▼
Next.js API Route Handlers  ◄── In-memory cache (TTL: 30–60s)
       │                         (replaceable with Redis in Phase 2)
       ▼
Chess.com Public API
  /pub/tournament/{slug}
  /pub/tournament/{slug}/{round}
  /pub/tournament/{slug}/{round}/{group}
```

**Key architectural decisions:**

- **Proxy pattern**: The browser never calls Chess.com directly. All requests go through `/api/chesscom/...` route handlers, which sanitize input, normalize errors, and apply caching.
- **Feature-based folders**: Components, hooks, and utilities are co-located by feature (`tournament/`, `standings/`, `players/`).
- **No-throw error pattern**: API client returns `FetchResult<T>` (ok | error), not exceptions.
- **Zod schema validation**: All Chess.com responses are validated at runtime; mismatches are logged but don't crash the app (best-effort mapping).
- **Conservative refresh**: Auto-refresh defaults are 60–90s. No aggressive polling.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout, fonts, providers
│   ├── globals.css                         # Tailwind + custom CSS
│   ├── page.tsx                            # Homepage with URL input
│   ├── not-found.tsx                       # 404 page
│   ├── error.tsx                           # Global error boundary
│   ├── tournament/
│   │   └── [slug]/
│   │       ├── page.tsx                    # Tournament overview + tabs
│   │       ├── loading.tsx                 # Skeleton loading state
│   │       └── round/
│   │           └── [round]/
│   │               ├── page.tsx            # Round detail + groups
│   │               └── group/
│   │                   └── [group]/
│   │                       └── page.tsx    # Group detail: standings/pairings
│   └── api/
│       └── chesscom/
│           └── tournament/
│               └── [slug]/
│                   ├── route.ts            # GET /api/chesscom/tournament/:slug
│                   └── [round]/
│                       ├── route.ts        # GET /api/chesscom/tournament/:slug/:round
│                       └── [group]/
│                           └── route.ts    # GET /api/chesscom/tournament/:slug/:round/:group
├── components/
│   ├── tournament/
│   │   ├── hooks.ts                        # React Query hooks
│   │   ├── TournamentHeader.tsx            # Hero section with metadata
│   │   ├── RoundsList.tsx                  # Clickable round cards
│   │   ├── GroupsGrid.tsx                  # Clickable group cards
│   │   └── PairingsTable.tsx               # Games/results table
│   ├── standings/
│   │   └── StandingsTable.tsx              # Ranked leaderboard
│   ├── players/
│   │   └── PlayersList.tsx                 # Searchable player table
│   └── ui/
│       ├── Providers.tsx                   # React Query provider
│       ├── Skeleton.tsx                    # Loading skeleton components
│       ├── StatusBadge.tsx                 # Status/delay badges
│       ├── FreshnessBar.tsx                # Last-fetched indicator + refresh
│       ├── ErrorState.tsx                  # Error/empty states + disclaimer
│       └── RawJsonPanel.tsx                # Collapsible JSON debug inspector
├── lib/
│   ├── chesscom/
│   │   ├── client.ts                       # Fetch + retry + backoff
│   │   ├── schemas.ts                      # Zod runtime validation schemas
│   │   ├── mappers.ts                      # Raw → normalized model mappers
│   │   └── parsers.ts                      # Slug parsing, URL builders
│   ├── cache.ts                            # In-memory TTL cache (Redis-ready)
│   └── utils/
│       └── index.ts                        # cn(), dates, formatters
└── types/
    └── index.ts                            # All TypeScript interfaces
```

---

## Setup & Development

### Prerequisites

- Node.js 18.17+ (required by Next.js 14)
- npm 9+ or pnpm 8+

### Install

```bash
git clone https://github.com/your-org/chess-tournament-tracker.git
cd chess-tournament-tracker
npm install
```

### Environment Variables

No API keys are required for the public Chess.com API. Create a `.env.local` for future use:

```env
# No secrets required for public mode.
# Add these when you implement Phase 2 features:
# REDIS_URL=redis://localhost:6379
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Development

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Type Check

```bash
npm run typecheck
```

### Build

```bash
npm run build
npm run start
```

---

## Deployment (Vercel)

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/chess-tournament-tracker)

### Manual deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link and deploy:
   ```bash
   vercel link
   vercel --prod
   ```

3. No environment variables are required for the public-API MVP.

### Vercel configuration notes

- **Runtime**: Node.js 18.x (default)
- **Framework**: Next.js (auto-detected)
- **Build command**: `npm run build`
- **Output**: `.next/`
- **API routes** run as Vercel Serverless Functions
- **Cache**: The in-memory cache resets between cold starts. For persistent caching across serverless instances, implement Redis in Phase 2.

> ⚠️ **Important for serverless**: The in-memory cache (`src/lib/cache.ts`) is per-instance and will not be shared across Vercel's serverless function instances. Each instance maintains its own cache. This is acceptable for MVP — add Redis to get shared caching in production.

---

## API Routes

All routes are under `/api/chesscom/tournament/`.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/chesscom/tournament/:slug` | Tournament overview, players, round URLs |
| `GET` | `/api/chesscom/tournament/:slug/:round` | Round data: group URLs, player list |
| `GET` | `/api/chesscom/tournament/:slug/:round/:group` | Group detail: players, games, standings |

**Response shape (all routes):**

```ts
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  fetchedAt: string;    // ISO timestamp
  sourceUrl: string;    // Chess.com API URL used
  cached: boolean;      // Was this served from cache?
}
```

**Error types:**

| Type | Status | Description |
|------|--------|-------------|
| `invalid_input` | 400 | Bad slug/round/group param |
| `not_found` | 404 | Tournament doesn't exist |
| `rate_limited` | 429 | Chess.com rate limit hit |
| `network` | 500 | Fetch timeout or DNS failure |
| `parse` | 500 | JSON parsing failed |
| `unknown` | 500 | Unexpected error |

---

## Data Flow

```
1. User pastes URL: https://www.chess.com/tournament/my-tournament
2. parseTournamentSlug() extracts slug: "my-tournament"
3. router.push("/tournament/my-tournament")
4. TournamentPage mounts, calls useTournament("my-tournament")
5. React Query fetches /api/chesscom/tournament/my-tournament
6. Route handler:
   a. parseTournamentSlug() validates slug
   b. Checks in-memory cache (TTL: 60s)
   c. If miss: fetchTournament() → Chess.com API
   d. Zod schema validates response
   e. mapTournament() normalizes to internal model
   f. Stores in cache, returns ApiResponse<Tournament>
7. Client renders TournamentHeader, tabs
8. User clicks "Round 3" → /tournament/my-tournament/round/3
9. Similar flow with fetchTournamentRound(), mapTournamentRound()
10. User clicks "Group 2" → /tournament/my-tournament/round/3/group/2
11. Similar flow with fetchTournamentGroup(), mapTournamentGroup()
```

---

## Configuration

### Cache TTLs (`src/lib/cache.ts`)

```ts
export const CACHE_TTL = {
  TOURNAMENT: 60,   // seconds — overview data
  ROUND: 45,        // seconds — round/group list
  GROUP: 30,        // seconds — game results
};
```

Increase these to reduce Chess.com API calls. Decrease to get fresher data (at risk of 429 rate limits).

### Auto-refresh interval (`src/components/tournament/hooks.ts`)

```ts
refetchInterval: options?.autoRefresh ? 60_000 : false,  // ms
```

Group pages support a toggle for 60-second auto-refresh. Rounds use 90-second intervals.

### Retry logic (`src/lib/chesscom/client.ts`)

- Max retries: 3
- Backoff: exponential with jitter (`base * 2^attempt + rand(0-500ms)`)
- Max backoff: 30 seconds
- Rate limit: respects `Retry-After` header if present

---

## Phase 2 Roadmap

### 1. Redis caching
Replace `src/lib/cache.ts` in-memory store with a Redis adapter (Upstash is Vercel-native):
```ts
// Drop-in replacement for the cache interface
import { Redis } from "@upstash/redis";
```

### 2. User authentication & favorites
- Add NextAuth.js or Clerk for auth
- Store favorited tournaments per user in a database (PlanetScale / Neon PostgreSQL)
- "My Tournaments" dashboard page

### 3. Saved tournament history
- Persist fetched tournament snapshots to database
- Compare standings across time
- Historical charts of score progression

### 4. Background refresh jobs
- Use Vercel Cron Jobs or a queue (BullMQ/Inngest)
- Periodically refresh active tournament data
- Push invalidations to connected clients via Server-Sent Events

### 5. Status change alerting
- Email / push notifications when tournament status changes
- Alert when a player advances or is eliminated
- Webhook support for third-party integrations

### 6. Multi-tournament dashboard
- Side-by-side view of multiple active tournaments
- Grid layout with mini-standings per tournament
- "Following" list

### 7. TV / Broadcast mode
- Full-screen, auto-cycling group standings
- Large-format display optimized layout
- URL-based config: `/broadcast/my-tournament/round/3`

### 8. Private API integration (if Chess.com approves)
- Partner/OAuth integration for authenticated data access
- Potentially lower latency or WebSocket support
- Requires direct Chess.com partnership agreement

---

## Assumptions & API Limitations

### Endpoint assumptions

| Assumption | Basis | Risk |
|------------|-------|------|
| `/pub/tournament/{slug}` returns `rounds[]` as URL array | Documented pattern | Low — but array may be empty for unstarted tournaments |
| Round URLs follow pattern `…/{slug}/{n}` | Inferred from docs | Medium — could vary by tournament type |
| Group URLs follow pattern `…/{slug}/{n}/{m}` | Inferred from docs | Medium — same |
| `players[]` in tournament endpoint contains W/L/D/points | Documented | Low |
| `games[]` in group endpoint contains player usernames | Documented | Low |
| Game `result` field values (win/agreed/stalemate/etc.) | Chess.com game API docs | Low |
| `start_time` and `end_time` are Unix timestamps (seconds) | Standard Chess.com convention | Low |
| `tie_break` is a decimal number | Inferred | Medium — format may vary |

### What is NOT available

- **Real-time move streaming**: No documented public WebSocket or SSE endpoint exists for tournament games. The public API is HTTP polling only.
- **Move-by-move data**: Individual moves are in PGN format within completed game objects, not streamed.
- **Live board positions**: Cannot show a live board without unsupported endpoints.
- **Private/invite-only tournaments**: Public API only serves public tournament data.
- **Exact game start times within rounds**: Not guaranteed to be available in all tournament types.

### Rate limiting

Chess.com's public API enforces rate limits. The exact limits are not publicly documented. This app:
- Uses in-memory caching to avoid duplicate requests
- Implements exponential backoff on 429 responses
- Does NOT make parallel requests for all rounds/groups at once
- Defaults to conservative refresh intervals (30–90 seconds)

### Schema variability

Chess.com's API response shapes can vary between tournament types (daily, live, arena). All fields are treated as optional in Zod schemas, and mappers use safe fallbacks (`safeString`, `safeNumber`). If a field is missing, the UI shows "—" rather than crashing.

---

## Known Limitations

1. **Not real-time**: This is a public API tracker. The Chess.com public API has inherent caching delays (typically 30 seconds to several minutes). This app cannot guarantee data freshness.

2. **No live move broadcast**: Individual moves during a game are not available through public endpoints. Only completed game results are shown.

3. **Serverless cache**: The in-memory cache is per-serverless-instance. On Vercel, different requests may hit different instances with cold caches, meaning more Chess.com API calls than expected. Use Redis (Phase 2) for a shared cache.

4. **Tournament type coverage**: Behavior may differ between daily, live, and arena tournaments. The app is designed to degrade gracefully, but some fields may be absent for certain types.

5. **No PGN viewer**: Game links open on Chess.com. An embedded PGN board viewer is a Phase 2 feature.

6. **No mobile app**: This is a web app. A React Native or PWA version is a Phase 2 consideration.

7. **Rate limit visibility**: If Chess.com changes rate limit behavior, the app will surface the error to users with a human-readable message and retry guidance.

---

## License

MIT — see [LICENSE](./LICENSE)

---

*Not affiliated with or endorsed by Chess.com.*
