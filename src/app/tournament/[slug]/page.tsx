"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  LayoutGrid,
  Layers,
  Users,
  BarChart2,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/components/tournament/hooks";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { RoundsList } from "@/components/tournament/RoundsList";
import { PlayersList } from "@/components/players/PlayersList";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { FreshnessBar } from "@/components/ui/FreshnessBar";
import { ErrorState, DisclaimerBanner } from "@/components/ui/ErrorState";
import { RawJsonPanel } from "@/components/ui/RawJsonPanel";
import {
  SkeletonTournamentHero,
  SkeletonTable,
  SkeletonRoundGrid,
} from "@/components/ui/Skeleton";
import { buildTournamentStandings } from "@/lib/chesscom/mappers";
import { cn } from "@/lib/utils";
import type { Tournament } from "@/types";
import { saveRecent } from "@/app/page";

type Tab = "overview" | "rounds" | "players" | "standings" | "raw";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "rounds", label: "Rounds", icon: Layers },
  { id: "players", label: "Players", icon: Users },
  { id: "standings", label: "Standings", icon: BarChart2 },
  { id: "raw", label: "Raw JSON", icon: Code2 },
];

export default function TournamentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data, isLoading, isRefetching, refetch } = useTournament(slug);

  useEffect(() => {
    if (data?.data?.name) {
      saveRecent(slug, data.data.name);
    }
  }, [slug, data?.data?.name]);

  const freshness = {
    fetchedAt: data?.fetchedAt ? new Date(data.fetchedAt) : null,
    sourceUrl: data?.sourceUrl ?? null,
    cached: data?.cached ?? false,
  };

  return (
    <main className="chess-bg min-h-screen">
      {/* Nav */}
      <header className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-amber-chess shrink-0" />
            <span className="text-sm font-mono text-slate-400 truncate">{slug}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Disclaimer */}
        <DisclaimerBanner />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6 animate-fade-in">
            <SkeletonTournamentHero />
            <SkeletonTable />
          </div>
        )}

        {/* Error */}
        {!isLoading && data?.error && (
          <ErrorState
            error={data.error}
            onRetry={() => refetch()}
          />
        )}

        {/* Content */}
        {!isLoading && data?.data && (
          <div className="space-y-6 animate-fade-in">
            <TournamentHeader tournament={data.data} />

            {/* Freshness */}
            <FreshnessBar
              info={freshness}
              onRefresh={() => refetch()}
              isRefreshing={isRefetching}
              className="border-t border-slate-800/50 pt-3"
            />

            {/* Tabs */}
            <div className="border-b border-slate-800">
              <div className="flex overflow-x-auto no-scrollbar gap-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150",
                      activeTab === id
                        ? "border-amber-chess text-amber-chess"
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="animate-fade-in">
              {activeTab === "overview" && (
                <OverviewTab tournament={data.data} slug={slug} />
              )}
              {activeTab === "rounds" && (
                <RoundsList
                  slug={slug}
                  roundUrls={data.data.roundUrls}
                  totalRounds={data.data.totalRounds}
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
                  title="Tournament Raw JSON"
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
// Overview tab
// ─────────────────────────────────────────────

function OverviewTab({
  tournament,
  slug,
}: {
  tournament: Tournament;
  slug: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stats */}
      <div className="surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Tournament Details
        </h3>
        <dl className="space-y-3">
          {[
            ["Type", tournament.type],
            ["Time Class", tournament.timeClass],
            ["Time Control", tournament.timeControl],
            ["Rules", tournament.rules],
            ["Rated", tournament.isRated ? "Yes" : "No"],
            ["Creator", tournament.creator],
            ["Total Rounds", tournament.totalRounds?.toString() ?? "—"],
            [
              "Registered Players",
              tournament.registeredPlayerCount?.toLocaleString() ?? "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
              <dd className="text-sm text-slate-300 text-right font-medium">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Quick navigation */}
      <div className="surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Quick Navigation
        </h3>
        <div className="space-y-2">
          {[
            { label: "View all rounds", href: "#rounds", tab: "rounds" as Tab },
            { label: "View all players", href: "#players", tab: "players" as Tab },
            { label: "Full standings", href: "#standings", tab: "standings" as Tab },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => {
                /* handled via URL or parent state */
                window.scrollTo({ top: 0 });
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-amber-chess/30 text-slate-300 hover:text-slate-100 text-sm transition-all"
            >
              {label}
              <span className="text-slate-600 text-xs">→</span>
            </button>
          ))}

          <a
            href={`https://www.chess.com/tournament/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-amber-chess/30 text-slate-300 hover:text-slate-100 text-sm transition-all"
          >
            Open on Chess.com
            <span className="text-slate-600 text-xs">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  LayoutGrid,
  Layers,
  Users,
  BarChart2,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/components/tournament/hooks";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import { RoundsList } from "@/components/tournament/RoundsList";
import { PlayersList } from "@/components/players/PlayersList";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { FreshnessBar } from "@/components/ui/FreshnessBar";
import { ErrorState, DisclaimerBanner } from "@/components/ui/ErrorState";
import { RawJsonPanel } from "@/components/ui/RawJsonPanel";
import {
  SkeletonTournamentHero,
  SkeletonTable,
  SkeletonRoundGrid,
} from "@/components/ui/Skeleton";
import { buildTournamentStandings } from "@/lib/chesscom/mappers";
import { cn } from "@/lib/utils";
import type { Tournament } from "@/types";

type Tab = "overview" | "rounds" | "players" | "standings" | "raw";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "rounds", label: "Rounds", icon: Layers },
  { id: "players", label: "Players", icon: Users },
  { id: "standings", label: "Standings", icon: BarChart2 },
  { id: "raw", label: "Raw JSON", icon: Code2 },
];

export default function TournamentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data, isLoading, isRefetching, refetch } = useTournament(slug);

  const freshness = {
    fetchedAt: data?.fetchedAt ? new Date(data.fetchedAt) : null,
    sourceUrl: data?.sourceUrl ?? null,
    cached: data?.cached ?? false,
  };

  return (
    <main className="chess-bg min-h-screen">
      {/* Nav */}
      <header className="border-b border-slate-800/60 px-6 py-4 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-amber-chess shrink-0" />
            <span className="text-sm font-mono text-slate-400 truncate">{slug}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Disclaimer */}
        <DisclaimerBanner />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6 animate-fade-in">
            <SkeletonTournamentHero />
            <SkeletonTable />
          </div>
        )}

        {/* Error */}
        {!isLoading && data?.error && (
          <ErrorState
            error={data.error}
            onRetry={() => refetch()}
          />
        )}

        {/* Content */}
        {!isLoading && data?.data && (
          <div className="space-y-6 animate-fade-in">
            <TournamentHeader tournament={data.data} />

            {/* Freshness */}
            <FreshnessBar
              info={freshness}
              onRefresh={() => refetch()}
              isRefreshing={isRefetching}
              className="border-t border-slate-800/50 pt-3"
            />

            {/* Tabs */}
            <div className="border-b border-slate-800">
              <div className="flex overflow-x-auto no-scrollbar gap-1">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150",
                      activeTab === id
                        ? "border-amber-chess text-amber-chess"
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="animate-fade-in">
              {activeTab === "overview" && (
                <OverviewTab tournament={data.data} slug={slug} />
              )}
              {activeTab === "rounds" && (
                <RoundsList
                  slug={slug}
                  roundUrls={data.data.roundUrls}
                  totalRounds={data.data.totalRounds}
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
                  title="Tournament Raw JSON"
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
// Overview tab
// ─────────────────────────────────────────────

function OverviewTab({
  tournament,
  slug,
}: {
  tournament: Tournament;
  slug: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stats */}
      <div className="surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Tournament Details
        </h3>
        <dl className="space-y-3">
          {[
            ["Type", tournament.type],
            ["Time Class", tournament.timeClass],
            ["Time Control", tournament.timeControl],
            ["Rules", tournament.rules],
            ["Rated", tournament.isRated ? "Yes" : "No"],
            ["Creator", tournament.creator],
            ["Total Rounds", tournament.totalRounds?.toString() ?? "—"],
            [
              "Registered Players",
              tournament.registeredPlayerCount?.toLocaleString() ?? "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
              <dd className="text-sm text-slate-300 text-right font-medium">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Quick navigation */}
      <div className="surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Quick Navigation
        </h3>
        <div className="space-y-2">
          {[
            { label: "View all rounds", href: "#rounds", tab: "rounds" as Tab },
            { label: "View all players", href: "#players", tab: "players" as Tab },
            { label: "Full standings", href: "#standings", tab: "standings" as Tab },
          ].map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => {
                /* handled via URL or parent state */
                window.scrollTo({ top: 0 });
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-amber-chess/30 text-slate-300 hover:text-slate-100 text-sm transition-all"
            >
              {label}
              <span className="text-slate-600 text-xs">→</span>
            </button>
          ))}

          <a
            href={`https://www.chess.com/tournament/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-amber-chess/30 text-slate-300 hover:text-slate-100 text-sm transition-all"
          >
            Open on Chess.com
            <span className="text-slate-600 text-xs">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
