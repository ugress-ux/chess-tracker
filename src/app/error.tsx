"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-950 text-slate-100 font-sans">
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-200 mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-500">
                An unexpected error occurred. You can try again or return home.
              </p>
              {error.digest && (
                <p className="text-xs text-slate-700 font-mono mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-secondary text-sm">
                Try Again
              </button>
              <Link href="/" className="btn-primary text-sm">
                Go Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
