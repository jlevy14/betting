import { NextResponse } from "next/server";
import { getCurrentMeta, getWeekGames, getWeekPlayers } from "@/lib/espn";

export const dynamic = "force-dynamic";

// Temporary diagnostic: shows what the server (Vercel) actually sees from ESPN.
// Hit /api/diag on the live site. Safe to delete once games are confirmed.
export async function GET() {
  const started = Date.now();
  try {
    const meta = await getCurrentMeta();
    const games = await getWeekGames(meta);
    let players: number | string = "(skipped)";
    try {
      players = (await getWeekPlayers(meta)).length;
    } catch (e) {
      players = "error: " + (e as Error)?.message;
    }
    return NextResponse.json({
      ok: true,
      ms: Date.now() - started,
      meta,
      gamesCount: games.length,
      playersCount: players,
      sampleGames: games.slice(0, 5).map((g) => ({
        matchup: `${g.away.abbrev} @ ${g.home.abbrev}`,
        kickoffAt: g.kickoffAt,
        state: g.state,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, ms: Date.now() - started, error: (e as Error)?.message },
      { status: 500 }
    );
  }
}
