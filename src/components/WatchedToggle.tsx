"use client";

import { toggleWatched } from "@/lib/watched";

const pillBase =
  "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";
const pillIdle =
  "border-white/[0.16] bg-white/5 text-[#cfcdd4] hover:border-white/30 hover:bg-white/10";
const pillActive =
  "border-[var(--gold)]/45 bg-[var(--gold)]/15 text-[var(--gold)]";

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
      {watched ? "Watched ✓" : "Mark watched"}
    </button>
  );
}
