import { cn } from "@/lib/utils";
import type { TournamentStatus } from "@/types";

interface StatusBadgeProps {
  status: TournamentStatus | string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  registration: {
    label: "Registration",
    className: "badge-registration",
    dot: "bg-blue-400",
  },
  in_progress: {
    label: "In Progress",
    className: "badge-in-progress",
    dot: "bg-emerald-400",
  },
  finished: {
    label: "Finished",
    className: "badge-finished",
    dot: "bg-slate-500",
  },
  unknown: {
    label: "Unknown",
    className: "badge-unknown",
    dot: "bg-slate-600",
  },
  advancing: {
    label: "Advancing",
    className: "badge-in-progress",
    dot: "bg-emerald-400",
  },
  eliminated: {
    label: "Eliminated",
    className: "badge-finished",
    dot: "bg-slate-500",
  },
  removed: {
    label: "Removed",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
    dot: "bg-red-400",
  },
  active: {
    label: "Active",
    className: "badge-in-progress",
    dot: "bg-emerald-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status?.toLowerCase?.()] ?? statusConfig.unknown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

interface LiveBadgeProps {
  className?: string;
}

export function DelayedDataBadge({ className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        "bg-amber-500/10 text-amber-400 border border-amber-500/25",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Public API · May be delayed
    </span>
  );
}
