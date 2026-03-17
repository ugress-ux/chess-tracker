import { NextRequest, NextResponse } from "next/server";
import {
  parseTournamentSlug,
  parseRoundNumber,
  parseGroupNumber,
  buildGroupEndpoint,
} from "@/lib/chesscom/parsers";
import { fetchTournamentGroup } from "@/lib/chesscom/client";
import { mapTournamentGroup } from "@/lib/chesscom/mappers";
import { cache, CACHE_TTL, groupCacheKey } from "@/lib/cache";
import type { ApiResponse, TournamentGroup } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; round: string; group: string } }
) {
  const slug = parseTournamentSlug(params.slug);
  const roundNum = parseRoundNumber(params.round);
  const groupNum = parseGroupNumber(params.group);

  if (!slug || !roundNum || !groupNum) {
    return NextResponse.json(
      {
        data: null,
        error: {
          type: "invalid_input",
          message: "Invalid slug, round, or group parameter.",
          statusCode: 400,
        },
        fetchedAt: new Date().toISOString(),
        sourceUrl: "",
        cached: false,
      } satisfies ApiResponse<TournamentGroup>,
      { status: 400 }
    );
  }

  const cacheKey = groupCacheKey(slug, roundNum, groupNum);
  const sourceUrl = buildGroupEndpoint(slug, roundNum, groupNum);

  const cached = cache.get<TournamentGroup>(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        data: cached.value,
        error: null,
        fetchedAt: new Date(cached.cachedAt).toISOString(),
        sourceUrl,
        cached: true,
      } satisfies ApiResponse<TournamentGroup>,
      { status: 200 }
    );
  }

  const result = await fetchTournamentGroup(slug, roundNum, groupNum);

  if (!result.ok) {
    return NextResponse.json(
      {
        data: null,
        error: result.error,
        fetchedAt: new Date().toISOString(),
        sourceUrl,
        cached: false,
      } satisfies ApiResponse<TournamentGroup>,
      { status: result.error.statusCode ?? 500 }
    );
  }

  const group = mapTournamentGroup(result.data, roundNum, groupNum);
  cache.set(cacheKey, group, CACHE_TTL.GROUP);

  return NextResponse.json(
    {
      data: group,
      error: null,
      fetchedAt: new Date().toISOString(),
      sourceUrl,
      cached: false,
    } satisfies ApiResponse<TournamentGroup>,
    { status: 200 }
  );
}
