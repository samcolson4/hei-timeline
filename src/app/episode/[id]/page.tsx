import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import timelinePayload from "@data/timeline.json";

import { EpisodePrevNext } from "@/components/EpisodePrevNext";
import { episodeBadgeParts } from "@/lib/filters";
import { decodeHtmlEntities } from "@/lib/htmlEntities";
import { formatDisplayDate, readTimeline } from "@/lib/timeline";
import type { TimelinePayload } from "@/lib/types";

const typed = timelinePayload as TimelinePayload;

export function generateStaticParams() {
  return typed.items.map((item) => ({ id: String(item.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return { title: "Episode" };
  }
  const episode = typed.items.find((i) => i.id === numericId);
  if (!episode) {
    return { title: "Not found" };
  }
  return {
    title: `${decodeHtmlEntities(episode.title)} · HEI Timeline`,
    description: `Air date ${episode.air_date}. Watch on HEI Network.`,
  };
}

function formatRuntimeSeconds(raw: string | null): string | null {
  if (raw == null || raw === "") return null;
  const sec = Number.parseInt(raw, 10);
  if (!Number.isFinite(sec) || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${mm}m`;
  }
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const { items } = readTimeline(typed);
  const episode = items.find((i) => i.id === numericId);
  if (!episode) notFound();

  const badges = episodeBadgeParts(episode);
  const runtimeLabel = formatRuntimeSeconds(episode.length);
  const title = decodeHtmlEntities(episode.title);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12 sm:px-6 lg:max-w-4xl lg:px-8">
      <p className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
        >
          ← Back to timeline
        </Link>
      </p>

      <article className="grid gap-10 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-12">
        <div className="mx-auto w-full max-w-[11rem] sm:mx-0">
          {episode.poster_url ? (
            <div className="overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
              <Image
                src={episode.poster_url}
                alt=""
                width={176}
                height={264}
                className="aspect-[2/3] h-auto w-full object-cover"
                sizes="176px"
                unoptimized
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] text-sm text-[color-mix(in_oklab,var(--foreground)_45%,transparent)]">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]">
            Air date:{" "}
            <time dateTime={episode.air_date}>
              {formatDisplayDate(episode.air_date)}
            </time>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          {badges.length > 0 ? (
            <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_58%,transparent)]">
              {badges.join(" · ")}
            </p>
          ) : null}
          {runtimeLabel ? (
            <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_55%,transparent)]">
              Runtime: {runtimeLabel}
            </p>
          ) : null}

          <div className="pt-2">
            <a
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full min-h-14 items-center justify-center rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/35 sm:w-auto sm:min-w-[18rem] dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-blue-400/30"
            >
              Watch on HEI Network
              <span className="ml-2 text-white/90" aria-hidden>
                ↗
              </span>
            </a>
            <p className="mt-2 text-xs text-[color-mix(in_oklab,var(--foreground)_45%,transparent)]">
              Opens heinetwork.tv in a new tab.
            </p>
          </div>

          {episode.youtube_url ? (
            <p className="text-sm">
              <a
                href={episode.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                YouTube
              </a>
            </p>
          ) : null}
        </div>
      </article>

      <EpisodePrevNext currentId={episode.id} items={items} />
    </main>
  );
}
