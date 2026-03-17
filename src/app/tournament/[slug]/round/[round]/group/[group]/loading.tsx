import { SkeletonTable, Skeleton } from "@/components/ui/Skeleton";

export default function GroupLoading() {
  return (
    <main className="chess-bg min-h-screen">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-4 w-48" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="border-b border-slate-800 flex gap-4 pb-0">
          {[80, 72, 68, 72].map((w, i) => (
            <Skeleton key={i} className="h-10" style={{ width: w }} />
          ))}
        </div>
        <SkeletonTable rows={10} />
      </div>
    </main>
  );
}
