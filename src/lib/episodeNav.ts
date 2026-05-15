import { groupByYear, type ChronologicalOrder } from "./timeline";
import type { TimelineItem } from "./types";

/** Full catalog in the same order as on the home timeline for a given sort mode. */
export function orderedItemsForNavigation(
  items: TimelineItem[],
  order: ChronologicalOrder,
): TimelineItem[] {
  return groupByYear(items, order).flatMap((g) => g.items);
}

export function resolveEpisodeNeighbors(
  itemsInOrder: TimelineItem[],
  currentId: number,
): { prev: TimelineItem | null; next: TimelineItem | null } {
  const idx = itemsInOrder.findIndex((i) => i.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? itemsInOrder[idx - 1]! : null,
    next: idx < itemsInOrder.length - 1 ? itemsInOrder[idx + 1]! : null,
  };
}
