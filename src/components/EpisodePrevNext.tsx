"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useChronology } from "@/lib/chronology";
import { displayTitle } from "@/lib/filters";
import {
  orderedItemsForNavigation,
  resolveEpisodeNeighbors,
} from "@/lib/episodeNav";
import type { TimelineItem } from "@/lib/types";

const navBtn =
  "inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-lg border border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-blue-600/40 hover:bg-blue-600/10 dark:hover:border-blue-400/35 dark:hover:bg-blue-400/10";
const navBtnDisabled =
  "pointer-events-none inline-flex min-h-11 min-w-[8rem] items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_35%,transparent)]";

type EpisodePrevNextProps = {
  currentId: number;
  items: TimelineItem[];
};

export function EpisodePrevNext({ currentId, items }: EpisodePrevNextProps) {
  const chronology = useChronology();
  const { prev, next } = useMemo(() => {
    const ordered = orderedItemsForNavigation(items, chronology);
    return resolveEpisodeNeighbors(ordered, currentId);
  }, [items, chronology, currentId]);

  return (
    <nav
      className="mt-10 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] pt-10 sm:flex-row sm:items-stretch sm:justify-between"
      aria-label="Previous and next episode"
    >
      <div className="flex justify-start">
        {prev ? (
          <Link href={`/episode/${prev.id}`} className={navBtn}>
            ← Previous
            <span className="sr-only">
              : {displayTitle(prev)}
            </span>
          </Link>
        ) : (
          <span className={navBtnDisabled}>← Previous</span>
        )}
      </div>
      <div className="flex justify-end">
        {next ? (
          <Link href={`/episode/${next.id}`} className={navBtn}>
            Next →
            <span className="sr-only">
              : {displayTitle(next)}
            </span>
          </Link>
        ) : (
          <span className={navBtnDisabled}>Next →</span>
        )}
      </div>
    </nav>
  );
}
