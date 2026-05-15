import { NextResponse } from "next/server";

import timelineData from "@data/timeline.json";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(timelineData);
}
