/**
 * Unit tests for Chess.com data mappers.
 */

import {
  mapTournament,
  mapTournamentPlayer,
  mapTournamentRound,
  mapTournamentGroup,
  mapTournamentGame,
  buildStandings,
  buildTournamentStandings,
} from "./mappers";
import type { RawTournament, RawTournamentPlayer, RawTournamentGroup } from "@/types";

// ─── mapTournament ────────────────────────────────────────────────

describe("mapTournament", () => {
  const raw: RawTournament = {
    name: "World Blitz 2024",
    url: "https://www.chess.com/tournament/world-blitz-2024",
    description: "Annual blitz championship",
    creator: "chess",
    status: "in_progress",
    finish_reason: null,
    start_time: 1700000000,
    settings: {
      type: "swiss",
      rules: "chess",
      time_class: "blitz",
      time_control: "180+2",
      is_rated: true,
      registered_user_count: 512,
      total_rounds: 11,
    },
    rounds: [
      "https://api.chess.com/pub/tournament/world-blitz-2024/1",
      "https://api.chess.com/pub/tournament/world-blitz-2024/2",
    ],
    players: [],
  };

  test("maps all core fields correctly", () => {
    const t = mapTournament(raw, "world-blitz-2024");
    expect(t.slug).toBe("world-blitz-2024");
    expect(t.name).toBe("World Blitz 2024");
    expect(t.status).toBe("in_progress");
    expect(t.timeClass).toBe("blitz");
    expect(t.timeControl).toBe("180+2");
    expect(t.isRated).toBe(true);
    expect(t.totalRounds).toBe(11);
    expect(t.registeredPlayerCount).toBe(512);
    expect(t.roundUrls).toHaveLength(2);
    expect(t.startTime).toBeInstanceOf(Date);
  });

  test("falls back to slug when name is missing", () => {
    const t = mapTournament({ ...raw, name: undefined }, "fallback-slug");
    expect(t.name).toBe("fallback-slug");
  });

  test("maps registration status", () => {
    const t = mapTournament({ ...raw, status: "registration" }, "s");
    expect(t.status).toBe("registration");
  });

  test("maps finished status", () => {
    const t = mapTournament({ ...raw, status: "finished" }, "s");
    expect(t.status).toBe("finished");
  });

  test("maps unknown status for unrecognized value", () => {
    const t = mapTournament({ ...raw, status: "weird_value" }, "s");
    expect(t.status).toBe("unknown");
  });

  test("handles missing settings gracefully", () => {
    const t = mapTournament({ ...raw, settings: undefined }, "s");
    expect(t.timeClass).toBe("unknown");
    expect(t.isRated).toBe(false);
    expect(t.totalRounds).toBeNull();
  });
});

// ─── mapTournamentPlayer ──────────────────────────────────────────

describe("mapTournamentPlayer", () => {
  const raw: RawTournamentPlayer = {
    username: "magnuscarlsen",
    status: "active",
    wins: 8,
    losses: 1,
    draws: 2,
    points: 9,
    tie_break: 42.5,
    is_advancing: true,
    timeout_removed: false,
  };

  test("maps all fields", () => {
    const p = mapTournamentPlayer(raw);
    expect(p.username).toBe("magnuscarlsen");
    expect(p.wins).toBe(8);
    expect(p.losses).toBe(1);
    expect(p.draws).toBe(2);
    expect(p.points).toBe(9);
    expect(p.tieBreak).toBe(42.5);
    expect(p.isAdvancing).toBe(true);
    expect(p.isRemoved).toBe(false);
  });

  test("uses safe defaults for missing fields", () => {
    const p = mapTournamentPlayer({});
    expect(p.username).toBe("unknown");
    expect(p.wins).toBe(0);
    expect(p.points).toBe(0);
    expect(p.isAdvancing).toBe(false);
  });
});

// ─── buildStandings ───────────────────────────────────────────────

describe("buildStandings", () => {
  const players = [
    { username: "alice", points: 3, tieBreak: 10, isAdvancing: true, isRemoved: false },
    { username: "bob", points: 3, tieBreak: 8, isAdvancing: false, isRemoved: false },
    { username: "charlie", points: 2, tieBreak: 5, isAdvancing: false, isRemoved: false },
    { username: "dave", points: 0, tieBreak: 0, isAdvancing: false, isRemoved: true },
  ];

  test("ranks by points descending", () => {
    const standings = buildStandings(players);
    expect(standings[0].username).toBe("alice");
    expect(standings[1].username).toBe("bob");
    expect(standings[2].username).toBe("charlie");
  });

  test("breaks ties by tieBreak descending", () => {
    const standings = buildStandings(players);
    // alice and bob both have 3 pts; alice has higher TB
    expect(standings[0].username).toBe("alice");
    expect(standings[1].username).toBe("bob");
  });

  test("assigns correct rank numbers", () => {
    const standings = buildStandings(players);
    expect(standings.map((s) => s.rank)).toEqual([1, 2, 3, 4]);
  });

  test("marks advancing players correctly", () => {
    const standings = buildStandings(players);
    expect(standings[0].status).toBe("advancing");
    expect(standings[1].status).toBe("active");
    expect(standings[3].status).toBe("removed");
  });

  test("returns empty array for empty input", () => {
    expect(buildStandings([])).toEqual([]);
  });
});

// ─── mapTournamentGroup ───────────────────────────────────────────

describe("mapTournamentGroup", () => {
  const raw: RawTournamentGroup = {
    fair_play_removals: ["cheater123"],
    players: [
      { username: "alice", points: 2, tie_break: 5 },
      { username: "bob", points: 1.5, tie_break: 3 },
    ],
    games: [
      {
        url: "https://www.chess.com/game/live/12345",
        time_control: "180",
        time_class: "blitz",
        rated: true,
        rules: "chess",
        white: { username: "alice", rating: 2800, result: "win" },
        black: { username: "bob", rating: 2750, result: "resigned" },
      },
    ],
  };

  test("maps players and games", () => {
    const group = mapTournamentGroup(raw, 1, 2);
    expect(group.roundNumber).toBe(1);
    expect(group.groupNumber).toBe(2);
    expect(group.players).toHaveLength(2);
    expect(group.games).toHaveLength(1);
    expect(group.fairPlayRemovals).toEqual(["cheater123"]);
  });

  test("derives white win result correctly", () => {
    const group = mapTournamentGroup(raw, 1, 1);
    expect(group.games[0].result).toBe("white");
  });

  test("handles missing games gracefully", () => {
    const group = mapTournamentGroup({ ...raw, games: undefined }, 1, 1);
    expect(group.games).toEqual([]);
  });
});
