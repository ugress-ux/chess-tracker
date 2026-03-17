import type { ApiError, RawTournament, RawTournamentRound, RawTournamentGroup } from "@/types";
import {
  RawTournamentSchema,
  RawTournamentRoundSchema,
  RawTournamentGroupSchema,
} from "./schemas";
import { buildTournamentEndpoint, buildRoundEndpoint, buildGroupEndpoint } from "./parsers";

// ─────────────────────────────────────────────
// Client config
// ─────────────────────────────────────────────

const USER_AGENT =
  "ChessTournamentTracker/1.0 (public-api-tracker; contact: your@email.com)";

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;

// ─────────────────────────────────────────────
// Result type (no throw pattern)
// ─────────────────────────────────────────────

export type FetchResult<T> =
  | { ok: true; data: T; statusCode: number }
  | { ok: false; error: ApiError };

// ─────────────────────────────────────────────
// Core fetch with retry + backoff
// ─────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  attempt = 0
): Promise<{ body: unknown; statusCode: number } | { error: ApiError }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
      // Server-side only: no-store so we always get fresh data from Chess.com
      // (our own cache layer handles de-duplication)
      cache: "no-store",
    });

    clearTimeout(timeout);

    // Rate limited
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "60", 10);
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(retryAfter * 1000, backoffMs(attempt, 2000));
        await sleep(delay);
        return fetchWithRetry(url, attempt + 1);
      }
      return {
        error: {
          type: "rate_limited",
          message: "Chess.com API rate limit reached. Please wait before retrying.",
          statusCode: 429,
          retryAfter,
        },
      };
    }

    // Not found
    if (response.status === 404) {
      return {
        error: {
          type: "not_found",
          message: "Tournament or resource not found on Chess.com.",
          statusCode: 404,
        },
      };
    }

    // Server errors: retry with backoff
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      await sleep(backoffMs(attempt, 1000));
      return fetchWithRetry(url, attempt + 1);
    }

    if (!response.ok) {
      return {
        error: {
          type: "unknown",
          message: `Chess.com API returned ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        },
      };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return {
        error: {
          type: "parse",
          message: "Could not parse Chess.com API response as JSON.",
          statusCode: response.status,
        },
      };
    }

    return { body, statusCode: response.status };
  } catch (err: unknown) {
    clearTimeout(timeout);

    const isAbort =
      err instanceof Error && err.name === "AbortError";

    if (!isAbort && attempt < MAX_RETRIES) {
      await sleep(backoffMs(attempt, 1000));
      return fetchWithRetry(url, attempt + 1);
    }

    return {
      error: {
        type: "network",
        message: isAbort
          ? "Request to Chess.com timed out."
          : `Network error: ${err instanceof Error ? err.message : "unknown"}`,
        statusCode: null,
      },
    };
  }
}

// ─────────────────────────────────────────────
// Typed fetch helpers
// ─────────────────────────────────────────────

export async function fetchTournament(
  slug: string
): Promise<FetchResult<RawTournament>> {
  const url = buildTournamentEndpoint(slug);
  const result = await fetchWithRetry(url);

  if ("error" in result) return { ok: false, error: result.error };

  const parsed = RawTournamentSchema.safeParse(result.body);
  if (!parsed.success) {
    console.warn("[chesscom/client] Tournament schema mismatch:", parsed.error.flatten());
    // Return best-effort data even if schema doesn't fully match
    return { ok: true, data: result.body as RawTournament, statusCode: result.statusCode };
  }
  return { ok: true, data: parsed.data as RawTournament, statusCode: result.statusCode };
}

export async function fetchTournamentRound(
  slug: string,
  round: number
): Promise<FetchResult<RawTournamentRound>> {
  const url = buildRoundEndpoint(slug, round);
  const result = await fetchWithRetry(url);

  if ("error" in result) return { ok: false, error: result.error };

  const parsed = RawTournamentRoundSchema.safeParse(result.body);
  if (!parsed.success) {
    console.warn("[chesscom/client] Round schema mismatch:", parsed.error.flatten());
    return { ok: true, data: result.body as RawTournamentRound, statusCode: result.statusCode };
  }
  return { ok: true, data: parsed.data as RawTournamentRound, statusCode: result.statusCode };
}

export async function fetchTournamentGroup(
  slug: string,
  round: number,
  group: number
): Promise<FetchResult<RawTournamentGroup>> {
  const url = buildGroupEndpoint(slug, round, group);
  const result = await fetchWithRetry(url);

  if ("error" in result) return { ok: false, error: result.error };

  const parsed = RawTournamentGroupSchema.safeParse(result.body);
  if (!parsed.success) {
    console.warn("[chesscom/client] Group schema mismatch:", parsed.error.flatten());
    return { ok: true, data: result.body as RawTournamentGroup, statusCode: result.statusCode };
  }
  return { ok: true, data: parsed.data as RawTournamentGroup, statusCode: result.statusCode };
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function backoffMs(attempt: number, baseMs: number): number {
  return Math.min(baseMs * Math.pow(2, attempt) + jitter(), 30_000);
}

function jitter(): number {
  return Math.floor(Math.random() * 500);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
