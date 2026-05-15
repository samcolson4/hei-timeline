"use client";

import { useMemo, useState } from "react";

import { groupByYear } from "@/lib/timeline";
import type { TimelineItem } from "@/lib/types";

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

export function Timeline({ items, generatedAt }: TimelineProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.title,
        item.season_name ?? "",
        item.category ?? "",
        item.slug,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const yearGroups = useMemo(() => groupByYear(filtered), [filtered]);

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
            , ordered by air date. Links open the official site in a new tab.
          </p>
          <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_48%,transparent)]">
            Data last updated: {formatGeneratedAt(generatedAt)}
          </p>
        </div>
        <label className="block max-w-xl">
          <span className="mb-2 block text-sm font-medium text-[color-mix(in_oklab,var(--foreground)_65%,transparent)]">
            Filter
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
          No matches for &ldquo;{query}&rdquo;.
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
                  {groupItems.map((item) => (
                    <TimelineItemRow
                      key={`${item.id}-${item.slug}`}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
