"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { setChronologyAndPersist, useChronology } from "@/lib/chronology";
import { markAllWatched, useWatchedIds } from "@/lib/watched";
import { decodeHtmlEntities } from "@/lib/htmlEntities";
import { groupByYear } from "@/lib/timeline";
import type { TimelineItem } from "@/lib/types";
import {
  SHOW_TYPE_OPTIONS,
  collectSeasons,
  collectYears,
  effectiveSeasonNumber,
  firstItemKeyPerSeason,
  itemKey,
  matchesShowType,
  scrollToElementId,
  type ShowTypeFilterId,
} from "@/lib/filters";

import { NextUpSection } from "./NextUpSection";
import { TimelineItemRow } from "./TimelineItem";
import { YearHeader } from "./YearHeader";

type TimelineProps = {
  items: TimelineItem[];
};

function SodaCupFab() {
  return (
    <a
      href="https://buymeacoffee.com/samcolson4"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-[4.875rem] w-[4.875rem] items-center justify-center rounded-2xl border border-white/15 bg-[rgba(20,20,24,0.85)] p-1.5 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.85)] backdrop-blur-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
      aria-label="Buy me a coffee"
    >
      <Image
        src="/soda-cup.png"
        alt=""
        width={96}
        height={96}
        className="h-full w-full object-contain"
        sizes="78px"
      />
    </a>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const pillBase =
  "shrink-0 cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";
const pillIdle =
  "border-white/12 bg-white/5 text-[#e7e5ea] hover:border-white/25 hover:bg-white/10";
const pillActive =
  "border-transparent bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_5px_16px_-6px_var(--accent)]";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-[#8c8b92]";

export function Timeline({ items }: TimelineProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ShowTypeFilterId>("all");
  const [controlsOpen, setControlsOpen] = useState(true);
  const chronology = useChronology();
  const watchedIds = useWatchedIds();

  const filtered = useMemo(() => {
    const byType = items.filter((item) => matchesShowType(item, typeFilter));
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((item) => {
      const hay = [
        decodeHtmlEntities(item.title),
        item.season_name ?? "",
        item.category ?? "",
        item.slug,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, typeFilter]);

  const yearGroups = useMemo(
    () => groupByYear(filtered, chronology),
    [filtered, chronology],
  );

  const flatDisplayOrder = useMemo(
    () => yearGroups.flatMap((g) => g.items),
    [yearGroups],
  );

  const firstKeyForSeason = useMemo(
    () => firstItemKeyPerSeason(flatDisplayOrder),
    [flatDisplayOrder],
  );

  const years = useMemo(
    () => collectYears(filtered, chronology),
    [filtered, chronology],
  );
  const seasons = useMemo(
    () => collectSeasons(filtered, chronology),
    [filtered, chronology],
  );

  const hasUnknownYear = yearGroups.some((g) => g.year === 0);

  function jumpToYear(year: number) {
    const id = year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
    scrollToElementId(id);
  }

  function jumpToSeason(seasonNum: number) {
    scrollToElementId(`season-jump-${seasonNum}`);
  }

  // Build a short summary of non-default active filters
  const activeFilterParts: string[] = [];
  if (chronology === "newest") activeFilterParts.push("Newest first");
  if (typeFilter !== "all") {
    const opt = SHOW_TYPE_OPTIONS.find((o) => o.id === typeFilter);
    if (opt) activeFilterParts.push(opt.label);
  }
  if (query.trim()) activeFilterParts.push(`"${query.trim()}"`);
  const activeFilterSummary = activeFilterParts.join(" · ");

  return (
    <div className="w-full">
      <header className="mb-9 space-y-6 border-b border-white/10 pb-9">
        {/* Brand lockup */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <Image
              src="/popcorn.png"
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 shrink-0 drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)] sm:h-[72px] sm:w-[72px]"
              priority
            />
            <div className="min-w-0">
              <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.32em] text-[var(--accent)]">
                A Complete* On Cinema Timeline
              </p>
              <h1 className="text-balance text-4xl font-black leading-[0.92] tracking-tight text-[#f6f4ef] sm:text-5xl lg:text-6xl">
                Five Bags and Two Sodas
              </h1>
            </div>
          </div>

          {/* Marquee bulb strip */}
          <div
            className="h-2.5 rounded-full opacity-90"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--accent) 0 2.4px, transparent 3px)",
              backgroundSize: "22px 10px",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
        </div>

        <NextUpSection items={items} />

        {/* Collapsible controls */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setControlsOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20"
            aria-expanded={controlsOpen}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="text-sm font-bold text-[#f6f4ef]">
                Filters &amp; navigation
              </span>
              {!controlsOpen && activeFilterSummary ? (
                <span className="truncate text-xs text-[#8c8b92]">
                  {activeFilterSummary}
                </span>
              ) : null}
            </span>
            <ChevronIcon
              className={`h-5 w-5 shrink-0 text-[#8c8b92] transition-transform duration-200 ${controlsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {controlsOpen ? (
            <div className="space-y-5 border-t border-white/[0.08] px-4 py-4">
              <div className="space-y-2.5">
                <span className={labelClass}>Order</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Timeline sort order"
                >
                  {(
                    [
                      { id: "oldest" as const, label: "Oldest first" },
                      { id: "newest" as const, label: "Newest first" },
                    ] as const
                  ).map(({ id, label }) => {
                    const on = chronology === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`${pillBase} ${on ? pillActive : pillIdle}`}
                        aria-pressed={on}
                        onClick={() => setChronologyAndPersist(id)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className={labelClass}>Show type</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter by show type"
                >
                  {SHOW_TYPE_OPTIONS.map(({ id, label }) => {
                    const on = typeFilter === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`${pillBase} ${on ? pillActive : pillIdle}`}
                        aria-pressed={on}
                        onClick={() => setTypeFilter(id)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <nav className="space-y-2.5" aria-label="Jump to year">
                <span className={labelClass}>Jump to year</span>
                <div className="fbts-scroll flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      className={`${pillBase} ${pillIdle}`}
                      onClick={() => jumpToYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                  {hasUnknownYear ? (
                    <button
                      type="button"
                      className={`${pillBase} ${pillIdle}`}
                      onClick={() => jumpToYear(0)}
                    >
                      Unknown date
                    </button>
                  ) : null}
                </div>
              </nav>

              <nav className="space-y-2.5" aria-label="Jump to On Cinema season">
                <span className={labelClass}>Jump to season</span>
                {seasons.length === 0 ? (
                  <p className="text-sm text-[#8c8b92]">
                    No numbered seasons in the current results (try &ldquo;On
                    Cinema&rdquo; or clear filters).
                  </p>
                ) : (
                  <div className="fbts-scroll flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {seasons.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`${pillBase} ${pillIdle}`}
                        onClick={() => jumpToSeason(s)}
                      >
                        Season {s}
                      </button>
                    ))}
                  </div>
                )}
              </nav>

              <label className="block max-w-xl">
                <span className={`mb-2 ${labelClass}`}>Search</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, season, or category…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/14 bg-white/5 px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[#6f6e76] focus:border-[var(--gold)]/55 focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </label>

              <div className="space-y-2.5">
                <span className={labelClass}>Watched</span>
                <button
                  type="button"
                  className={`${pillBase} ${pillIdle}`}
                  onClick={() => markAllWatched(items.map((i) => i.id))}
                >
                  Mark all as watched
                </button>
              </div>
            </div>
          ) : null}
        </div>

      </header>

      {yearGroups.length === 0 ? (
        <p className="py-16 text-center text-[#8c8b92]">
          No matches for this combination of filters
          {query ? ` and "${query}"` : ""}.
        </p>
      ) : (
        <div className="space-y-1.5">
          {yearGroups.map(({ year, items: groupItems }) => {
            const headingId =
              year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
            return (
              <section key={year} aria-labelledby={headingId}>
                <YearHeader year={year} />
                <div className="flex flex-col gap-3 pb-2 pt-3.5">
                  {groupItems.map((item) => {
                    const sn = effectiveSeasonNumber(item);
                    const k = itemKey(item);
                    const scrollAnchorId =
                      sn != null && firstKeyForSeason.get(sn) === k
                        ? `season-jump-${sn}`
                        : undefined;
                    return (
                      <TimelineItemRow
                        key={k}
                        item={item}
                        watched={watchedIds.has(item.id)}
                        scrollAnchorId={scrollAnchorId}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <SodaCupFab />
    </div>
  );
}
