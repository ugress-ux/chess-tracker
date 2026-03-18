"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Trophy, History, Star, ChevronRight,
  Loader2, UserSearch, AlertCircle, Zap, Clock, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { humanizeTimeClass } from "@/lib/utils";
import { saveRecent, loadRecent, clearRecent } from "@/lib/utils/recent";
import type { RecentTournament } from "@/lib/utils/recent";
import { useEffect } from "react";

interface PlayerTournament {
  url: string;
  slug: string;
  name: string;
  status: string;
  timeClass: string;
  placement: number | null;
  totalPlayers: number | null;
  wins: number;
  losses: number;
  draws: number;
}

interface PlayerTournaments {
  username: string;
  inProgress: PlayerTournament[];
  registered: PlayerTournament[];
  finished: PlayerTournament[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  in_progress: { label: "Live", color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
  registered: { label: "Upcoming", color: "text-blue-400", dot: "bg-blue-400" },
  finished: { label: "Finished", color: "text-slate-500", dot: "bg-slate-600" },
};

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<PlayerTournaments | null>(null);
  const [recent, setRecent] = useState<RecentTournament[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u) return;
    setError("");
    setResults(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/chesscom/player/${encodeURIComponent(u)}/tournaments`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResults(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function openTournament(slug: string, name: string) {
    saveRecent(slug, name);
    router.push(`/tournament/${slug}`);
  }

  function handleClearRecent() {
    clearRecent();
    setRecent([]);
  }

  const hasResults = results && (
    results.inProgress.length + results.registered.length + results.finished.length > 0
  );

  return (
    <main className="chess-bg min-h-screen flex flex-col">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-chess/10 border border-amber-chess/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-chess" />
          </div>
          <span className="font-display font-semibold text-slate-200 text-lg tracking-tight">
            Chess<span className="text-amber-chess">Track</span>
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">

          {/* Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-chess" />
              Chess.com Public API · Nær sanntid
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-100 leading-tight">
              Tournament <span className="text-amber-chess">Tracker</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Skriv inn et Chess.com-brukernavn for å se deres turneringer.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); setResults(null); }}
                placeholder="Chess.com brukernavn, f.eks. hikaru"
                className={cn("input-field pl-12 pr-36 py-4 text-base", error && "border-red-500/50")}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              <button
                type="submit"
                disabled={!username.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Søker…" : "Søk"}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-2 px-1">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}
          </form>

          {/* Results */}
          {results && !hasResults && (
            <div className="surface p-8 text-center text-slate-500 text-sm">
              Ingen turneringer funnet for <span className="text-slate-300 font-medium">{results.username}</span>.
            </div>
          )}

          {results && hasResults && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-sm text-slate-400">
                Turneringer for{" "}
                <a
                  href={`https://www.chess.com/member/${results.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-chess hover:text-amber-light font-medium"
                >
                  {results.username}
                </a>
              </div>

              {results.inProgress.length > 0 && (
                <TournamentSection
                  title="Pågående"
                  tournaments={results.inProgress}
                  onOpen={openTournament}
                />
              )}
              {results.registered.length > 0 && (
                <TournamentSection
                  title="Påmeldt / Kommende"
                  tournaments={results.registered}
                  onOpen={openTournament}
                />
              )}
              {results.finished.length > 0 && (
                <TournamentSection
                  title="Avsluttede (siste 20)"
                  tournaments={results.finished}
                  onOpen={openTournament}
                />
              )}
            </div>
          )}

          {/* Recently visited */}
          {!results && recent.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <History className="w-4 h-4" />
                  Nylig besøkt
                </div>
                <button onClick={handleClearRecent} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  Tøm historikk
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recent.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => openTournament(t.slug, t.name || t.slug)}
                    className="flex items-center justify-between px-4 py-3 surface rounded-xl hover:border-amber-chess/20 text-left group transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <History className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-300 group-hover:text-slate-100 truncate">
                          {t.name || t.slug}
                        </div>
                        <div className="text-xs text-slate-600 font-mono truncate">{t.slug}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-chess shrink-0 ml-2 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feature pills */}
          {!results && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {[
                { icon: Zap, label: "Stillinger" },
                { icon: Clock, label: "Runder & grupper" },
                { icon: Users, label: "Spillerprofiler" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 surface rounded-full text-xs text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-amber-chess" />
                  {label}
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-slate-600 leading-relaxed">
            Bruker{" "}
            <a href="https://www.chess.com/news/view/published-data-api" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 underline underline-offset-2">
              Chess.com public API
            </a>
            . Data kan være forsinket. Ikke tilknyttet Chess.com.
          </p>
        </div>
      </div>
    </main>
  );
}

function TournamentSection({
  title,
  tournaments,
  onOpen,
}: {
  title: string;
  tournaments: PlayerTournament[];
  onOpen: (slug: string, name: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
        {title} ({tournaments.length})
      </h2>
      <div className="space-y-1.5">
        {tournaments.map((t) => {
          const st = STATUS_LABELS[t.status] ?? STATUS_LABELS.finished;
          return (
            <button
              key={t.slug}
              onClick={() => onOpen(t.slug, t.name)}
              className="w-full flex items-center justify-between px-4 py-3 surface rounded-xl hover:border-amber-chess/20 text-left group transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-chess transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-200 group-hover:text-slate-100 truncate">
                    {t.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={cn("flex items-center gap-1 text-xs", st.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                      {st.label}
                    </span>
                    {t.timeClass !== "unknown" && (
                      <span className="text-xs text-slate-600">{humanizeTimeClass(t.timeClass)}</span>
                    )}
                    {t.placement && t.totalPlayers && (
                      <span className="text-xs text-slate-600">
                        #{t.placement} av {t.totalPlayers}
                      </span>
                    )}
                    {t.status === "finished" && (t.wins + t.losses + t.draws > 0) && (
                      <span className="text-xs text-slate-600">
                        <span className="text-emerald-500">{t.wins}W</span>{" "}
                        <span className="text-red-500">{t.losses}L</span>{" "}
                        <span className="text-slate-500">{t.draws}D</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-chess shrink-0 ml-3 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
