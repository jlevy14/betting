import { NextResponse } from "next/server";
import { getCurrentMeta, getWeekGames, getWeekPlayers } from "@/lib/espn";

export const dynamic = "force-dynamic";

// Temporary diagnostic: confirms the live server can load games + players.
// Delete once verified.
export async function GET() {
  const started = Date.now();
  try {
    const meta = await getCurrentMeta();
    const games = await getWeekGames(meta);
    const players = await getWeekPlayers(meta);
    return NextResponse.json({
      ok: true,
      ms: Date.now() - started,
      meta,
      gamesCount: games.length,
      playersCount: players.length,
      sampleGames: games
        .slice(0, 4)
        .map((g) => `${g.away.abbrev} @ ${g.home.abbrev} (${g.state})`),
      samplePlayers: players.slice(0, 5).map((p) => `${p.name} ${p.position} ${p.teamAbbrev}`),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, ms: Date.now() - started, error: (e as Error)?.message },
      { status: 500 }
    );
  }
}
