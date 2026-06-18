"use client";

import { useSyncExternalStore } from "react";

import { orderedItemsForNavigation } from "./episodeNav";
import type { TimelineItem } from "./types";

export const WATCHED_STORAGE_KEY = "hei-timeline-watched-ids";

const WATCHED_LOCAL_EVENT = "hei-timeline-watched-local";

const EMPTY_WATCHED: ReadonlySet<number> = new Set();

let cachedRaw: string | null = null;
let cachedSet: ReadonlySet<number> = EMPTY_WATCHED;

function parseStored(raw: string | null): ReadonlySet<number> {
  if (raw == null || raw === "") return EMPTY_WATCHED;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_WATCHED;
    const ids = new Set<number>();
    for (const x of parsed) {
      if (typeof x === "number" && Number.isInteger(x)) ids.add(x);
    }
    if (ids.size === 0) return EMPTY_WATCHED;
    return ids;
  } catch {
    return EMPTY_WATCHED;
  }
}

function readFromStorage(): ReadonlySet<number> {
  if (typeof window === "undefined") return EMPTY_WATCHED;
  try {
    const raw = window.localStorage.getItem(WATCHED_STORAGE_KEY);
    if (raw === cachedRaw) return cachedSet;
    cachedRaw = raw;
    cachedSet = parseStored(raw);
    return cachedSet;
  } catch {
    cachedSet = EMPTY_WATCHED;
    return cachedSet;
  }
}

function persistWatchedIds(ids: Set<number>) {
  try {
    const arr = [...ids].sort((a, b) => a - b);
    const serialized = JSON.stringify(arr);
    window.localStorage.setItem(WATCHED_STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedSet = ids.size === 0 ? EMPTY_WATCHED : ids;
  } catch {
    /* private mode / quota */
  }
}

function subscribeWatched(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== WATCHED_STORAGE_KEY && e.key != null) return;
    cachedRaw = null;
    onStoreChange();
  };
  const onLocal = () => {
    cachedRaw = null;
    onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(WATCHED_LOCAL_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WATCHED_LOCAL_EVENT, onLocal);
  };
}

function notifyWatchedChanged() {
  window.dispatchEvent(new Event(WATCHED_LOCAL_EVENT));
}

function getWatchedServerSnapshot(): ReadonlySet<number> {
  return EMPTY_WATCHED;
}

export function markAllWatched(ids: number[]) {
  const next = new Set(ids);
  persistWatchedIds(next);
  notifyWatchedChanged();
}

export function toggleWatched(id: number) {
  const prev = readFromStorage();
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  persistWatchedIds(next);
  notifyWatchedChanged();
}

/** Reads watched ids from localStorage; subscribes to changes (incl. other tabs). */
export function useWatchedIds(): ReadonlySet<number> {
  return useSyncExternalStore(
    subscribeWatched,
    readFromStorage,
    getWatchedServerSnapshot,
  );
}

export function nextUnwatchedItem(
  items: TimelineItem[],
  watchedIds: ReadonlySet<number>,
): TimelineItem | null {
  const ordered = orderedItemsForNavigation(items, "oldest");
  for (const item of ordered) {
    if (!watchedIds.has(item.id)) return item;
  }
  return null;
}
