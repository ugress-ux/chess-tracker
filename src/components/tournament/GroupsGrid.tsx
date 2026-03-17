import Link from "next/link";
import { ChevronRight, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/ErrorState";

interface GroupsGridProps {
  slug: string;
  roundNumber: number;
  groupUrls: string[];
  className?: string;
}

export function GroupsGrid({ slug, roundNumber, groupUrls, className }: GroupsGridProps) {
  if (groupUrls.length === 0) {
    return (
      <EmptyState
        title="No groups available"
        description="Group data has not been published yet for this round."
        icon={Users2}
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", className)}>
      {groupUrls.map((_, i) => {
        const groupNum = i + 1;
        return (
          <Link
            key={groupNum}
            href={`/tournament/${slug}/round/${roundNumber}/group/${groupNum}`}
            className={cn(
              "group flex items-center justify-between p-4 rounded-xl",
              "bg-slate-900 border border-slate-800",
              "hover:border-amber-chess/30 hover:bg-slate-800/60",
              "transition-all duration-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-semibold text-slate-300 group-hover:border-amber-chess/30">
                G{groupNum}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200 group-hover:text-slate-100">
                  Group {groupNum}
                </div>
                <div className="text-xs text-slate-500">Round {roundNumber}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-chess transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}
