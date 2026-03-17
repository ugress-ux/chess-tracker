import { format, formatDistanceToNow } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─────────────────────────────────────────────
// Tailwind utility
// ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// Safe coercions
// ─────────────────────────────────────────────

export function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

export function safeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

// ─────────────────────────────────────────────
// Date/time
// ─────────────────────────────────────────────

export function parseUnixTimestamp(value: unknown): Date | null {
  const n = safeNumber(value);
  if (n === null) return null;
  const d = new Date(n * 1000);
  return isNaN(d.getTime()) ? null : d;
}

export function formatUnixTimestamp(
  value: unknown,
  formatStr = "PPP p"
): string {
  const d = parseUnixTimestamp(value);
  if (!d) return "—";
  try {
    return format(d, formatStr);
  } catch {
    return "—";
  }
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatDateShort(date: Date | null): string {
  if (!date) return "—";
  try {
    return format(date, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function formatDateTime(date: Date | null): string {
  if (!date) return "—";
  try {
    return format(date, "MMM d, yyyy HH:mm");
  } catch {
    return "—";
  }
}

// ─────────────────────────────────────────────
// String helpers
// ─────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function humanizeTimeClass(timeClass: string): string {
  const map: Record<string, string> = {
    bullet: "Bullet",
    blitz: "Blitz",
    rapid: "Rapid",
    daily: "Daily",
    classical: "Classical",
    arena: "Arena",
  };
  return map[timeClass?.toLowerCase()] ?? capitalize(timeClass ?? "Unknown");
}

export function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map(capitalize)
    .join(" ");
}

// ─────────────────────────────────────────────
// Points display
// ─────────────────────────────────────────────

export function formatPoints(points: number): string {
  if (points % 1 === 0) return points.toString();
  return points.toFixed(1);
}

// ─────────────────────────────────────────────
// URL helpers
// ─────────────────────────────────────────────

export function isValidUrl(str: string): boolean {
  try {
    new URL(str.startsWith("http") ? str : `https://${str}`);
    return true;
  } catch {
    return false;
  }
}
