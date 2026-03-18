const RECENT_KEY = "chess_tracker_recent";
const MAX_RECENT = 8;

export interface RecentTournament {
  slug: string;
  name: string;
  visitedAt: number;
}

export function saveRecent(slug: string, name: string): void {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const existing: RecentTournament[] = raw ? JSON.parse(raw) : [];
    const updated = [
      { slug, name, visitedAt: Date.now() },
      ...existing.filter((r) => r.slug !== slug),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadRecent(): RecentTournament[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}
