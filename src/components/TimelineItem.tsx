"use client";

import Image from "next/image";
import Link from "next/link";

import { displayTitle, episodeBadgeParts } from "@/lib/filters";
import { formatDisplayDate } from "@/lib/timeline";
import type { TimelineItem } from "@/lib/types";

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

type CategoryAccent = {
  borderColor: string;
  chipClass: string;
  label: string;
};

function getCategoryAccent(category: string | null): CategoryAccent {
  switch (category) {
    case "on-cinema-at-the-cinema":
      return {
        borderColor: "#f59e0b",
        chipClass:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        label: "On Cinema",
      };
    case "oscar-specials":
      return {
        borderColor: "#f59e0b",
        chipClass:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        label: "Oscar Special",
      };
    case "decker":
      return {
        borderColor: "#818cf8",
        chipClass:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
        label: "Decker",
      };
    case "live":
      return {
        borderColor: "#f43f5e",
        chipClass:
          "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
        label: "Live",
      };
    case "more":
      return {
        borderColor: "#34d399",
        chipClass:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        label: "More",
      };
    default:
      return {
        borderColor: "color-mix(in oklab, var(--foreground) 20%, transparent)",
        chipClass:
          "bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)] text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]",
        label: category
          ? category
              .split("-")
              .filter(Boolean)
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")
          : "HEI Network",
      };
  }
}

type TimelineItemRowProps = {
  item: TimelineItem;
  watched: boolean;
  scrollAnchorId?: string;
};

export function TimelineItemRow({
  item,
  watched,
  scrollAnchorId,
}: TimelineItemRowProps) {
  const badgeParts = episodeBadgeParts(item);
  const title = displayTitle(item);
  const accent = getCategoryAccent(item.category);

  // Badge parts without the category label (shown separately as a chip)
  const metaParts = badgeParts.filter(
    (p) => p !== accent.label && p !== "On Cinema At The Cinema",
  );

  const article = (
    <article
      style={{ borderLeftColor: accent.borderColor }}
      className={`group relative grid gap-5 rounded-xl border border-l-[3px] border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_2%,transparent)] p-4 transition hover:border-[color-mix(in_oklab,var(--foreground)_16%,transparent)] hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] sm:grid-cols-[10rem_1fr] sm:gap-6 sm:p-5 ${watched ? "opacity-55" : ""}`}
    >
      <div className="relative mx-auto flex w-full max-w-[10rem] shrink-0 justify-center sm:mx-0">
        {item.poster_url ? (
          <Link
            href={`/episode/${item.id}`}
            className="block w-full overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/10 transition duration-200 group-hover:ring-[color-mix(in_oklab,var(--foreground)_22%,transparent)] dark:bg-white/5 dark:ring-white/10"
          >
            <Image
              src={item.poster_url}
              alt=""
              width={160}
              height={240}
              className="aspect-[2/3] h-auto w-full object-cover"
              sizes="160px"
              unoptimized
            />
          </Link>
        ) : (
          <Link
            href={`/episode/${item.id}`}
            className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] text-xs text-[color-mix(in_oklab,var(--foreground)_45%,transparent)] transition group-hover:bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]"
          >
            No art
          </Link>
        )}
      </div>
      <div className="min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${accent.chipClass}`}
          >
            {accent.label}
          </span>
          {item.is_live ? (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
              LIVE
            </span>
          ) : null}
        </div>
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl">
          <Link
            href={`/episode/${item.id}`}
            className="text-[var(--foreground)] underline-offset-4 transition hover:text-blue-600 hover:underline dark:hover:text-blue-400"
          >
            {title}
          </Link>
        </h3>
        {metaParts.length > 0 ? (
          <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_58%,transparent)]">
            {metaParts.join(" · ")}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <time
            dateTime={item.air_date}
            className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]"
          >
            {formatDisplayDate(item.air_date)}
          </time>
          <WatchedToggle itemId={item.id} watched={watched} />
        </div>
        <p className="text-sm">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            Watch on the HEI Network
            <ExternalIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
          </a>
        </p>
      </div>
    </article>
  );

  if (scrollAnchorId) {
    return (
      <div id={scrollAnchorId} className="scroll-mt-32 md:scroll-mt-40">
        {article}
      </div>
    );
  }

  return article;
}
