"use client";

import { useMemo, useState } from "react";

import { setChronologyAndPersist, useChronology } from "@/lib/chronology";
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

import { TimelineItemRow } from "./TimelineItem";
import { YearHeader } from "./YearHeader";

type TimelineProps = {
  items: TimelineItem[];
  generatedAt: string;
};

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const pillBase =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 dark:focus-visible:ring-blue-400/40";
const pillIdle =
  "border-[color-mix(in_oklab,var(--foreground)_14%,transparent)] bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] text-[var(--foreground)] hover:border-blue-600/35 hover:bg-blue-600/10 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/10";
const pillActive =
  "border-blue-600/60 bg-blue-600/15 text-blue-700 dark:border-blue-400/50 dark:bg-blue-400/15 dark:text-blue-200";

export function Timeline({ items, generatedAt }: TimelineProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ShowTypeFilterId>("all");
  const chronology = useChronology();

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

  return (
    <div className="w-full">
      <header className="mb-10 space-y-4 border-b border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] pb-10">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[color-mix(in_oklab,var(--foreground)_45%,transparent)]">
            HEI Network
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Timeline
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[color-mix(in_oklab,var(--foreground)_62%,transparent)]">
            Every episode and related release on{" "}
            <a
              href="https://www.heinetwork.tv/"
              className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              heinetwork.tv
            </a>
            , ordered by air date ({chronology === "newest" ? "newest first" : "oldest first"}).
            Links open the official site in a new tab.
          </p>
          <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_48%,transparent)]">
            Data last updated: {formatGeneratedAt(generatedAt)}
          </p>
          <div className="space-y-2 pt-1">
            <span className="block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
              Order
            </span>
            <div
              className="-mx-1 flex flex-wrap gap-2 px-1"
              role="group"
              aria-label="Timeline sort order"
            >
              {(
                [
                  { id: "newest" as const, label: "Newest first" },
                  { id: "oldest" as const, label: "Oldest first" },
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
            <p className="text-xs text-[color-mix(in_oklab,var(--foreground)_45%,transparent)]">
              Your choice is saved in this browser until you clear site data.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
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

        <nav
          className="space-y-2"
          aria-label="Jump to year"
        >
          <span className="block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
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

        <nav
          className="space-y-2"
          aria-label="Jump to On Cinema season"
        >
          <span className="block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
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
          <span className="mb-2 block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
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
        <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{items.length}</strong> items
        </p>
      </header>

      {yearGroups.length === 0 ? (
        <p className="py-16 text-center text-[color-mix(in_oklab,var(--foreground)_55%,transparent)]">
          No matches for this combination of filters
          {query ? ` and “${query}”` : ""}.
        </p>
      ) : (
        <div className="space-y-2">
          {yearGroups.map(({ year, items: groupItems }) => {
            const headingId =
              year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
            return (
              <section key={year} aria-labelledby={headingId}>
                <YearHeader year={year} />
                <div className="divide-y divide-transparent">
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
    </div>
  );
}
