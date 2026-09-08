import Link from "next/link";
import { Window, SiteHeader, Nav, FooterJunk, Alert, ShameWall } from "@/components/chrome";
import { StatusPill } from "@/components/status";
import { loginLeague, logoutLeague, submitPick } from "../actions";
import { hasAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getOrCreateActiveWeek,
  getShameInfo,
  weekMeta,
} from "@/lib/league";
import { getWeekPlayers } from "@/lib/espn";
import { formatKickoff, weekLabel } from "@/lib/format";
import { cookies } from "next/headers";
import { PlayerSearch, type PlayerOpt } from "./player-search";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

export default async function PickPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  const err = typeof sp.error === "string" ? sp.error : null;

  const authed = await hasAccess("league");

  if (!authed) {
    return (
      <>
        <SiteHeader />
        <Nav active="pick" />
        <Window title="MEMBERS ONLY - ENTER PASSWORD" icon={"\uD83D\uDD12"}>
          <Alert ok={ok} err={err} />
          <div className="sunken">
            <p style={{ fontWeight: "bold" }}>
              &#128274; This area is for LEAGUE MEMBERS only. Type the secret
              league password (ask the Head Gambler).
            </p>
            <form action={loginLeague}>
              <p>
                <label>League Password:&nbsp;</label>
                <input type="password" name="password" autoFocus />
                &nbsp;
                <button type="submit" className="bigbtn">LET ME IN &raquo;</button>
              </p>
            </form>
          </div>
        </Window>
        <FooterJunk />
      </>
    );
  }

  const week = await getOrCreateActiveWeek();
  const shame = await getShameInfo(week);
  const members = await prisma.member.findMany({ orderBy: { sortOrder: "asc" } });

  // Remember returning managers: pre-select whoever this browser picked as last.
  const cookieStore = await cookies();
  const rememberedId = cookieStore.get("lmab_member")?.value ?? "";
  const rememberedMember = members.find((m) => m.id === rememberedId);
  const picks = await prisma.pick.findMany({
    where: { weekId: week.id },
    include: { member: true },
    orderBy: { member: { sortOrder: "asc" } },
  });

  const players = await getWeekPlayers(weekMeta(week));
  const takenBy = new Map<string, string>();
  for (const p of picks) takenBy.set(p.espnAthleteId, p.member.displayName);

  // Flat, searchable list of players for the type-ahead picker.
  const now = Date.now();
  const playerOptions: PlayerOpt[] = players.map((pl) => ({
    id: pl.athleteId,
    name: pl.name,
    position: pl.position,
    team: pl.teamAbbrev,
    opp: pl.opponentAbbrev,
    kickoffLabel: formatKickoff(pl.kickoffAt),
    started: new Date(pl.kickoffAt).getTime() <= now,
    takenBy: takenBy.get(pl.athleteId) ?? null,
  }));

  const noGames = players.length === 0;

  return (
    <>
      <SiteHeader />
      <Nav active="pick" />

      <ShameWall names={shame.deadbeats} />

      <Window title={`MAKE YOUR PICK - ${weekLabel(week.season, week.seasonType, week.weekNum)}`} icon={"\u270D"}>
        <Alert ok={ok} err={err} />

        {rememberedMember ? (
          <div className="alert ok">
            &#128075; Welcome back, <b>{rememberedMember.displayName}</b>! We
            pre-picked your name below &#8212; change it if that&apos;s not you.
          </div>
        ) : null}

        <div className="small center" style={{ marginBottom: 6 }}>
          logged in as a league member &nbsp;|&nbsp;{" "}
          <form action={logoutLeague} style={{ display: "inline" }}>
            <button type="submit" style={{ padding: "1px 6px", fontSize: 11 }}>
              log out
            </button>
          </form>
        </div>

        <div className="sunken">
          <p style={{ fontWeight: "bold", color: "#8b0000" }}>
            &#9888; RULES: Pick ONE player you think scores a touchdown this
            week. No two managers can pick the same guy. Your pick LOCKS when
            that player&apos;s game kicks off. QB passing TDs do NOT count &mdash;
            he has to run it in or catch it (rush/rec/return/defense).
          </p>

          {noGames ? (
            <p style={{ fontWeight: "bold" }}>
              ESPN isn&apos;t showing any games for this week right now. Check
              back when the schedule is posted.
            </p>
          ) : (
            <form action={submitPick}>
              <p>
                <label>1) WHO ARE YOU?</label>
                <br />
                <select name="memberId" defaultValue={rememberedMember ? rememberedId : ""} required>
                  <option value="" disabled>
                    -- pick your name --
                  </option>
                  {members.map((m) => {
                    const has = picks.find((p) => p.memberId === m.id);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.displayName}
                        {has ? ` (currently: ${has.playerName})` : ""}
                      </option>
                    );
                  })}
                </select>
              </p>

              <p>
                <label>2) WHO SCORES?</label>
                <br />
                <span className="small">
                  Type a name, then click your guy (no scrolling the whole NFL).
                </span>
                <PlayerSearch players={playerOptions} />
              </p>

              <p className="center">
                <button type="submit" className="bigbtn">
                  &#128293; LOCK IT IN &#128293;
                </button>
              </p>
            </form>
          )}
        </div>

        {/* current picks */}
        <h3 style={{ fontFamily: "Tahoma", color: "#000080" }}>
          WHO&apos;S PICKED WHAT ({picks.length}/{members.length})
        </h3>
        {picks.length === 0 ? (
          <p>Nobody has picked yet. Be a legend, go first.</p>
        ) : (
          <div className="scroll-x">
          <table className="board">
            <thead>
              <tr>
                <th>MANAGER</th>
                <th>PLAYER</th>
                <th>TEAM</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: "bold" }}>{p.member.displayName}</td>
                  <td>
                    {p.playerName} <span className="small">({p.position})</span>
                  </td>
                  <td>
                    {p.nflTeam} vs {p.opponent}
                  </td>
                  <td>
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <p className="center" style={{ marginTop: 10 }}>
          <Link className="navbtn" href="/">
            &laquo; BACK TO THE BOARD
          </Link>
        </p>
      </Window>

      <FooterJunk />
    </>
  );
}
