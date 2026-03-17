import { SkeletonRoundGrid, SkeletonTable, Skeleton } from "@/components/ui/Skeleton";

export default function RoundLoading() {
  return (
    <main className="chess-bg min-h-screen">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-4 w-40" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <SkeletonRoundGrid />
        <SkeletonTable rows={6} />
      </div>
    </main>
  );
}
