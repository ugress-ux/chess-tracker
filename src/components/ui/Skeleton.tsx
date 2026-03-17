import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton h-4 w-full", className)} aria-hidden="true" />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("surface p-5 space-y-3", className)}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-4 py-3 px-4 border-b border-slate-800">
        {[40, 120, 80, 80, 60].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-4 border-b border-slate-800/50">
          {[40, 120, 80, 80, 60].map((w, j) => (
            <Skeleton key={j} className="h-4" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonTournamentHero() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-96 max-w-full" />
      <div className="flex gap-3 flex-wrap">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-28" />
      </div>
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

export function SkeletonRoundGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="surface p-4 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
