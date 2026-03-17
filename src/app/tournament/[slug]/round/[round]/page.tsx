"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Users, BarChart2, Code2, Trophy } from "lucide-react";
import { useTournamentRound } from "@/components/tournament/hooks";
import { GroupsGrid } from "@/components/tournament/GroupsGrid";
import { PlayersList } from "@/components/players/PlayersList";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { FreshnessBar } from "@/components/ui/FreshnessBar";
import { ErrorState, DisclaimerBanner } from "@/components/ui/ErrorState";
import { RawJsonPanel } from "@/components/ui/RawJsonPanel";
import { SkeletonRoundGrid, SkeletonTable } from "@/components/ui/Skeleton";
import { buildTournamentStandings } from "@/lib/chesscom/mappers";
import { cn } from "@/lib/utils";

type Tab = "groups" | "players" | "standings" | "raw";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "groups", label: "Groups", icon: Layers },
  { id: "players", label: "Players", icon: Users },
  { id: "standings", label: "Standings", icon: BarChart2 },
  { id: "raw", label: "Raw JSON", icon: Code2 },
];

export default function RoundPage() {
  const { slug, round } = useParams<{ slug: string; round: string }>();
  const roundNum = parseInt(round, 10);
  const [activeTab, setActiveTab] = useState<Tab>("groups");

  const { data, isLoading, isRefetching, refetch } = useTournamentRound(
    slug,
    isNaN(roundNum) ? null : roundNum,
    { autoRefresh: false }
  );

  const freshness = {
    fetchedAt: data?.fetchedAt ? new Date(data.fetchedAt) : null,
    sourceUrl: data?.sourceUrl ?? null,
    cached: data?.cached ?? false,
  };

  return (
    <main className="chess-bg min-h-screen">
      <header className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href={`/tournament/${slug}`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tournament
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-chess" />
            <span className="text-sm font-mono text-slate-400">
              round {round}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <DisclaimerBanner />

        {/* Page title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-chess/10 border border-amber-chess/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-chess" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-slate-100">
              Round {round}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{slug}</p>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4 animate-fade-in">
            <SkeletonRoundGrid />
          </div>
        )}

        {!isLoading && data?.error && (
          <ErrorState error={data.error} onRetry={() => refetch()} />
        )}

        {!isLoading && data?.data && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span>
                <span className="text-slate-300 font-semibold">
                  {data.data.groupUrls.length}
                </span>{" "}
                groups
              </span>
              <span>
                <span className="text-slate-300 font-semibold">
                  {data.data.players.length}
                </span>{" "}
                players
              </span>
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
              {activeTab === "groups" && (
                <GroupsGrid
                  slug={slug}
                  roundNumber={roundNum}
                  groupUrls={data.data.groupUrls}
                />
              )}
              {activeTab === "players" && (
                <PlayersList players={data.data.players} />
              )}
              {activeTab === "standings" && (
                <StandingsTable
                  standings={buildTournamentStandings(data.data.players)}
                  showWLD
                />
              )}
              {activeTab === "raw" && (
                <RawJsonPanel
                  data={data.data.rawData}
                  sourceUrl={data?.sourceUrl ?? undefined}
                  title="Round Raw JSON"
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
