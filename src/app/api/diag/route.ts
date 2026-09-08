import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const CDN = "https://cdn.espn.com/core/nfl/scoreboard";

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  referer: "https://www.espn.com/nfl/scoreboard",
  origin: "https://www.espn.com",
};

async function probe(label: string, url: string) {
  const t = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store", headers: HEADERS });
    let events = -1;
    let text = "";
    try {
      const j: any = await res.json();
      events = (j?.events ?? j?.content?.sbData?.events ?? []).length;
    } catch {
      text = "(non-json)";
    }
    return { label, url, status: res.status, events, ms: Date.now() - t, text };
  } catch (e) {
    return { label, url, error: (e as Error)?.message, ms: Date.now() - t };
  }
}

export async function GET() {
  const results = await Promise.all([
    probe("default", `${BASE}/scoreboard`),
    probe("params-full", `${BASE}/scoreboard?dates=2026&seasontype=2&week=1`),
    probe("params-noDates", `${BASE}/scoreboard?seasontype=2&week=1`),
    probe("params-weekOnly", `${BASE}/scoreboard?week=1`),
    probe("date-range", `${BASE}/scoreboard?dates=20260908-20260916`),
    probe("cdn-core", `${CDN}?xhr=1&week=1&seasontype=2&year=2026`),
  ]);
  return NextResponse.json({ results });
}
