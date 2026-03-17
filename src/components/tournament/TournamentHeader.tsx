import {
  Trophy,
  ExternalLink,
  Calendar,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { cn, formatDateShort, humanizeTimeClass, humanizeStatus } from "@/lib/utils";
import { StatusBadge, DelayedDataBadge } from "@/components/ui/StatusBadge";
import type { Tournament } from "@/types";

interface TournamentHeaderProps {
  tournament: Tournament;
  className?: string;
}

export function TournamentHeader({ tournament, className }: TournamentHeaderProps) {
  return (
    <div className={cn("space-y-4 animate-slide-up", className)}>
      {/* Title */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-chess/10 border border-amber-chess/20 flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-chess" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-slate-100 leading-tight">
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                {tournament.description}
              </p>
            )}
          </div>
        </div>

        <a
          href={`https://www.chess.com/tournament/${tournament.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          View on Chess.com
        </a>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={tournament.status} />
        <DelayedDataBadge />

        {tournament.timeClass && tournament.timeClass !== "unknown" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <Zap className="w-3 h-3" />
            {humanizeTimeClass(tournament.timeClass)}
          </span>
        )}

        {tournament.isRated && (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Rated
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
        {tournament.startTime && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {formatDateShort(tournament.startTime)}
          </span>
        )}

        {tournament.registeredPlayerCount !== null && (
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            {tournament.registeredPlayerCount.toLocaleString()} players
          </span>
        )}

        {tournament.totalRounds !== null && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {tournament.totalRounds} rounds
          </span>
        )}

        {tournament.creator && (
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">by</span>
            <a
              href={`https://www.chess.com/member/${tournament.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-amber-chess transition-colors"
            >
              {tournament.creator}
            </a>
          </span>
        )}

        {tournament.timeControl && tournament.timeControl !== "unknown" && (
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">Time control:</span>
            <span className="font-mono text-xs text-slate-300">
              {tournament.timeControl}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
