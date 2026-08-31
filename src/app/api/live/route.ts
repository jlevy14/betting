import { NextResponse } from "next/server";
import { getBoardData, getOrCreateActiveWeek, syncWeekLive } from "@/lib/league";

export const dynamic = "force-dynamic";

// Polled by the board every ~30s. Pulls fresh TD data from ESPN, writes any
// status changes to the DB, and returns a small summary the client uses to
// decide whether to keep polling and to trigger a page refresh.
export async function GET() {
  try {
    const week = await getOrCreateActiveWeek();
    await syncWeekLive(week.id);
    const data = await getBoardData(week);
    return NextResponse.json({
      ok: true,
      weekId: week.id,
      picksMade: data.picksMade,
      hits: data.hits,
      misses: data.misses,
      live: data.live,
      pending: data.pending,
      anyLive: data.anyLive,
      alive: data.alive,
      jackpot: data.jackpot,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
