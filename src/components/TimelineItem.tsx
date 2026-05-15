import Image from "next/image";

import { formatDisplayDate } from "@/lib/timeline";
import { effectiveSeasonNumber } from "@/lib/filters";
import type { TimelineItem } from "@/lib/types";

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 13.753a.75.75 0 001.06.053L16.5 5.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553L7.247 12.694a.75.75 0 00.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type TimelineItemRowProps = {
  item: TimelineItem;
  /** Present on the first visible row for this season (for in-page jump links). */
  scrollAnchorId?: string;
};

export function TimelineItemRow({ item, scrollAnchorId }: TimelineItemRowProps) {
  const badgeParts: string[] = [];
  if (item.season_name) badgeParts.push(item.season_name);
  else {
    const sn = effectiveSeasonNumber(item);
    if (sn != null) badgeParts.push(`Season ${sn}`);
  }
  if (item.category) badgeParts.push(item.category.replace(/-/g, " "));
  if (item.is_live) badgeParts.push("Live");

  const article = (
    <article className="group relative grid gap-4 border-b border-[color-mix(in_oklab,var(--foreground)_8%,transparent)] py-8 sm:grid-cols-[7.5rem_1fr] sm:gap-8">
      <div className="relative mx-auto flex w-full max-w-[7.5rem] shrink-0 justify-center sm:mx-0">
        {item.poster_url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/10 transition duration-200 group-hover:ring-[color-mix(in_oklab,var(--foreground)_22%,transparent)] dark:bg-white/5 dark:ring-white/10"
          >
            <Image
              src={item.poster_url}
              alt=""
              width={120}
              height={180}
              className="aspect-[2/3] h-auto w-full object-cover"
              sizes="120px"
              unoptimized
            />
          </a>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] text-xs text-[color-mix(in_oklab,var(--foreground)_45%,transparent)] transition group-hover:bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]"
          >
            No art
          </a>
        )}
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <time
            dateTime={item.air_date}
            className="text-sm text-[color-mix(in_oklab,var(--foreground)_50%,transparent)]"
          >
            {formatDisplayDate(item.air_date)}
          </time>
        </div>
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-[var(--foreground)] underline-offset-4 transition hover:text-blue-600 hover:underline dark:hover:text-blue-400"
          >
            <span>{item.title}</span>
            <ExternalIcon className="mt-1.5 h-4 w-4 shrink-0 text-blue-600 opacity-70 transition group-hover:opacity-100 dark:text-blue-400" />
          </a>
        </h3>
        {badgeParts.length > 0 ? (
          <p className="text-sm text-[color-mix(in_oklab,var(--foreground)_58%,transparent)]">
            {badgeParts.join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );

  if (scrollAnchorId) {
    return (
      <div id={scrollAnchorId} className="scroll-mt-24">
        {article}
      </div>
    );
  }

  return article;
}
