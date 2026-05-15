import type { TimelineItem, TimelinePayload } from "./types";

export function readTimeline(
  payload: TimelinePayload,
): { items: TimelineItem[]; generatedAt: string } {
  return {
    items: [...payload.items].sort((a, b) =>
      a.air_date < b.air_date ? 1 : a.air_date > b.air_date ? -1 : 0,
    ),
    generatedAt: payload.generated_at,
  };
}

export type YearGroup = { year: number; items: TimelineItem[] };

export function groupByYear(items: TimelineItem[]): YearGroup[] {
  const map = new Map<number, TimelineItem[]>();
  for (const item of items) {
    const year = parseInt(item.air_date.slice(0, 4), 10);
    const y = Number.isFinite(year) ? year : 0;
    const list = map.get(y);
    if (list) list.push(item);
    else map.set(y, [item]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, group]) => ({
      year,
      items: group.sort((a, b) =>
        a.air_date < b.air_date ? 1 : a.air_date > b.air_date ? -1 : 0,
      ),
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
