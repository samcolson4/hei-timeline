import type { TimelineItem, TimelinePayload } from "./types";

/** How entries are ordered: newest or oldest air date first. */
export type ChronologicalOrder = "newest" | "oldest";

export function readTimeline(
  payload: TimelinePayload,
): { items: TimelineItem[]; generatedAt: string } {
  return {
    items: [...payload.items],
    generatedAt: payload.generated_at,
  };
}

export type YearGroup = { year: number; items: TimelineItem[] };

export function groupByYear(
  items: TimelineItem[],
  order: ChronologicalOrder = "oldest",
): YearGroup[] {
  const map = new Map<number, TimelineItem[]>();
  for (const item of items) {
    const year = parseInt(item.air_date.slice(0, 4), 10);
    const y = Number.isFinite(year) ? year : 0;
    const list = map.get(y);
    if (list) list.push(item);
    else map.set(y, [item]);
  }

  const itemCmp =
    order === "newest"
      ? (a: TimelineItem, b: TimelineItem) =>
          b.air_date.localeCompare(a.air_date)
      : (a: TimelineItem, b: TimelineItem) =>
          a.air_date.localeCompare(b.air_date);

  const yearCmp =
    order === "newest"
      ? (a: number, b: number) => b - a
      : (a: number, b: number) => a - b;

  return [...map.entries()]
    .sort(([ay], [by]) => yearCmp(ay, by))
    .map(([year, group]) => ({
      year,
      items: [...group].sort(itemCmp),
    }));
}

export function formatDisplayDate(isoDate: string): string {
  if (isoDate.length < 10) return isoDate;
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
