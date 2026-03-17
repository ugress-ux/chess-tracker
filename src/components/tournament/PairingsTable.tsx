import { ExternalLink, Minus, Crown } from "lucide-react";
import { cn, formatDateTime, humanizeTimeClass } from "@/lib/utils";
import { EmptyState } from "@/components/ui/ErrorState";
import type { TournamentGame, GameResult } from "@/types";

interface PairingsTableProps {
  games: TournamentGame[];
  className?: string;
}

const resultLabels: Record<GameResult, { label: string; color: string }> = {
  white: { label: "White wins", color: "text-slate-100" },
  black: { label: "Black wins", color: "text-slate-400" },
  draw: { label: "Draw", color: "text-amber-400" },
  in_progress: { label: "In progress", color: "text-emerald-400" },
  unknown: { label: "—", color: "text-slate-600" },
};

export function PairingsTable({ games, className }: PairingsTableProps) {
  if (games.length === 0) {
    return (
      <EmptyState
        title="No games available"
        description="Game data is not available for this group. Games may not have started yet, or the API has not published them."
        className={className}
      />
    );
  }

  return (
    <div className={cn("surface overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th>White</th>
              <th className="text-center w-24">Result</th>
              <th>Black</th>
              <th className="text-center w-20">Time</th>
              <th className="w-16 text-center">Link</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, i) => {
              const res = resultLabels[game.result];
              return (
                <tr key={i}>
                  <td className="text-slate-600 text-xs tabular-nums">{i + 1}</td>

                  {/* White player */}
                  <td>
                    <div className="flex items-center gap-1.5">
                      {game.result === "white" && (
                        <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                      <a
                        href={
                          game.white.profileUrl ??
                          `https://www.chess.com/member/${game.white.username}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "hover:text-amber-chess transition-colors font-medium",
                          game.result === "white"
                            ? "text-slate-100"
                            : "text-slate-300"
                        )}
                      >
                        {game.white.username}
                      </a>
                      {game.white.rating && (
                        <span className="text-xs text-slate-600 font-mono tabular-nums">
                          ({game.white.rating})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Result */}
                  <td className="text-center">
                    <ResultDisplay result={game.result} />
                  </td>

                  {/* Black player */}
                  <td>
                    <div className="flex items-center gap-1.5">
                      {game.result === "black" && (
                        <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                      <a
                        href={
                          game.black.profileUrl ??
                          `https://www.chess.com/member/${game.black.username}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "hover:text-amber-chess transition-colors font-medium",
                          game.result === "black"
                            ? "text-slate-100"
                            : "text-slate-300"
                        )}
                      >
                        {game.black.username}
                      </a>
                      {game.black.rating && (
                        <span className="text-xs text-slate-600 font-mono tabular-nums">
                          ({game.black.rating})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Time class */}
                  <td className="text-center">
                    <span className="text-xs text-slate-500 font-mono">
                      {game.timeControl !== "unknown" ? game.timeControl : humanizeTimeClass(game.timeClass)}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="text-center">
                    {game.url ? (
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-chess transition-colors text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultDisplay({ result }: { result: GameResult }) {
  if (result === "draw") {
    return (
      <div className="flex items-center justify-center gap-0.5">
        <span className="text-xs font-bold text-amber-400">½</span>
        <Minus className="w-2.5 h-2.5 text-slate-600" />
        <span className="text-xs font-bold text-amber-400">½</span>
      </div>
    );
  }
  if (result === "white") {
    return (
      <div className="flex items-center justify-center gap-0.5 text-xs font-bold">
        <span className="text-slate-100">1</span>
        <Minus className="w-2 h-2 text-slate-600" />
        <span className="text-slate-500">0</span>
      </div>
    );
  }
  if (result === "black") {
    return (
      <div className="flex items-center justify-center gap-0.5 text-xs font-bold">
        <span className="text-slate-500">0</span>
        <Minus className="w-2 h-2 text-slate-600" />
        <span className="text-slate-100">1</span>
      </div>
    );
  }
  if (result === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  return <span className="text-slate-600 text-xs">—</span>;
}
