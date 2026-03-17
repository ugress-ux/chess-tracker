import { z } from "zod";

// ─────────────────────────────────────────────
// Primitive helpers
// ─────────────────────────────────────────────

const optStr = z.string().optional().nullable();
const optNum = z.number().optional().nullable();
const optBool = z.boolean().optional().nullable();

// ─────────────────────────────────────────────
// Player schemas
// ─────────────────────────────────────────────

export const RawTournamentPlayerSchema = z.object({
  username: optStr,
  status: optStr,
  wins: optNum,
  losses: optNum,
  draws: optNum,
  points: optNum,
  tie_break: optNum,
  is_advancing: optBool,
  timeout_removed: optBool,
});

export const RawGroupPlayerSchema = z.object({
  username: optStr,
  points: optNum,
  tie_break: optNum,
  is_advancing: optBool,
  timeout_removed: optBool,
});

// ─────────────────────────────────────────────
// Game schemas
// ─────────────────────────────────────────────

export const RawGamePlayerSchema = z.object({
  rating: optNum,
  result: optStr,
  "@id": optStr,
  username: optStr,
  uuid: optStr,
});

export const RawTournamentGameSchema = z.object({
  url: optStr,
  pgn: optStr,
  time_control: optStr,
  end_time: optNum,
  rated: optBool,
  fen: optStr,
  start_time: optNum,
  time_class: optStr,
  rules: optStr,
  white: RawGamePlayerSchema.optional(),
  black: RawGamePlayerSchema.optional(),
});

// ─────────────────────────────────────────────
// Tournament schemas
// ─────────────────────────────────────────────

export const RawTournamentSettingsSchema = z.object({
  type: optStr,
  rules: optStr,
  time_class: optStr,
  time_control: optStr,
  is_rated: optBool,
  is_official: optBool,
  is_invite_only: optBool,
  initial_group_size: optNum,
  user_advance_count: optNum,
  use_tiebreak: optBool,
  allow_vacation: optBool,
  winner_places: optNum,
  registered_user_count: optNum,
  games_per_opponent: optNum,
  total_rounds: optNum,
  concurrent_games_per_opponent: optNum,
});

export const RawTournamentSchema = z.object({
  name: optStr,
  url: optStr,
  description: optStr,
  creator: optStr,
  status: optStr,
  finish_reason: optStr,
  start_time: optNum,
  settings: RawTournamentSettingsSchema.optional(),
  players: z.array(RawTournamentPlayerSchema).optional(),
  rounds: z.array(z.string()).optional(),
});

export const RawTournamentRoundSchema = z.object({
  groups: z.array(z.string()).optional(),
  players: z.array(RawTournamentPlayerSchema).optional(),
});

export const RawTournamentGroupSchema = z.object({
  fair_play_removals: z.array(z.string()).optional(),
  games: z.array(RawTournamentGameSchema).optional(),
  players: z.array(RawGroupPlayerSchema).optional(),
});

// ─────────────────────────────────────────────
// API Error schema
// ─────────────────────────────────────────────

export const RawApiErrorSchema = z.object({
  code: optNum,
  message: optStr,
});

// ─────────────────────────────────────────────
// Exported inferred types
// ─────────────────────────────────────────────

export type RawTournamentInput = z.infer<typeof RawTournamentSchema>;
export type RawTournamentRoundInput = z.infer<typeof RawTournamentRoundSchema>;
export type RawTournamentGroupInput = z.infer<typeof RawTournamentGroupSchema>;
