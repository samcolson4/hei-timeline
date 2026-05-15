import type { ChronologicalOrder } from "./timeline";
import type { TimelineItem } from "./types";

export type ShowTypeFilterId =
  | "all"
  | "on-cinema"
  | "decker"
  | "live"
  | "more"
  | "other";

export const SHOW_TYPE_OPTIONS: { id: ShowTypeFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "on-cinema", label: "On Cinema" },
  { id: "decker", label: "Decker" },
  { id: "live", label: "Live" },
  { id: "more", label: "More" },
  { id: "other", label: "Other" },
];

const SEASON_IN_URL = /\/season-(\d+)\//i;

/** Season number from API or parsed from OCATC-style URLs (`/season-16/...`). */
export function effectiveSeasonNumber(item: TimelineItem): number | null {
  if (item.season_number != null) return item.season_number;
  const m = SEASON_IN_URL.exec(item.url);
  if (m) return parseInt(m[1], 10);
  return null;
}

export function itemKey(item: TimelineItem): string {
  return `${item.id}-${item.slug}`;
}

export function matchesShowType(
  item: TimelineItem,
  filterId: ShowTypeFilterId,
): boolean {
  if (filterId === "all") return true;
  const c = item.category ?? "";
  switch (filterId) {
    case "on-cinema":
      return c === "on-cinema-at-the-cinema" || c === "oscar-specials";
    case "decker":
      return c === "decker";
    case "live":
      return c === "live";
    case "more":
      return c === "more";
    case "other":
      return (
        c !== "on-cinema-at-the-cinema" &&
        c !== "oscar-specials" &&
        c !== "decker" &&
        c !== "live" &&
        c !== "more"
      );
    default:
      return true;
  }
}

export function collectYears(
  items: TimelineItem[],
  order: ChronologicalOrder = "newest",
): number[] {
  const set = new Set<number>();
  for (const item of items) {
    const y = parseInt(item.air_date.slice(0, 4), 10);
    if (Number.isFinite(y)) set.add(y);
  }
  const arr = [...set];
  arr.sort((a, b) => (order === "newest" ? b - a : a - b));
  return arr;
}

export function collectSeasons(
  items: TimelineItem[],
  order: ChronologicalOrder = "newest",
): number[] {
  const set = new Set<number>();
  for (const item of items) {
    const n = effectiveSeasonNumber(item);
    if (n != null) set.add(n);
  }
  const arr = [...set];
  arr.sort((a, b) => (order === "newest" ? b - a : a - b));
  return arr;
}

export function episodeBadgeParts(item: TimelineItem): string[] {
  const badgeParts: string[] = [];
  if (item.season_name) badgeParts.push(item.season_name);
  else {
    const sn = effectiveSeasonNumber(item);
    if (sn != null) badgeParts.push(`Season ${sn}`);
  }
  if (item.category) badgeParts.push(item.category.replace(/-/g, " "));
  if (item.is_live) badgeParts.push("Live");
  return badgeParts;
}

export function firstItemKeyPerSeason(
  itemsInOrder: TimelineItem[],
): Map<number, string> {
  const seen = new Set<number>();
  const map = new Map<number, string>();
  for (const item of itemsInOrder) {
    const n = effectiveSeasonNumber(item);
    if (n == null) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    map.set(n, itemKey(item));
  }
  return map;
}

export function scrollToElementId(id: string): void {
  if (typeof document === "undefined") return;
  const align = () => {
    document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  };
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  // Post-layout passes: posters/images load after first paint and shift content down.
  window.setTimeout(align, 400);
  window.setTimeout(align, 900);
}
