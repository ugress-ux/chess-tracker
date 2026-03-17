// ─────────────────────────────────────────────
// Chess.com URL / Slug Parsing Utilities
// ─────────────────────────────────────────────

const CHESSCOM_TOURNAMENT_URL_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?chess\.com\/tournament\/(?:live\/|daily\/)?([a-zA-Z0-9_-]+)/i;

/**
 * Parse a Chess.com tournament URL or bare slug into just the slug.
 * Returns null if the input can't be parsed into a valid slug.
 *
 * Accepts:
 *   - https://www.chess.com/tournament/live/my-tournament-123
 *   - chess.com/tournament/my-tournament-123
 *   - my-tournament-123   (bare slug)
 */
export function parseTournamentSlug(input: string): string | null {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try URL pattern first
  const match = trimmed.match(CHESSCOM_TOURNAMENT_URL_PATTERN);
  if (match?.[1]) return sanitizeSlug(match[1]);

  // Bare slug: alphanumeric, hyphens, underscores only
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return sanitizeSlug(trimmed);
  }

  return null;
}

/**
 * Sanitize a slug to prevent injection or malformed requests.
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 200);
}

/**
 * Validate a round number parameter from URL/query.
 */
export function parseRoundNumber(value: string | undefined | null): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 1000) return null;
  return num;
}

/**
 * Validate a group number parameter from URL/query.
 */
export function parseGroupNumber(value: string | undefined | null): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 10000) return null;
  return num;
}

// ─────────────────────────────────────────────
// Endpoint builders
// ─────────────────────────────────────────────

const CHESS_COM_PUBAPI_BASE = "https://api.chess.com/pub";

export function buildTournamentEndpoint(slug: string): string {
  return `${CHESS_COM_PUBAPI_BASE}/tournament/${encodeURIComponent(slug)}`;
}

export function buildRoundEndpoint(slug: string, round: number): string {
  return `${CHESS_COM_PUBAPI_BASE}/tournament/${encodeURIComponent(slug)}/${round}`;
}

export function buildGroupEndpoint(
  slug: string,
  round: number,
  group: number
): string {
  return `${CHESS_COM_PUBAPI_BASE}/tournament/${encodeURIComponent(slug)}/${round}/${group}`;
}

/**
 * Extract the slug from a Chess.com API endpoint URL returned in tournament.rounds[].
 * e.g. "https://api.chess.com/pub/tournament/my-slug/1" → { slug: "my-slug", round: 1 }
 */
export function parseRoundUrl(
  url: string
): { slug: string; round: number } | null {
  const match = url.match(
    /\/pub\/tournament\/([a-zA-Z0-9_-]+)\/(\d+)(?:\/\d+)?$/
  );
  if (!match) return null;
  const round = parseInt(match[2], 10);
  if (isNaN(round)) return null;
  return { slug: match[1], round };
}

/**
 * Extract slug, round, group from a Chess.com group API URL.
 */
export function parseGroupUrl(
  url: string
): { slug: string; round: number; group: number } | null {
  const match = url.match(
    /\/pub\/tournament\/([a-zA-Z0-9_-]+)\/(\d+)\/(\d+)$/
  );
  if (!match) return null;
  const round = parseInt(match[2], 10);
  const group = parseInt(match[3], 10);
  if (isNaN(round) || isNaN(group)) return null;
  return { slug: match[1], round, group };
}

/**
 * Extract a username from a Chess.com player profile API URL.
 * e.g. "https://api.chess.com/pub/player/magnuscarlsen" → "magnuscarlsen"
 */
export function parsePlayerUrl(url: string): string | null {
  const match = url.match(/\/pub\/player\/([a-zA-Z0-9_-]+)$/i);
  return match?.[1] ?? null;
}

/**
 * Build a public Chess.com player profile URL from username.
 */
export function buildPlayerProfileUrl(username: string): string {
  return `https://www.chess.com/member/${encodeURIComponent(username)}`;
}

/**
 * Build the public Chess.com tournament URL from slug.
 */
export function buildPublicTournamentUrl(slug: string): string {
  return `https://www.chess.com/tournament/${encodeURIComponent(slug)}`;
}
