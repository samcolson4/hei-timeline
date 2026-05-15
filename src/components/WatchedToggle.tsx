"use client";

import { toggleWatched } from "@/lib/watched";

const pillBase =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 dark:focus-visible:ring-blue-400/40";
const pillIdle =
  "border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] hover:border-blue-600/35 hover:bg-blue-600/10 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/10";
const pillActive =
  "border-blue-600/60 bg-blue-600/15 text-blue-700 dark:border-blue-400/50 dark:bg-blue-400/15 dark:text-blue-200";

type WatchedToggleProps = {
  itemId: number;
  watched: boolean;
  className?: string;
};

export function WatchedToggle({ itemId, watched, className }: WatchedToggleProps) {
  return (
    <button
      type="button"
      className={`${pillBase} ${watched ? pillActive : pillIdle} ${className ?? ""}`}
      aria-pressed={watched}
      aria-label={watched ? "Mark unwatched" : "Mark watched"}
      onClick={() => toggleWatched(itemId)}
    >
      {watched ? "Watched" : "Mark watched"}
    </button>
  );
}
