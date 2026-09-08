import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  referer: "https://www.espn.com/nfl/scoreboard",
  origin: "https://www.espn.com",
};

async function probe(label: string, url: string, count?: (j: any) => number) {
  const t = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store", headers: HEADERS });
    let n = -1;
    try {
      const j: any = await res.json();
      n = count ? count(j) : -1;
    } catch {
      /* non-json */
    }
    return { label, status: res.status, count: n, ms: Date.now() - t };
  } catch (e) {
    return { label, error: (e as Error)?.message, ms: Date.now() - t };
  }
}

export async function GET() {
  const EID = "401872656";
  const rosterCount = (j: any) => {
    const groups = j?.athletes ?? [];
    let c = 0;
    for (const g of groups) c += (g.items ?? []).length;
    return c;
  };
  const results = await Promise.all([
    probe(
      "cdn-scoreboard",
      "https://cdn.espn.com/core/nfl/scoreboard?xhr=1&week=1&seasontype=2&year=2026",
      (j) => (j?.content?.sbData?.events ?? []).length
    ),
    probe(
      "siteweb-roster",
      "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/teams/26/roster",
      rosterCount
    ),
    probe(
      "sitecore-roster",
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/26/roster",
      rosterCount
    ),
    probe(
      "siteweb-summary",
      `https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${EID}`,
      (j) => (j?.boxscore?.players ?? []).length
    ),
    probe(
      "cdn-boxscore",
      `https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId=${EID}`,
      (j) => (j?.gamepackageJSON?.boxscore?.players ?? []).length
    ),
  ]);
  return NextResponse.json({ results });
}
