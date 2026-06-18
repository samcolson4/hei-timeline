"use client";

import Link from "next/link";
import { useMemo } from "react";

import { displayTitle } from "@/lib/filters";
import {
  orderedItemsForNavigation,
  resolveEpisodeNeighbors,
} from "@/lib/episodeNav";
import type { TimelineItem } from "@/lib/types";

/** Prev/next always follow air-date order (older ← current → newer), independent of the timeline’s Newest/Oldest display sort. */
const NAV_ORDER = "oldest" as const;

const navBtn =
  "inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold)]/45 hover:bg-[var(--gold)]/10";
const navBtnDisabled =
  "pointer-events-none inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-[#56555c]";

type EpisodePrevNextProps = {
  currentId: number;
  items: TimelineItem[];
};

export function EpisodePrevNext({ currentId, items }: EpisodePrevNextProps) {
  const { prev, next } = useMemo(() => {
    const ordered = orderedItemsForNavigation(items, NAV_ORDER);
    return resolveEpisodeNeighbors(ordered, currentId);
  }, [items, currentId]);

  return (
    <nav
      className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-10 sm:flex-row sm:items-stretch sm:justify-between"
      aria-label="Previous and next episode"
    >
      <div className="flex justify-start">
        {prev ? (
          <Link href={`/episode/${prev.id}`} className={navBtn}>
            ← Previous
            <span className="sr-only">: {displayTitle(prev)}</span>
          </Link>
        ) : (
          <span className={navBtnDisabled}>← Previous</span>
        )}
      </div>
      <div className="flex justify-end">
        {next ? (
          <Link href={`/episode/${next.id}`} className={navBtn}>
            Next →
            <span className="sr-only">: {displayTitle(next)}</span>
          </Link>
        ) : (
          <span className={navBtnDisabled}>Next →</span>
        )}
      </div>
    </nav>
  );
}
