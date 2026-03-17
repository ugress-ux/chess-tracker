import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/ErrorState";

interface RoundsListProps {
  slug: string;
  roundUrls: string[];
  totalRounds: number | null;
  className?: string;
}

export function RoundsList({
  slug,
  roundUrls,
  totalRounds,
  className,
}: RoundsListProps) {
  // Derive round count from URLs or settings
  const count = roundUrls.length > 0 ? roundUrls.length : (totalRounds ?? 0);

  if (count === 0) {
    return (
      <EmptyState
        title="No rounds available"
        description="Round data has not been published yet or is not available for this tournament type."
        icon={Layers}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }, (_, i) => i + 1).map((roundNum) => (
          <RoundCard
            key={roundNum}
            slug={slug}
            roundNumber={roundNum}
            totalRounds={count}
          />
        ))}
      </div>
    </div>
  );
}

interface RoundCardProps {
  slug: string;
  roundNumber: number;
  totalRounds: number;
}

function RoundCard({ slug, roundNumber, totalRounds }: RoundCardProps) {
  return (
    <Link
      href={`/tournament/${slug}/round/${roundNumber}`}
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl",
        "bg-slate-900 border border-slate-800",
        "hover:border-amber-chess/30 hover:bg-slate-800/60",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-chess/10 flex items-center justify-center text-xs font-mono font-semibold text-amber-chess">
          {roundNumber}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200 group-hover:text-slate-100">
            Round {roundNumber}
          </div>
          <div className="text-xs text-slate-500">
            {roundNumber === totalRounds ? "Final" : `of ${totalRounds}`}
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-chess transition-colors" />
    </Link>
  );
}
