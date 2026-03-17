"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Shield, Clock, Zap, Trophy } from "lucide-react";
import { parseTournamentSlug } from "@/lib/chesscom/parsers";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "world-blitz-championship-2024",
  "chess-com-us-championship",
  "global-championship-2024",
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const slug = parseTournamentSlug(input.trim());
    if (!slug) {
      setError(
        "Could not parse a valid tournament slug. Try pasting the full Chess.com tournament URL."
      );
      return;
    }
    router.push(`/tournament/${slug}`);
  }

  return (
    <main className="chess-bg min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl space-y-12 animate-slide-up">
          {/* Title block */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 text-xs text-slate-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-chess" />
              Chess.com Public API · Near-live data
            </div>
            <h1 className="text-5xl font-display font-bold text-slate-100 leading-tight">
              Tournament{" "}
              <span className="text-amber-chess">Tracker</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
              Explore standings, rounds, groups, and pairings for any Chess.com
              tournament. Paste a URL or slug below to get started.
            </p>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                placeholder="Paste Chess.com tournament URL or slug…"
                className={cn(
                  "input-field pl-12 pr-36 py-4 text-base",
                  error && "border-red-500/50 focus:ring-red-500/30"
                )}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
              >
                Load
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-2 px-1">
                <span className="shrink-0">⚠</span> {error}
              </p>
            )}

            <p className="text-xs text-slate-600 px-1">
              Example:{" "}
              <button
                type="button"
                onClick={() => setInput(EXAMPLES[0])}
                className="text-slate-500 hover:text-slate-300 font-mono underline-offset-2 hover:underline transition-colors"
              >
                {EXAMPLES[0]}
              </button>{" "}
              · or paste a full URL like{" "}
              <span className="font-mono text-slate-600">
                chess.com/tournament/…
              </span>
            </p>
          </form>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: Zap,
                title: "Standings",
                desc: "Live-ish leaderboards from public API data",
              },
              {
                icon: Clock,
                title: "Rounds & Groups",
                desc: "Navigate rounds, groups, and pairings",
              },
              {
                icon: Shield,
                title: "Transparent",
                desc: "Clear data freshness indicators always shown",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="surface p-4 space-y-2 text-center"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-chess/10 flex items-center justify-center mx-auto">
                  <Icon className="w-4 h-4 text-amber-chess" />
                </div>
                <div className="text-sm font-medium text-slate-300">{title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              This tool uses the{" "}
              <a
                href="https://www.chess.com/news/view/published-data-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 underline underline-offset-2"
              >
                Chess.com public API
              </a>
              . Data may be delayed and is not guaranteed to be real-time. This
              is not affiliated with or endorsed by Chess.com.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
