"use client";

import { useWatchedIds } from "@/lib/watched";

import { WatchedToggle } from "./WatchedToggle";

type EpisodeWatchedBarProps = {
  episodeId: number;
};

export function EpisodeWatchedBar({ episodeId }: EpisodeWatchedBarProps) {
  const watchedIds = useWatchedIds();
  return (
    <WatchedToggle itemId={episodeId} watched={watchedIds.has(episodeId)} />
  );
}
