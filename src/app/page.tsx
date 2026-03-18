"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Shield, Clock, Zap, Trophy, History, Star } from "lucide-react";
import { parseTournamentSlug } from "@/lib/chesscom/parsers";
import { cn } from "@/lib/utils";
import { saveRecent, loadRecent, clearRecent } from "@/lib/utils/recent";
import type { RecentTournament } from "@/lib/utils/recent";

const POPULAR_TOURNAMENTS = [
  { slug: "world-blitz-championship-2024", name: "World Blitz Championship 2024", type: "Blitz" },
  { slug: "world-rapid-championship-2024", name: "World Rapid Championship 2024", type: "Rapid" },
  { slug: "chess-com-global-championship-2024", name: "Global Championship 2024", type: "Blitz" },
  { slug: "titled-tuesday-early-2024-12-17", name: "Titled Tuesday", type: "Blitz" },
  { slug: "chess-com-us-championship-2024", name: "US Championship 2024", type: "Classical" },
  { slug: "speed-chess-championship-2024", name: "Speed Chess Championship 2024", type: "Bullet" },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<RecentTournament[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const slug = parseTournamentSlug(input.trim());
    if (!slug) {
      setError("Kunne ikke finne en gyldig turnerings-slug. Prøv å lime inn hele Chess.com-URL-en.");
      return;
    }
    router.push(`/tournament/${slug}`);
  }

  function handleOpen(slug: string) {
    router.push(`/tournament/${slug}`);
  }

  function handleClearRecent() {
    clearRecent();
    setRecent([]);
  }

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

      <div className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-10 animate-slide-up">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-chess" />
              Chess.com Public API · Nær sanntid
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-100 leading-tight">
              Tournament <span className="text-amber-chess">Tracker</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
              Utforsk stillinger, runder, grupper og parringer for enhver Chess.com-turnering.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                placeholder="Lim inn Chess.com turnerings-URL eller slug…"
                className={cn("input-field pl-12 pr-36 py-4 text-base", error && "border-red-500/50")}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
              >
                Åpne <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-sm text-red-400 px-1">⚠ {error}</p>}
            <p className="text-xs text-slate-600 px-1">
              Eksempel: <span className="font-mono text-slate-500">chess.com/tournament/world-blitz-championship-2024</span>
            </p>
          </form>

          {recent.length > 0 && (
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
                    onClick={() => handleOpen(t.slug)}
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

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <Star className="w-4 h-4" />
              Populære turneringer
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_TOURNAMENTS.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => handleOpen(t.slug)}
                  className="flex items-center justify-between px-4 py-3 surface rounded-xl hover:border-amber-chess/20 text-left group transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-amber-chess/10 border border-amber-chess/15 flex items-center justify-center shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-amber-chess/70" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-300 group-hover:text-slate-100 truncate">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-600">{t.type}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-chess shrink-0 ml-2 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Zap, label: "Stillinger" },
              { icon: Clock, label: "Runder & grupper" },
              { icon: Shield, label: "Alltid transparent" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 surface rounded-full text-xs text-slate-400">
                <Icon className="w-3.5 h-3.5 text-amber-chess" />
                {label}
              </div>
            ))}
          </div>

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
