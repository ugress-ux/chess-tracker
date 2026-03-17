import Link from "next/link";
import { Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <main className="chess-bg min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-amber-chess/10 border border-amber-chess/20 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-amber-chess/50" />
        </div>
        <div>
          <h1 className="text-6xl font-display font-bold text-slate-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-300 mb-3">Page Not Found</h2>
          <p className="text-slate-500 text-sm">
            The page you&apos;re looking for doesn&apos;t exist. Check the tournament URL or go back home.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 btn-primary text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
