"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Code2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RawJsonPanelProps {
  data: unknown;
  sourceUrl?: string;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function RawJsonPanel({
  data,
  sourceUrl,
  title = "Raw JSON",
  defaultOpen = false,
  className,
}: RawJsonPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(data, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className={cn("surface overflow-hidden", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Code2 className="w-4 h-4" />
          <span className="font-medium">{title}</span>
          <span className="text-xs text-slate-600 font-mono">
            {Array.isArray(data)
              ? `[${(data as unknown[]).length} items]`
              : typeof data === "object" && data !== null
              ? `{${Object.keys(data as object).length} keys}`
              : ""}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50">
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors truncate max-w-xs"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {sourceUrl}
              </a>
            )}
            <button
              onClick={handleCopy}
              className={cn(
                "ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all",
                copied
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              )}
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <div className="overflow-auto max-h-96">
            <pre className="px-4 py-4 text-xs font-mono text-slate-400 leading-relaxed whitespace-pre-wrap break-all">
              {json}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
