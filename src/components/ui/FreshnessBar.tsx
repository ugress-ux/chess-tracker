"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Clock, AlertTriangle, Database } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { FreshnessInfo } from "@/types";

interface FreshnessBarProps {
  info: FreshnessInfo;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function FreshnessBar({
  info,
  onRefresh,
  isRefreshing = false,
  className,
}: FreshnessBarProps) {
  const [relative, setRelative] = useState<string>("");

  useEffect(() => {
    if (!info.fetchedAt) return;
    const update = () => setRelative(formatRelativeTime(info.fetchedAt));
    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  }, [info.fetchedAt]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-xs text-slate-500 py-2",
        className
      )}
    >
      {/* Last fetched */}
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3 shrink-0" />
        {info.fetchedAt ? (
          <span>
            Last fetched{" "}
            <span className="text-slate-400 font-medium">{relative}</span>
          </span>
        ) : (
          <span>Not yet fetched</span>
        )}
      </span>

      {/* Cache indicator */}
      {info.cached && (
        <span className="flex items-center gap-1 text-slate-600">
          <Database className="w-3 h-3" />
          Cached
        </span>
      )}

      {/* Source URL */}
      {info.sourceUrl && (
        <span className="flex items-center gap-1 truncate max-w-xs">
          <span className="text-slate-600">Source:</span>
          <a
            href={info.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-600 hover:text-slate-400 truncate transition-colors"
            title={info.sourceUrl}
          >
            {info.sourceUrl.replace("https://api.chess.com/pub", "")}
          </a>
        </span>
      )}

      {/* Delay warning */}
      <span className="flex items-center gap-1 text-amber-600/70">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Public API data may be delayed
      </span>

      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "ml-auto flex items-center gap-1.5 text-slate-400 hover:text-slate-200",
            "px-3 py-1 rounded-md border border-slate-800 hover:border-slate-700",
            "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
      )}
    </div>
  );
}
