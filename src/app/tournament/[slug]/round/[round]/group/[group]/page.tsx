"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users2, BarChart2, Swords, Code2, AlertTriangle } from "lucide-react";
import { useTournamentGroup } from "@/components/tournament/hooks";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { PairingsTable } from "@/components/tournament/PairingsTable";
import { FreshnessBar } from "@/components/ui/FreshnessBar";
import { ErrorState, DisclaimerBanner } from "@/components/ui/ErrorState";
import { RawJsonPanel } from "@/components/ui/RawJsonPanel";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { buildStandings } from "@/lib/chesscom/mappers";
import { buildPlayerProfileUrl } from "@/lib/chesscom/parsers";
import { cn } from "@/lib/utils";
import type { GroupPlayer } from "@/types";

type Tab = "standings" | "pairings" | "players" | "raw";

const TABS: { id: Tab; label: string; icon: typeof Users2 }[] = [
  { id: "standings", label: "Standings", icon: BarChart2 },
  { id: "pairings", label: "Pairings", icon: Swords },
  { id: "players", label: "Players", icon: Users2 },
  { id: "raw", label: "Raw JSON", icon: Code2 },
];

export default function GroupPage() {
  const { slug, round, group } = useParams<{
    slug: string;
    round: string;
    group: string;
  }>();

  const roundNum = parseInt(round, 10);
  const groupNum = parseInt(group, 10);
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useTournamentGroup(
    slug,
    isNaN(roundNum) ? null : roundNum,
    isNaN(groupNum) ? null : groupNum,
    { autoRefresh }
  );

  const freshness = {
    fetchedAt: data?.fetchedAt ? new Date(data.fetchedAt) : null,
    sourceUrl: data?.sourceUrl ?? null,
    cached: data?.cached ?? false,
  };

  const standings = data?.data ? buildStandings(data.data.players) : [];

  return (
    <main className="chess-bg min-h-screen">
      {/* Nav */}
      <header className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <Link
            href={`/tournament/${slug}/round/${round}`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Round {round}
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-amber-chess" />
            <span className="text-sm font-mono text-slate-400">
              group {group}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <DisclaimerBanner />

        {/* Page title */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-chess/10 border border-amber-chess/20 flex items-center justify-center">
              <Users2 className="w-5 h-5 text-amber-chess" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-slate-100">
                Group {group}
              </h1>
              <p className="text-sm text-slate-500 font-mono">
                {slug} · round {round}
              </p>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-slate-500">Auto-refresh (60s)</span>
            <button
              role="switch"
              aria-checked={autoRefresh}
              onClick={() => setAutoRefresh((v) => !v)}
              className={cn(
                "w-10 h-5 rounded-full border transition-all duration-200 relative",
                autoRefresh
                  ? "bg-amber-chess/20 border-amber-chess/40"
                  : "bg-slate-800 border-slate-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
                  autoRefresh
                    ? "left-5 bg-amber-chess"
                    : "left-0.5 bg-slate-500"
                )}
              />
            </button>
          </label>
        </div>

        {isLoading && (
          <div className="space-y-4 animate-fade-in">
            <SkeletonTable rows={8} />
          </div>
        )}

        {!isLoading && data?.error && (
          <ErrorState error={data.error} onRetry={() => refetch()} />
        )}

        {!isLoading && data?.data && (
          <div className="space-y-6 animate-fade-in">
            {/* Group stats */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span>
                <span className="text-slate-300 font-semibold">
                  {data.data.players.length}
                </span>{" "}
                players
              </span>
              <span>
                <span className="text-slate-300 font-semibold">
                  {data.data.games.length}
                </span>{" "}
                games
              </span>
              {data.data.fairPlayRemovals.length > 0 && (
                <span className="flex items-center gap-1.5 text-amber-500/70">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {data.data.fairPlayRemovals.length} fair play removal(s)
                </span>
              )}
            </div>

            <FreshnessBar
              info={freshness}
              onRefresh={() => refetch()}
              isRefreshing={isRefetching}
              className="border-t border-slate-800/50 pt-3"
            />

            {/* Tabs */}
            <div className="border-b border-slate-800">
              <div className="flex overflow-x-auto gap-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                      activeTab === id
                        ? "border-amber-chess text-amber-chess"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-fade-in">
              {activeTab === "standings" && (
                <StandingsTable standings={standings} />
              )}
              {activeTab === "pairings" && (
                <PairingsTable games={data.data.games} />
              )}
              {activeTab === "players" && (
                <GroupPlayerCards players={data.data.players} />
              )}
              {activeTab === "raw" && (
                <RawJsonPanel
                  data={data.data.rawData}
                  sourceUrl={data?.sourceUrl ?? undefined}
                  title="Group Raw JSON"
                  defaultOpen
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Group player cards
// ─────────────────────────────────────────────

function GroupPlayerCards({ players }: { players: GroupPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No player data available for this group.
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.tieBreak - a.tieBreak;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map((player, i) => (
        <a
          key={player.username}
          href={buildPlayerProfileUrl(player.username)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "surface p-4 flex items-center gap-3 group",
            "hover:border-amber-chess/20 transition-all duration-200",
            player.isRemoved && "opacity-50"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0",
              i === 0
                ? "bg-amber-chess/20 text-amber-chess"
                : i === 1
                ? "bg-slate-700/60 text-slate-300"
                : i === 2
                ? "bg-amber-900/20 text-amber-700"
                : "bg-slate-800 text-slate-500"
            )}
          >
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-200 group-hover:text-amber-chess transition-colors truncate">
              {player.username}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{player.points} pts</span>
              {player.tieBreak > 0 && (
                <span className="text-slate-600">TB: {player.tieBreak.toFixed(2)}</span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {player.isAdvancing && (
              <span className="text-xs text-emerald-400 font-medium">↑</span>
            )}
            {player.isRemoved && (
              <span className="text-xs text-red-400 font-medium">✕</span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
