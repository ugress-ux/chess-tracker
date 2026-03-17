import { SkeletonTournamentHero, SkeletonTable, SkeletonRoundGrid } from "@/components/ui/Skeleton";

export default function TournamentLoading() {
  return (
    <main className="chess-bg min-h-screen">
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-4 w-32" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="skeleton h-12 w-full rounded-lg" />
        <SkeletonTournamentHero />
        <SkeletonRoundGrid />
        <SkeletonTable rows={8} />
      </div>
    </main>
  );
}
