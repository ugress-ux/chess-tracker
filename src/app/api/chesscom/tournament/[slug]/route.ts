import { NextRequest, NextResponse } from "next/server";
import { parseTournamentSlug } from "@/lib/chesscom/parsers";
import { fetchTournament } from "@/lib/chesscom/client";
import { mapTournament } from "@/lib/chesscom/mappers";
import { cache, CACHE_TTL, tournamentCacheKey } from "@/lib/cache";
import { buildTournamentEndpoint } from "@/lib/chesscom/parsers";
import type { ApiResponse, Tournament } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = parseTournamentSlug(params.slug);

  if (!slug) {
    return NextResponse.json(
      {
        data: null,
        error: {
          type: "invalid_input",
          message: "Invalid tournament slug. Use only letters, numbers, hyphens, and underscores.",
          statusCode: 400,
        },
        fetchedAt: new Date().toISOString(),
        sourceUrl: "",
        cached: false,
      } satisfies ApiResponse<Tournament>,
      { status: 400 }
    );
  }

  const cacheKey = tournamentCacheKey(slug);
  const sourceUrl = buildTournamentEndpoint(slug);

  // Check cache
  const cached = cache.get<Tournament>(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        data: cached.value,
        error: null,
        fetchedAt: new Date(cached.cachedAt).toISOString(),
        sourceUrl,
        cached: true,
      } satisfies ApiResponse<Tournament>,
      { status: 200 }
    );
  }

  // Fetch from Chess.com
  const result = await fetchTournament(slug);

  if (!result.ok) {
    const statusCode = result.error.statusCode ?? 500;
    return NextResponse.json(
      {
        data: null,
        error: result.error,
        fetchedAt: new Date().toISOString(),
        sourceUrl,
        cached: false,
      } satisfies ApiResponse<Tournament>,
      { status: statusCode }
    );
  }

  const tournament = mapTournament(result.data, slug);
  cache.set(cacheKey, tournament, CACHE_TTL.TOURNAMENT);

  return NextResponse.json(
    {
      data: tournament,
      error: null,
      fetchedAt: new Date().toISOString(),
      sourceUrl,
      cached: false,
    } satisfies ApiResponse<Tournament>,
    { status: 200 }
  );
}
