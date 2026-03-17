import Link from "next/link";
import { Medal, ArrowUpRight } from "lucide-react";
import { cn, formatPoints } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/ErrorState";
import { buildPlayerProfileUrl } from "@/lib/chesscom/parsers";
import type { StandingRow } from "@/types";

interface StandingsTableProps {
  standings: StandingRow[];
  showWLD?: boolean; // wins/losses/draws columns
  className?: string;
}

const rankMedal: Record<number, { color: string; symbol: string }> = {
  1: { color: "text-amber-400", symbol: "♔" },
  2: { color: "text-slate-300", symbol: "♕" },
  3: { color: "text-amber-700", symbol: "♗" },
};

export function StandingsTable({
  standings,
  showWLD = false,
  className,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <EmptyState
        title="No standings yet"
        description="Standings will appear once the tournament or group has players."
        icon={Medal}
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
              <th className="w-12 text-center">#</th>
              <th>Player</th>
              <th className="text-right w-20">Pts</th>
              {showWLD && (
                <>
                  <th className="text-right w-14">W</th>
                  <th className="text-right w-14">L</th>
                  <th className="text-right w-14">D</th>
                </>
              )}
              <th className="text-right w-20">TB</th>
              <th className="w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.username} className={cn(row.isRemoved && "opacity-50")}>
                {/* Rank */}
                <td className="text-center">
                  {rankMedal[row.rank] ? (
                    <span
                      className={cn(
                        "font-bold text-base",
                        rankMedal[row.rank].color
                      )}
                    >
                      {rankMedal[row.rank].symbol}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm tabular-nums">
                      {row.rank}
                    </span>
                  )}
                </td>

                {/* Username */}
                <td>
                  <a
                    href={buildPlayerProfileUrl(row.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1.5 text-slate-200 hover:text-amber-chess transition-colors"
                  >
                    <span className="font-medium">{row.username}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-chess/60 shrink-0" />
                  </a>
                </td>

                {/* Points */}
                <td className="text-right">
                  <span className="font-mono font-semibold text-slate-100 tabular-nums">
                    {formatPoints(row.points)}
                  </span>
                </td>

                {/* W/L/D */}
                {showWLD && (
                  <>
                    <td className="text-right">
                      <span className="text-emerald-400 tabular-nums font-mono text-sm">
                        {row.wins}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-red-400 tabular-nums font-mono text-sm">
                        {row.losses}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-slate-400 tabular-nums font-mono text-sm">
                        {row.draws}
                      </span>
                    </td>
                  </>
                )}

                {/* Tie-break */}
                <td className="text-right">
                  <span className="text-slate-500 text-xs tabular-nums font-mono">
                    {row.tieBreak > 0 ? formatPoints(row.tieBreak) : "—"}
                  </span>
                </td>

                {/* Status */}
                <td>
                  {row.status && row.status !== "active" ? (
                    <StatusBadge status={row.status} />
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
