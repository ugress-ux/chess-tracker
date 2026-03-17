import type {
  RawTournament,
  RawTournamentPlayer,
  RawTournamentRound,
  RawTournamentGroup,
  RawTournamentGame,
  RawGroupPlayer,
  Tournament,
  TournamentPlayer,
  TournamentRound,
  TournamentGroup,
  TournamentGame,
  GroupPlayer,
  GamePlayer,
  GameResult,
  TournamentStatus,
  StandingRow,
} from "@/types";
import { safeNumber, safeString, parseUnixTimestamp } from "@/lib/utils";

// ─────────────────────────────────────────────
// Tournament mapper
// ─────────────────────────────────────────────

export function mapTournament(raw: RawTournament, slug: string): Tournament {
  const settings = raw.settings ?? {};
  return {
    slug,
    name: safeString(raw.name) ?? slug,
    url: safeString(raw.url) ?? "",
    description: safeString(raw.description) ?? "",
    creator: safeString(raw.creator) ?? "",
    status: mapTournamentStatus(raw.status),
    finishReason: safeString(raw.finish_reason) ?? null,
    startTime: parseUnixTimestamp(raw.start_time),
    type: safeString(settings.type) ?? safeString(settings.rules) ?? "unknown",
    rules: safeString(settings.rules) ?? "chess",
    timeClass: safeString(settings.time_class) ?? "unknown",
    timeControl: safeString(settings.time_control) ?? "unknown",
    isRated: settings.is_rated ?? false,
    totalRounds: safeNumber(settings.total_rounds),
    registeredPlayerCount: safeNumber(settings.registered_user_count),
    roundUrls: raw.rounds ?? [],
    players: (raw.players ?? []).map(mapTournamentPlayer),
    rawData: raw,
  };
}

function mapTournamentStatus(status: string | null | undefined): TournamentStatus {
  switch (status?.toLowerCase()) {
    case "registration":
      return "registration";
    case "in_progress":
      return "in_progress";
    case "finished":
      return "finished";
    default:
      return "unknown";
  }
}

// ─────────────────────────────────────────────
// Player mappers
// ─────────────────────────────────────────────

export function mapTournamentPlayer(raw: RawTournamentPlayer): TournamentPlayer {
  return {
    username: safeString(raw.username) ?? "unknown",
    status: safeString(raw.status) ?? "unknown",
    wins: safeNumber(raw.wins) ?? 0,
    losses: safeNumber(raw.losses) ?? 0,
    draws: safeNumber(raw.draws) ?? 0,
    points: safeNumber(raw.points) ?? 0,
    tieBreak: safeNumber(raw.tie_break) ?? 0,
    isAdvancing: raw.is_advancing ?? false,
    isRemoved: raw.timeout_removed ?? false,
  };
}

export function mapGroupPlayer(raw: RawGroupPlayer): GroupPlayer {
  return {
    username: safeString(raw.username) ?? "unknown",
    points: safeNumber(raw.points) ?? 0,
    tieBreak: safeNumber(raw.tie_break) ?? 0,
    isAdvancing: raw.is_advancing ?? false,
    isRemoved: raw.timeout_removed ?? false,
  };
}

// ─────────────────────────────────────────────
// Round mapper
// ─────────────────────────────────────────────

export function mapTournamentRound(
  raw: RawTournamentRound,
  roundNumber: number
): TournamentRound {
  return {
    roundNumber,
    groupUrls: raw.groups ?? [],
    players: (raw.players ?? []).map(mapTournamentPlayer),
    rawData: raw,
  };
}

// ─────────────────────────────────────────────
// Group mapper
// ─────────────────────────────────────────────

export function mapTournamentGroup(
  raw: RawTournamentGroup,
  roundNumber: number,
  groupNumber: number
): TournamentGroup {
  return {
    roundNumber,
    groupNumber,
    players: (raw.players ?? []).map(mapGroupPlayer),
    games: (raw.games ?? []).map(mapTournamentGame),
    fairPlayRemovals: raw.fair_play_removals ?? [],
    rawData: raw,
  };
}

// ─────────────────────────────────────────────
// Game mapper
// ─────────────────────────────────────────────

export function mapTournamentGame(raw: RawTournamentGame): TournamentGame {
  return {
    url: safeString(raw.url) ?? null,
    timeControl: safeString(raw.time_control) ?? "unknown",
    timeClass: safeString(raw.time_class) ?? "unknown",
    startTime: parseUnixTimestamp(raw.start_time),
    endTime: parseUnixTimestamp(raw.end_time),
    rated: raw.rated ?? false,
    rules: safeString(raw.rules) ?? "chess",
    white: mapGamePlayer(raw.white),
    black: mapGamePlayer(raw.black),
    result: deriveGameResult(raw.white?.result, raw.black?.result),
  };
}

function mapGamePlayer(raw: RawTournamentGame["white"] | undefined): GamePlayer {
  return {
    username: safeString(raw?.username) ?? "unknown",
    rating: safeNumber(raw?.rating),
    result: safeString(raw?.result) ?? "unknown",
    profileUrl: raw?.["@id"]
      ? `https://www.chess.com/member/${raw.username}`
      : null,
  };
}

function deriveGameResult(
  whiteResult?: string | null,
  blackResult?: string | null
): GameResult {
  if (!whiteResult && !blackResult) return "unknown";
  if (whiteResult === "win") return "white";
  if (blackResult === "win") return "black";
  const drawResults = ["agreed", "stalemate", "repetition", "insufficient", "50move", "timevsinsufficient"];
  if (whiteResult && drawResults.includes(whiteResult)) return "draw";
  if (whiteResult === "unknown" || blackResult === "unknown") return "in_progress";
  return "unknown";
}

// ─────────────────────────────────────────────
// Standings builder
// ─────────────────────────────────────────────

/**
 * Build a ranked standings table from group players.
 * Sorts by points desc, then tieBreak desc, then username asc.
 */
export function buildStandings(players: GroupPlayer[]): StandingRow[] {
  const sorted = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.tieBreak !== a.tieBreak) return b.tieBreak - a.tieBreak;
    return a.username.localeCompare(b.username);
  });

  return sorted.map((p, i) => ({
    rank: i + 1,
    username: p.username,
    points: p.points,
    tieBreak: p.tieBreak,
    wins: 0, // Not available at group level without game aggregation
    losses: 0,
    draws: 0,
    isAdvancing: p.isAdvancing,
    isRemoved: p.isRemoved,
    status: p.isRemoved ? "removed" : p.isAdvancing ? "advancing" : "active",
  }));
}

/**
 * Build standings from tournament-level players (which include W/L/D).
 */
export function buildTournamentStandings(players: TournamentPlayer[]): StandingRow[] {
  const sorted = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.tieBreak !== a.tieBreak) return b.tieBreak - a.tieBreak;
    return a.username.localeCompare(b.username);
  });

  return sorted.map((p, i) => ({
    rank: i + 1,
    username: p.username,
    points: p.points,
    tieBreak: p.tieBreak,
    wins: p.wins,
    losses: p.losses,
    draws: p.draws,
    isAdvancing: p.isAdvancing,
    isRemoved: p.isRemoved,
    status: p.isRemoved ? "removed" : p.isAdvancing ? "advancing" : p.status,
  }));
}
