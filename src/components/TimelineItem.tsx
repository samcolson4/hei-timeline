"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

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

type CategoryAccent = { color: string; label: string };

/** Muted, sophisticated palette — color lives in the chip dot + poster frame. */
function getCategoryAccent(category: string | null): CategoryAccent {
  switch (category) {
    case "on-cinema-at-the-cinema":
      return { color: "#e0a33e", label: "On Cinema" };
    case "oscar-specials":
      return { color: "#e0a33e", label: "Oscar Special" };
    case "decker":
      return { color: "#9a86c4", label: "Decker" };
    case "live":
      return { color: "#e5564e", label: "Live" };
    case "more":
      return { color: "#57b89b", label: "More" };
    default:
      return {
        color: "#8b93a3",
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
      style={
        {
          "--cat": accent.color,
          background: watched ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.028)",
        } as CSSProperties
      }
      className={`group flex gap-4 rounded-2xl border border-white/10 p-4 transition hover:border-white/[0.18] sm:gap-5 sm:p-5 ${watched ? "opacity-60" : ""}`}
    >
      <Link
        href={`/episode/${item.id}`}
        className="relative block w-[108px] shrink-0 self-start overflow-hidden rounded-xl bg-black sm:w-[120px]"
        style={{
          boxShadow:
            "0 0 0 1.5px color-mix(in oklab, var(--cat) 42%, transparent), 0 8px 22px -14px rgba(0,0,0,0.8)",
        }}
      >
        {item.poster_url ? (
          <Image
            src={item.poster_url}
            alt=""
            width={160}
            height={240}
            className="aspect-[2/3] h-auto w-full object-cover"
            sizes="120px"
            unoptimized
          />
        ) : (
          <span className="flex aspect-[2/3] w-full items-center justify-center text-xs text-[#6b6a72]">
            No art
          </span>
        )}
        {watched ? (
          <span className="absolute -left-7 top-[7px] -rotate-45 bg-[var(--gold)] px-8 py-0.5 text-[9px] font-black tracking-[0.08em] text-[#1a1404] shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            SEEN
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold"
            style={{
              background: "color-mix(in oklab, var(--cat) 13%, #15151a)",
              border: "1px solid color-mix(in oklab, var(--cat) 30%, transparent)",
              color: "color-mix(in oklab, var(--cat) 50%, #ffffff)",
            }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--cat)" }}
            />
            {accent.label}
          </span>
          {item.is_live ? (
            <span className="inline-flex items-center rounded-full bg-[#ff3b4e] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
              ● LIVE
            </span>
          ) : null}
        </div>
        <h3 className="text-balance text-xl font-bold leading-snug tracking-tight sm:text-[22px]">
          <Link
            href={`/episode/${item.id}`}
            className="text-[#f3f1ec] underline-offset-4 transition hover:text-[var(--gold)] hover:underline"
          >
            {title}
          </Link>
        </h3>
        {metaParts.length > 0 ? (
          <p className="text-sm text-[#a7a6ad]">{metaParts.join(" · ")}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <time dateTime={item.air_date} className="text-sm text-[#8c8b92]">
            {formatDisplayDate(item.air_date)}
          </time>
          <WatchedToggle itemId={item.id} watched={watched} />
        </div>
        <p className="text-sm">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[var(--gold)] underline-offset-4 hover:underline"
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
