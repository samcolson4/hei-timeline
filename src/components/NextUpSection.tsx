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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8"
        aria-label="Next up"
      >
        <h2 className="text-lg font-extrabold text-[#f6f4ef]">You&rsquo;re caught up</h2>
        <p className="mt-2 text-[#9b9aa1]">
          Every item in the timeline is marked watched. Five bags and two sodas.
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
      className="relative overflow-hidden rounded-[18px] border p-5 shadow-[0_22px_50px_-30px_rgba(0,0,0,0.85)] sm:p-6"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in oklab, var(--gold) 9%, #151417), #121214 58%)",
        borderColor: "color-mix(in oklab, var(--gold) 26%, transparent)",
      }}
      aria-label="Next up"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "var(--gold)" }}
        aria-hidden
      />
      <p className="mb-3.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--gold)]">
        ★ Up Next
      </p>
      <div className="grid gap-4 sm:grid-cols-[5.75rem_1fr] sm:gap-5">
        <Link
          href={`/episode/${next.id}`}
          className="block w-[92px] shrink-0 overflow-hidden rounded-[10px] bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_14px_30px_-14px_rgba(0,0,0,0.8)]"
        >
          {next.poster_url ? (
            <Image
              src={next.poster_url}
              alt=""
              width={92}
              height={138}
              className="aspect-[2/3] h-auto w-full object-cover"
              sizes="92px"
              unoptimized
            />
          ) : (
            <span className="flex aspect-[2/3] w-full items-center justify-center text-xs text-[#6b6a72]">
              No art
            </span>
          )}
        </Link>
        <div className="min-w-0 space-y-2.5 sm:self-center">
          <h3 className="text-balance text-xl font-extrabold leading-[1.08] tracking-tight text-[#f6f4ef] sm:text-[27px]">
            <Link
              href={`/episode/${next.id}`}
              className="text-inherit no-underline transition hover:text-[var(--gold)]"
            >
              {title}
            </Link>
          </h3>
          {badgeParts.length > 0 ? (
            <p className="text-sm text-[#a7a6ad]">{badgeParts.join(" · ")}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <time dateTime={next.air_date} className="text-sm text-[#9b9aa1]">
              {formatDisplayDate(next.air_date)}
            </time>
            <WatchedToggle itemId={next.id} watched={watched} />
          </div>
          <p className="pt-1 text-sm">
            <a
              href={next.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[var(--gold)] underline-offset-4 hover:underline"
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
