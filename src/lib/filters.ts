import { decodeHtmlEntities } from "./htmlEntities";
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

/**
 * On Cinema At The Cinema episodes embed `SSEE` (or `SEE` for single-digit
 * seasons) as a numeric prefix in the title, e.g. "1610 'Hamnet'…" =
 * S16E10. Returns the parsed episode number and the title with that prefix
 * stripped, or null when the title doesn't follow the convention.
 */
export function parseOnCinemaPrefix(
  item: TimelineItem,
): { episodeNumber: number; cleanedTitle: string } | null {
  if (item.category !== "on-cinema-at-the-cinema") return null;
  const seasonNumber = effectiveSeasonNumber(item);
  if (seasonNumber == null) return null;
  const decoded = decodeHtmlEntities(item.title);
  const re = new RegExp(`^${seasonNumber}(\\d{2})\\s+`);
  const m = re.exec(decoded);
  if (!m) return null;
  return {
    episodeNumber: Number.parseInt(m[1], 10),
    cleanedTitle: decoded.slice(m[0].length),
  };
}

/** Decoded title, stripped of OCATC `SSEE` prefix when present. */
export function displayTitle(item: TimelineItem): string {
  const parsed = parseOnCinemaPrefix(item);
  if (parsed) return parsed.cleanedTitle;
  return decodeHtmlEntities(item.title);
}

export function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function episodeBadgeParts(item: TimelineItem): string[] {
  const badgeParts: string[] = [];
  if (item.season_name) badgeParts.push(item.season_name);
  else {
    const sn = effectiveSeasonNumber(item);
    if (sn != null) badgeParts.push(`Season ${sn}`);
  }
  const parsed = parseOnCinemaPrefix(item);
  if (parsed) badgeParts.push(`Episode ${parsed.episodeNumber}`);
  if (item.category) badgeParts.push(formatCategoryLabel(item.category));
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
