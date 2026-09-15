import { NextRequest, NextResponse } from "next/server";
import { getOrCreateActiveWeek, syncWeekLive } from "@/lib/league";

export const dynamic = "force-dynamic";

// Triggered by Vercel Cron (see vercel.json), scheduled around 8am ET every
// Tuesday -- roughly when ESPN's "current week" ticks over after Monday Night
// Football. Without this, the board only flips to the new week when someone
// happens to load the site; this makes sure it happens on a clock instead.
//
// Vercel Cron schedules run in UTC and can't express a timezone directly, and
// ET flips between EDT (UTC-4) and EST (UTC-5) across the season, so
// vercel.json schedules this at BOTH 12:00 and 13:00 UTC on Tuesdays -- one of
// those always lines up with 8am ET. The work below is idempotent (it's the
// same upsert-and-sync the page and /api/live already do on every visit), so
// the "extra" invocation near the DST boundary is harmless.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const week = await getOrCreateActiveWeek();
    await syncWeekLive(week.id);
    return NextResponse.json({
      ok: true,
      weekId: week.id,
      season: week.season,
      seasonType: week.seasonType,
      weekNum: week.weekNum,
      triggeredAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[cron] weekly refresh failed", (e as Error)?.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
