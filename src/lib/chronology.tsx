"use client";

import { useSyncExternalStore } from "react";

import type { ChronologicalOrder } from "./timeline";

export const CHRONOLOGY_STORAGE_KEY = "hei-timeline-chronological-order";

/** Same-tab updates (storage event only fires across tabs). */
const CHRONOLOGY_LOCAL_EVENT = "hei-timeline-chronology-local";

export function readStoredChronology(): ChronologicalOrder {
  if (typeof window === "undefined") return "newest";
  try {
    const v = window.localStorage.getItem(CHRONOLOGY_STORAGE_KEY);
    if (v === "oldest" || v === "newest") return v;
  } catch {
    /* private mode / quota */
  }
  return "newest";
}

function persistChronology(order: ChronologicalOrder) {
  try {
    window.localStorage.setItem(CHRONOLOGY_STORAGE_KEY, order);
  } catch {
    /* ignore */
  }
}

function subscribeChronology(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== CHRONOLOGY_STORAGE_KEY && e.key != null) return;
    onStoreChange();
  };
  const onLocal = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHRONOLOGY_LOCAL_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHRONOLOGY_LOCAL_EVENT, onLocal);
  };
}

function notifyChronologyChanged() {
  window.dispatchEvent(new Event(CHRONOLOGY_LOCAL_EVENT));
}

function getChronologyServerSnapshot(): ChronologicalOrder {
  return "newest";
}

export function setChronologyAndPersist(next: ChronologicalOrder) {
  persistChronology(next);
  notifyChronologyChanged();
}

/** Reads sort order from localStorage; subscribes to changes (incl. other tabs). */
export function useChronology(): ChronologicalOrder {
  return useSyncExternalStore(
    subscribeChronology,
    readStoredChronology,
    getChronologyServerSnapshot,
  );
}
