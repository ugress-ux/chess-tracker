import { AlertCircle, Search, Wifi, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types";

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
}

const errorConfig = {
  not_found: {
    icon: Search,
    title: "Tournament Not Found",
    color: "text-slate-400",
    bgColor: "bg-slate-800/40",
  },
  rate_limited: {
    icon: Clock,
    title: "Rate Limited",
    color: "text-amber-400",
    bgColor: "bg-amber-900/20",
  },
  network: {
    icon: Wifi,
    title: "Connection Error",
    color: "text-red-400",
    bgColor: "bg-red-900/20",
  },
  parse: {
    icon: AlertCircle,
    title: "Data Error",
    color: "text-orange-400",
    bgColor: "bg-orange-900/20",
  },
  invalid_input: {
    icon: AlertCircle,
    title: "Invalid Input",
    color: "text-red-400",
    bgColor: "bg-red-900/20",
  },
  unknown: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    color: "text-red-400",
    bgColor: "bg-red-900/20",
  },
};

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const config = errorConfig[error.type] ?? errorConfig.unknown;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        "surface rounded-xl",
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mb-4",
          config.bgColor
        )}
      >
        <Icon className={cn("w-7 h-7", config.color)} />
      </div>

      <h3 className={cn("text-lg font-semibold mb-2", config.color)}>
        {config.title}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mb-1">{error.message}</p>

      {error.type === "rate_limited" && error.retryAfter && (
        <p className="text-xs text-slate-500 mb-4">
          Retry after {error.retryAfter} seconds
        </p>
      )}

      {error.type === "not_found" && (
        <p className="text-xs text-slate-500 mb-4">
          Double-check the tournament URL or slug and try again.
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary flex items-center gap-2 mt-4"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Search,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-medium text-slate-400 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface DisclaimerBannerProps {
  className?: string;
}

export function DisclaimerBanner({ className }: DisclaimerBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg",
        "bg-amber-950/30 border border-amber-800/30 text-amber-200/70",
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500/70" />
      <p className="text-xs leading-relaxed">
        <span className="font-semibold text-amber-400/80">Note:</span> This app
        uses Chess.com public API data. Updates may be delayed and are{" "}
        <strong>not</strong> guaranteed to be real-time. This is a tracking
        tool, not a live broadcast system.
      </p>
    </div>
  );
}
