import timelinePayload from "@data/timeline.json";

import { Timeline } from "@/components/Timeline";
import type { TimelinePayload } from "@/lib/types";
import { readTimeline } from "@/lib/timeline";

const typed = timelinePayload as TimelinePayload;
const { items, generatedAt } = readTimeline(typed);

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12 sm:px-6 lg:max-w-4xl lg:px-8">
      <Timeline items={items} generatedAt={generatedAt} />
    </main>
  );
}
