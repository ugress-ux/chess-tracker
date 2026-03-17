// ─────────────────────────────────────────────
// Chess.com Public API Raw Response Types
// Shapes are inferred from documented endpoints.
// Fields marked optional because real payloads vary.
// ─────────────────────────────────────────────

export interface RawTournament {
  name?: string;
  url?: string;
  description?: string;
  creator?: string;
  status?: string;
  finish_reason?: string;
  start_time?: number;
  settings?: {
    type?: string;
    rules?: string;
    time_class?: string;
    time_control?: string;
    is_rated?: boolean;
    is_official?: boolean;
    is_invite_only?: boolean;
    initial_group_size?: number;
    user_advance_count?: number;
    use_tiebreak?: boolean;
    allow_vacation?: boolean;
    winner_places?: number;
    registered_user_count?: number;
    games_per_opponent?: number;
    total_rounds?: number;
    concurrent_games_per_opponent?: number;
  };
  players?: RawTournamentPlayer[];
  rounds?: string[]; // Array of round endpoint URLs
}

export interface RawTournamentPlayer {
  username?: string;
  status?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  points?: number;
  tie_break?: number;
  is_advancing?: boolean;
  timeout_removed?: boolean;
}

export interface RawTournamentRound {
  groups?: string[]; // Array of group endpoint URLs
  players?: RawTournamentPlayer[];
}

export interface RawTournamentGroup {
  fair_play_removals?: string[];
  games?: RawTournamentGame[];
  players?: RawGroupPlayer[];
}

export interface RawGroupPlayer {
  username?: string;
  points?: number;
  tie_break?: number;
  is_advancing?: boolean;
  timeout_removed?: boolean;
}

export interface RawTournamentGame {
  url?: string;
  pgn?: string;
  time_control?: string;
  end_time?: number;
  rated?: boolean;
  fen?: string;
  start_time?: number;
  time_class?: string;
  rules?: string;
  white?: RawGamePlayer;
  black?: RawGamePlayer;
}

export interface RawGamePlayer {
  rating?: number;
  result?: string;
  "@id"?: string;
  username?: string;
  uuid?: string;
}

export interface RawApiError {
  code?: number;
  message?: string;
}

// ─────────────────────────────────────────────
// Normalized Internal UI Models
// ─────────────────────────────────────────────

export interface Tournament {
  slug: string;
  name: string;
  url: string;
  description: string;
  creator: string;
  status: TournamentStatus;
  finishReason: string | null;
  startTime: Date | null;
  type: string;
  rules: string;
  timeClass: string;
  timeControl: string;
  isRated: boolean;
  totalRounds: number | null;
  registeredPlayerCount: number | null;
  roundUrls: string[];
  players: TournamentPlayer[];
  rawData: unknown;
}

export type TournamentStatus =
  | "registration"
  | "in_progress"
  | "finished"
  | "unknown";

export interface TournamentPlayer {
  username: string;
  status: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  tieBreak: number;
  isAdvancing: boolean;
  isRemoved: boolean;
}

export interface TournamentRound {
  roundNumber: number;
  groupUrls: string[];
  players: TournamentPlayer[];
  rawData: unknown;
}

export interface TournamentGroup {
  roundNumber: number;
  groupNumber: number;
  players: GroupPlayer[];
  games: TournamentGame[];
  fairPlayRemovals: string[];
  rawData: unknown;
}

export interface GroupPlayer {
  username: string;
  points: number;
  tieBreak: number;
  isAdvancing: boolean;
  isRemoved: boolean;
}

export interface TournamentGame {
  url: string | null;
  timeControl: string;
  timeClass: string;
  startTime: Date | null;
  endTime: Date | null;
  rated: boolean;
  rules: string;
  white: GamePlayer;
  black: GamePlayer;
  result: GameResult;
}

export interface GamePlayer {
  username: string;
  rating: number | null;
  result: string;
  profileUrl: string | null;
}

export type GameResult = "white" | "black" | "draw" | "in_progress" | "unknown";

export interface StandingRow {
  rank: number;
  username: string;
  points: number;
  tieBreak: number;
  wins: number;
  losses: number;
  draws: number;
  isAdvancing: boolean;
  isRemoved: boolean;
  status: string;
}

// ─────────────────────────────────────────────
// API Route Types
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  fetchedAt: string; // ISO string
  sourceUrl: string;
  cached: boolean;
}

export interface ApiError {
  type: "not_found" | "rate_limited" | "network" | "parse" | "invalid_input" | "unknown";
  message: string;
  statusCode: number | null;
  retryAfter?: number;
}

// ─────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────

export interface FreshnessInfo {
  fetchedAt: Date | null;
  sourceUrl: string | null;
  cached: boolean;
}

export type LoadState = "idle" | "loading" | "success" | "error";
