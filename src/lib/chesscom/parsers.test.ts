/**
 * Unit tests for Chess.com URL/slug parsing utilities.
 * Run with: npx jest src/lib/chesscom/parsers.test.ts
 * (Add jest + ts-jest to devDependencies for Phase 2 test suite)
 */

import {
  parseTournamentSlug,
  sanitizeSlug,
  parseRoundNumber,
  parseGroupNumber,
  buildTournamentEndpoint,
  buildRoundEndpoint,
  buildGroupEndpoint,
  parseRoundUrl,
  parseGroupUrl,
  parsePlayerUrl,
} from "./parsers";

// ─── parseTournamentSlug ──────────────────────────────────────────

describe("parseTournamentSlug", () => {
  test("extracts slug from full Chess.com URL", () => {
    expect(
      parseTournamentSlug(
        "https://www.chess.com/tournament/world-blitz-championship-2024"
      )
    ).toBe("world-blitz-championship-2024");
  });

  test("handles URL without www", () => {
    expect(
      parseTournamentSlug("https://chess.com/tournament/my-tournament-123")
    ).toBe("my-tournament-123");
  });

  test("handles URL without protocol", () => {
    expect(
      parseTournamentSlug("chess.com/tournament/slug-here")
    ).toBe("slug-here");
  });

  test("handles live/ prefix in URL", () => {
    expect(
      parseTournamentSlug(
        "https://www.chess.com/tournament/live/live-tournament-abc"
      )
    ).toBe("live-tournament-abc");
  });

  test("handles daily/ prefix in URL", () => {
    expect(
      parseTournamentSlug(
        "https://www.chess.com/tournament/daily/daily-slug-xyz"
      )
    ).toBe("daily-slug-xyz");
  });

  test("accepts bare slug directly", () => {
    expect(parseTournamentSlug("my-tournament-2024")).toBe("my-tournament-2024");
  });

  test("accepts slug with underscores", () => {
    expect(parseTournamentSlug("world_cup_2024")).toBe("world_cup_2024");
  });

  test("lowercases the slug", () => {
    expect(parseTournamentSlug("MyTournament")).toBe("mytournament");
  });

  test("trims whitespace", () => {
    expect(parseTournamentSlug("  my-slug  ")).toBe("my-slug");
  });

  test("returns null for empty string", () => {
    expect(parseTournamentSlug("")).toBeNull();
  });

  test("returns null for invalid characters only", () => {
    expect(parseTournamentSlug("!@#$%^")).toBeNull();
  });

  test("returns null for unrelated URL", () => {
    expect(parseTournamentSlug("https://google.com/something")).toBeNull();
  });

  test("strips invalid chars from bare slug", () => {
    // Spaces and special chars get stripped — what remains must be non-empty
    // "my tournament!" → after strip → "mytournament"
    const result = parseTournamentSlug("my.tournament");
    // "." stripped → "mytournament"
    expect(result).toBe("mytournament");
  });
});

// ─── parseRoundNumber ─────────────────────────────────────────────

describe("parseRoundNumber", () => {
  test("parses valid round numbers", () => {
    expect(parseRoundNumber("1")).toBe(1);
    expect(parseRoundNumber("12")).toBe(12);
    expect(parseRoundNumber("100")).toBe(100);
  });

  test("returns null for zero", () => {
    expect(parseRoundNumber("0")).toBeNull();
  });

  test("returns null for negative", () => {
    expect(parseRoundNumber("-1")).toBeNull();
  });

  test("returns null for non-numeric", () => {
    expect(parseRoundNumber("abc")).toBeNull();
  });

  test("returns null for null/undefined", () => {
    expect(parseRoundNumber(null)).toBeNull();
    expect(parseRoundNumber(undefined)).toBeNull();
  });

  test("returns null for out-of-range", () => {
    expect(parseRoundNumber("1001")).toBeNull();
  });
});

// ─── buildEndpoints ───────────────────────────────────────────────

describe("buildTournamentEndpoint", () => {
  test("builds correct URL", () => {
    expect(buildTournamentEndpoint("my-tournament")).toBe(
      "https://api.chess.com/pub/tournament/my-tournament"
    );
  });
});

describe("buildRoundEndpoint", () => {
  test("builds correct URL", () => {
    expect(buildRoundEndpoint("my-tournament", 3)).toBe(
      "https://api.chess.com/pub/tournament/my-tournament/3"
    );
  });
});

describe("buildGroupEndpoint", () => {
  test("builds correct URL", () => {
    expect(buildGroupEndpoint("my-tournament", 3, 2)).toBe(
      "https://api.chess.com/pub/tournament/my-tournament/3/2"
    );
  });
});

// ─── parseRoundUrl ────────────────────────────────────────────────

describe("parseRoundUrl", () => {
  test("parses round URL", () => {
    expect(
      parseRoundUrl("https://api.chess.com/pub/tournament/my-slug/3")
    ).toEqual({ slug: "my-slug", round: 3 });
  });

  test("returns null for malformed URL", () => {
    expect(parseRoundUrl("https://api.chess.com/pub/player/someone")).toBeNull();
  });
});

// ─── parseGroupUrl ────────────────────────────────────────────────

describe("parseGroupUrl", () => {
  test("parses group URL", () => {
    expect(
      parseGroupUrl("https://api.chess.com/pub/tournament/my-slug/3/2")
    ).toEqual({ slug: "my-slug", round: 3, group: 2 });
  });

  test("returns null for round-only URL", () => {
    expect(
      parseGroupUrl("https://api.chess.com/pub/tournament/my-slug/3")
    ).toBeNull();
  });
});

// ─── parsePlayerUrl ──────────────────────────────────────────────

describe("parsePlayerUrl", () => {
  test("extracts username from player URL", () => {
    expect(
      parsePlayerUrl("https://api.chess.com/pub/player/magnuscarlsen")
    ).toBe("magnuscarlsen");
  });

  test("returns null for non-player URL", () => {
    expect(parsePlayerUrl("https://api.chess.com/pub/tournament/slug")).toBeNull();
  });
});
