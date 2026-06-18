"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { setChronologyAndPersist, useChronology } from "@/lib/chronology";
import { useWatchedIds } from "@/lib/watched";
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
      className="fixed bottom-5 right-5 z-50 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-2xl border border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--background)_88%,var(--foreground)_8%)] p-1.5 shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur-md transition hover:scale-105 hover:shadow-[0_14px_44px_-12px_color-mix(in_oklab,var(--foreground)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/45 dark:focus-visible:ring-blue-400/45"
      aria-label="Buy me a coffee"
    >
      <Image
        src="/soda-cup.png"
        alt=""
        width={96}
        height={96}
        className="h-full w-full object-contain"
        sizes="84px"
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
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 dark:focus-visible:ring-blue-400/40";
const pillIdle =
  "border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] hover:border-blue-600/35 hover:bg-blue-600/10 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/10";
const pillActive =
  "border-blue-600/60 bg-blue-600/15 text-blue-700 dark:border-blue-400/50 dark:bg-blue-400/15 dark:text-blue-200";

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
    const id =
      year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
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
      <header className="mb-10 space-y-6 border-b border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Image
              src="/popcorn.png"
              alt=""
              width={64}
              height={64}
              className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
              priority
            />
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Five Bags and Two Sodas
            </h1>
          </div>
          <p className="text-lg font-medium text-[color-mix(in_oklab,var(--foreground)_55%,transparent)] italic">
            A Complete* On Cinema Timeline
          </p>
        </div>

        <NextUpSection items={items} />

        {/* Collapsible controls */}
        <div className="rounded-xl border border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_2%,transparent)]">
          <button
            type="button"
            onClick={() => setControlsOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600/40 dark:focus-visible:ring-blue-400/40"
            aria-expanded={controlsOpen}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Filters &amp; navigation
              </span>
              {!controlsOpen && activeFilterSummary ? (
                <span className="truncate text-xs text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  {activeFilterSummary}
                </span>
              ) : null}
            </span>
            <ChevronIcon
              className={`h-5 w-5 shrink-0 text-[color-mix(in_oklab,var(--foreground)_50%,transparent)] transition-transform duration-200 ${controlsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {controlsOpen ? (
            <div className="space-y-5 border-t border-[color-mix(in_oklab,var(--foreground)_8%,transparent)] px-4 py-4">
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  Order
                </span>
                <div
                  className="-mx-1 flex flex-wrap gap-2 px-1"
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

              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  Show type
                </span>
                <div
                  className="-mx-1 flex flex-wrap gap-2 px-1"
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

              <nav className="space-y-2" aria-label="Jump to year">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  Jump to year
                </span>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

              <nav className="space-y-2" aria-label="Jump to On Cinema season">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  Jump to season
                </span>
                {seasons.length === 0 ? (
                  <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_48%,transparent)]">
                    No numbered seasons in the current results (try &ldquo;On
                    Cinema&rdquo; or clear filters).
                  </p>
                ) : (
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
                  Search
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, season, or category…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] px-4 py-3 text-base text-[var(--foreground)] outline-none ring-blue-600/0 transition placeholder:text-[color-mix(in_oklab,var(--foreground)_40%,transparent)] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/15 dark:focus:border-blue-400/40 dark:focus:ring-blue-400/15"
                />
              </label>
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{items.length}</strong> items
        </p>
      </header>

      {yearGroups.length === 0 ? (
        <p className="py-16 text-center text-[color-mix(in_oklab,var(--foreground)_55%,transparent)]">
          No matches for this combination of filters
          {query ? ` and "${query}"` : ""}.
        </p>
      ) : (
        <div className="space-y-2">
          {yearGroups.map(({ year, items: groupItems }) => {
            const headingId =
              year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
            return (
              <section key={year} aria-labelledby={headingId}>
                <YearHeader year={year} />
                <div className="space-y-3 pt-3">
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
