import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "ChessTournamentTracker/1.0 (public-api-tracker)";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 100);

  if (!username) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const url = `https://api.chess.com/pub/player/${username}/tournaments`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json(
        { error: "Player not found on Chess.com." },
        { status: 404 }
      );
    }
    if (res.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Chess.com returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // data shape: { finished: [...], in_progress: [...], registered: [...] }
    // Each entry has: url, @id, status, wins, losses, draws, placement, total_players, time_class
    const finished: RawPlayerTournament[] = data.finished ?? [];
    const inProgress: RawPlayerTournament[] = data.in_progress ?? [];
    const registered: RawPlayerTournament[] = data.registered ?? [];

    const normalize = (list: RawPlayerTournament[], status: string) =>
      list.map((t) => ({
        url: t.url ?? "",
        slug: extractSlug(t.url ?? t["@id"] ?? ""),
        name: slugToName(extractSlug(t.url ?? t["@id"] ?? "")),
        status,
        timeClass: t.time_class ?? "unknown",
        placement: t.placement ?? null,
        totalPlayers: t.total_players ?? null,
        wins: t.wins ?? 0,
        losses: t.losses ?? 0,
        draws: t.draws ?? 0,
      }));

    return NextResponse.json({
      username,
      inProgress: normalize(inProgress, "in_progress"),
      registered: normalize(registered, "registered"),
      finished: normalize(finished.slice(0, 20), "finished"), // cap at 20
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Network error reaching Chess.com." },
      { status: 500 }
    );
  }
}

interface RawPlayerTournament {
  url?: string;
  "@id"?: string;
  status?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  placement?: number;
  total_players?: number;
  time_class?: string;
}

function extractSlug(url: string): string {
  // https://www.chess.com/tournament/live/my-slug  or
  // https://api.chess.com/pub/tournament/my-slug
  const match = url.match(/\/tournament\/(?:live\/|daily\/)?([a-z0-9_-]+)\/?$/i);
  return match?.[1] ?? url;
}

function slugToName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
