"use client";

import { useState } from "react";
import { Search, ArrowUpRight, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildPlayerProfileUrl } from "@/lib/chesscom/parsers";
import { EmptyState } from "@/components/ui/ErrorState";
import type { TournamentPlayer } from "@/types";

interface PlayersListProps {
  players: TournamentPlayer[];
  className?: string;
}

export function PlayersList({ players, className }: PlayersListProps) {
  const [search, setSearch] = useState("");

  const filtered = players.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  if (players.length === 0) {
    return (
      <EmptyState
        title="No players listed"
        description="Player data is not available for this tournament."
        icon={UserX}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search */}
      {players.length > 10 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players…"
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      )}

      {/* Count */}
      <div className="text-xs text-slate-500">
        Showing {filtered.length} of {players.length} players
      </div>

      {/* Table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th className="text-right w-20">Pts</th>
                <th className="text-right w-14">W</th>
                <th className="text-right w-14">L</th>
                <th className="text-right w-14">D</th>
                <th className="w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr
                  key={player.username}
                  className={cn(player.isRemoved && "opacity-50")}
                >
                  <td>
                    <a
                      href={buildPlayerProfileUrl(player.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-slate-200 hover:text-amber-chess transition-colors"
                    >
                      <span className="font-medium">{player.username}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-chess/60" />
                    </a>
                  </td>
                  <td className="text-right font-mono tabular-nums text-slate-100 font-semibold">
                    {player.points}
                  </td>
                  <td className="text-right font-mono tabular-nums text-emerald-400 text-sm">
                    {player.wins}
                  </td>
                  <td className="text-right font-mono tabular-nums text-red-400 text-sm">
                    {player.losses}
                  </td>
                  <td className="text-right font-mono tabular-nums text-slate-400 text-sm">
                    {player.draws}
                  </td>
                  <td>
                    <StatusBadge
                      status={
                        player.isRemoved
                          ? "removed"
                          : player.isAdvancing
                          ? "advancing"
                          : player.status
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title="No players match your search"
          description={`No results for "${search}"`}
          icon={Search}
        />
      )}
    </div>
  );
}
