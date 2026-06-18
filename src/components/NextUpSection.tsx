"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { displayTitle, episodeBadgeParts } from "@/lib/filters";
import { formatDisplayDate } from "@/lib/timeline";
import type { TimelineItem } from "@/lib/types";
import { nextUnwatchedItem, useWatchedIds } from "@/lib/watched";

import { WatchedToggle } from "./WatchedToggle";

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 13.753a.75.75 0 001.06.053L16.5 5.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553L7.247 12.694a.75.75 0 00.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type NextUpSectionProps = {
  items: TimelineItem[];
};

export function NextUpSection({ items }: NextUpSectionProps) {
  const watchedIds = useWatchedIds();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const next = useMemo(
    () => (hydrated ? nextUnwatchedItem(items, watchedIds) : null),
    [items, watchedIds, hydrated],
  );

  if (!hydrated) return null;

  if (next == null && items.length > 0) {
    return (
      <section
        className="rounded-2xl border border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] p-6 sm:p-8"
        aria-label="Next up"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Next up
        </h2>
        <p className="mt-2 text-[color-mix(in_oklab,var(--foreground)_62%,transparent)]">
          You&rsquo;re caught up — every item in the timeline is marked watched.
        </p>
      </section>
    );
  }

  if (next == null) return null;

  const title = displayTitle(next);
  const badgeParts = episodeBadgeParts(next);
  const watched = watchedIds.has(next.id);

  return (
    <section
      className="rounded-xl border border-blue-600/20 bg-blue-600/5 p-4 dark:border-blue-400/20 dark:bg-blue-400/5 sm:p-5"
      aria-label="Next up"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        Up next
      </p>
      <div className="grid gap-4 sm:grid-cols-[5rem_1fr] sm:gap-5">
        <div className="relative mx-auto flex w-full max-w-[5rem] shrink-0 justify-center sm:mx-0">
          {next.poster_url ? (
            <Link
              href={`/episode/${next.id}`}
              className="block w-full overflow-hidden rounded-md bg-black/5 ring-1 ring-black/10 transition hover:ring-[color-mix(in_oklab,var(--foreground)_22%,transparent)] dark:bg-white/5 dark:ring-white/10"
            >
              <Image
                src={next.poster_url}
                alt=""
                width={80}
                height={120}
                className="aspect-[2/3] h-auto w-full object-cover"
                sizes="80px"
                unoptimized
              />
            </Link>
          ) : (
            <Link
              href={`/episode/${next.id}`}
              className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] text-xs text-[color-mix(in_oklab,var(--foreground)_45%,transparent)] transition"
            >
              No art
            </Link>
          )}
        </div>
        <div className="min-w-0 space-y-2.5 sm:justify-center sm:self-center">
          <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl">
            <Link
              href={`/episode/${next.id}`}
              className="text-[var(--foreground)] underline-offset-4 transition hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            >
              {title}
            </Link>
          </h3>
          {badgeParts.length > 0 ? (
            <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_58%,transparent)]">
              {badgeParts.join(" · ")}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <time
              dateTime={next.air_date}
              className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]"
            >
              {formatDisplayDate(next.air_date)}
            </time>
            <WatchedToggle itemId={next.id} watched={watched} />
          </div>
          <p className="text-sm">
            <a
              href={next.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              Watch on the HEI Network
              <ExternalIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
