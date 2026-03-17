import { NextRequest, NextResponse } from "next/server";
import { parseTournamentSlug, parseRoundNumber, buildRoundEndpoint } from "@/lib/chesscom/parsers";
import { fetchTournamentRound } from "@/lib/chesscom/client";
import { mapTournamentRound } from "@/lib/chesscom/mappers";
import { cache, CACHE_TTL, roundCacheKey } from "@/lib/cache";
import type { ApiResponse, TournamentRound } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; round: string } }
) {
  const slug = parseTournamentSlug(params.slug);
  const roundNum = parseRoundNumber(params.round);

  if (!slug || !roundNum) {
    return NextResponse.json(
      {
        data: null,
        error: {
          type: "invalid_input",
          message: "Invalid tournament slug or round number.",
          statusCode: 400,
        },
        fetchedAt: new Date().toISOString(),
        sourceUrl: "",
        cached: false,
      } satisfies ApiResponse<TournamentRound>,
      { status: 400 }
    );
  }

  const cacheKey = roundCacheKey(slug, roundNum);
  const sourceUrl = buildRoundEndpoint(slug, roundNum);

  const cached = cache.get<TournamentRound>(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        data: cached.value,
        error: null,
        fetchedAt: new Date(cached.cachedAt).toISOString(),
        sourceUrl,
        cached: true,
      } satisfies ApiResponse<TournamentRound>,
      { status: 200 }
    );
  }

  const result = await fetchTournamentRound(slug, roundNum);

  if (!result.ok) {
    return NextResponse.json(
      {
        data: null,
        error: result.error,
        fetchedAt: new Date().toISOString(),
        sourceUrl,
        cached: false,
      } satisfies ApiResponse<TournamentRound>,
      { status: result.error.statusCode ?? 500 }
    );
  }

  const round = mapTournamentRound(result.data, roundNum);
  cache.set(cacheKey, round, CACHE_TTL.ROUND);

  return NextResponse.json(
    {
      data: round,
      error: null,
      fetchedAt: new Date().toISOString(),
      sourceUrl,
      cached: false,
    } satisfies ApiResponse<TournamentRound>,
    { status: 200 }
  );
}
