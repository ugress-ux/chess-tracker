"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Tournament, TournamentRound, TournamentGroup } from "@/types";

// ─────────────────────────────────────────────
// Fetchers (call our own proxy API routes)
// ─────────────────────────────────────────────

async function apiFetch<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url, { cache: "no-store" });
  const json: ApiResponse<T> = await res.json();
  return json;
}

// ─────────────────────────────────────────────
// Query key factories
// ─────────────────────────────────────────────

export const queryKeys = {
  tournament: (slug: string) => ["tournament", slug] as const,
  round: (slug: string, round: number) => ["tournament", slug, "round", round] as const,
  group: (slug: string, round: number, group: number) =>
    ["tournament", slug, "round", round, "group", group] as const,
};

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────

export function useTournament(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.tournament(slug ?? ""),
    queryFn: () => apiFetch<Tournament>(`/api/chesscom/tournament/${slug}`),
    enabled: !!slug,
    staleTime: 30_000,
    refetchInterval: false, // Manual refresh only
  });
}

export function useTournamentRound(
  slug: string | null,
  round: number | null,
  options?: { autoRefresh?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.round(slug ?? "", round ?? 0),
    queryFn: () =>
      apiFetch<TournamentRound>(
        `/api/chesscom/tournament/${slug}/${round}`
      ),
    enabled: !!slug && !!round,
    staleTime: 30_000,
    refetchInterval: options?.autoRefresh ? 90_000 : false,
  });
}

export function useTournamentGroup(
  slug: string | null,
  round: number | null,
  group: number | null,
  options?: { autoRefresh?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.group(slug ?? "", round ?? 0, group ?? 0),
    queryFn: () =>
      apiFetch<TournamentGroup>(
        `/api/chesscom/tournament/${slug}/${round}/${group}`
      ),
    enabled: !!slug && !!round && !!group,
    staleTime: 20_000,
    refetchInterval: options?.autoRefresh ? 60_000 : false,
  });
}
