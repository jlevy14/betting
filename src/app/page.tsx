import Link from "next/link";
import {
  Window,
  CompactHeader,
  Nav,
  FooterJunk,
  ShameWall,
  MissScroller,
} from "@/components/chrome";
import { StatusPill, LegCount } from "@/components/status";
import { LiveRefresher } from "./live-refresher";
import { JackpotCelebration } from "./jackpot";
import { WeekResetShame } from "./week-reset-shame";
import {
  getOrCreateActiveWeek,
  getBoardData,
  syncWeekLive,
  listWeeks,
  findWeek,
  getShameInfo,
  getPreviousWeekRecap,
  weekKey,
  LEAGUE_SIZE,
} from "@/lib/league";
import { centsToDollars, formatKickoff, weekLabel } from "@/lib/format";
import { cookies } from "next/headers";
import type { Week } from "@prisma/client";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

async function resolveWeek(searchParams: SP): Promise<{ week: Week; isArchive: boolean }> {
  const s = Number(searchParams.season);
  const st = Number(searchParams.st);
  const w = Number(searchParams.w);
  if (s && st && w) {
    const found = await findWeek(s, st, w);
    if (found) return { week: found, isArchive: !found.isActive };
  }
  const active = await getOrCreateActiveWeek();
  return { week: active, isArchive: false };
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const { week, isArchive } = await resolveWeek(sp);

  // Only auto-sync the active week; archived weeks are historical.
  if (!isArchive) {
    await syncWeekLive(week.id);
  }

  const board = await getBoardData(week);
  const weeks = await listWeeks();
  const shame = isArchive
    ? { active: false, firstKickoff: null, deadbeats: [] }
    : await getShameInfo(week);

  const remaining = LEAGUE_SIZE - board.picksMade;

  // Visit /?party=1 to preview the jackpot celebration any time.
  const partyPreview = sp.party != null;

  // Visit /?shame=1 to preview the Wall of Shame with demo names.
  const shameNames =
    sp.shame != null && shame.deadbeats.length === 0
      ? ["Kevin", "Danny", "Marcus"]
      : shame.deadbeats;

  // Current-week missers get roasted in the scrolling ticker.
  const missNames = board.picks
    .filter((p) => p.status === "miss")
    .map((p) => p.member.displayName);

  // First-visit-of-a-new-week humiliation recapping the previous week.
  const recap = isArchive ? null : await getPreviousWeekRecap(week);
  const currentWeekKey = weekKey(week);
  const cookieStore = await cookies();
  const seenWeek = cookieStore.get("lmab_seen_week")?.value ?? "";
  const showWeekReset =
    !isArchive &&
    !!recap &&
    recap.missers.length > 0 &&
    seenWeek !== currentWeekKey;
  // Preview with /?recap=1
  const forceRecap = sp.recap != null && !!recap;

  return (
    <div id="top">
      <JackpotCelebration active={board.jackpot || partyPreview} />
      {recap ? (
        <WeekResetShame
          active={showWeekReset || forceRecap}
          weekKey={currentWeekKey}
          recap={recap}
        />
      ) : null}
      <CompactHeader />
      <Nav active="board" />

      <MissScroller names={missNames} />

      <ShameWall names={shameNames} />

      <div className={`board-layout ${weeks.length > 1 ? "" : "no-aside"}`}>
        <main className="maincol">
      <Window title={`THE BOARD - ${weekLabel(week.season, week.seasonType, week.weekNum)}`} icon={"\uD83D\uDCCA"}>
        {board.jackpot ? (
          <div className="jackpot-banner blink">
            &#128176; WE ARE BILLIONAIRES!!! ALL {LEAGUE_SIZE} LEGS HIT!!! &#128176;
          </div>
        ) : !board.alive ? (
          <div className="dead">
            &#128128; TICKET IS DEAD &#128128;
            <div className="small" style={{ color: "#ff9999" }}>
              ({board.misses} leg{board.misses === 1 ? "" : "s"} missed) &mdash; but keep watching, we play for pride now
            </div>
          </div>
        ) : null}

        {/* PAYOUT */}
        <div className="rainbow-border">
        <div className="payout-box">
          <div className="payout-label blink">
            &#128176;&#128176; IF THIS THING HITS WE ALL WIN &#128176;&#128176;
          </div>
          <div className={`payout-amount ${board.alive && !isArchive ? "blink" : ""}`}>
            <span className="spin">&#128176;</span>{" "}
            {board.payoutCents != null ? centsToDollars(board.payoutCents) : "$??????"}{" "}
            <span className="spin">&#128176;</span>
          </div>
          {board.perShareCents != null ? (
            <div className="payout-share">
              = {centsToDollars(board.perShareCents)} EACH (split {LEAGUE_SIZE} ways)
            </div>
          ) : (
            <div className="payout-share">
              (the Head Gambler hasn&apos;t placed the ticket yet)
            </div>
          )}
          {week.payoutCaption ? (
            <div className="small" style={{ color: "#ffff66" }}>
              ticket: {week.payoutCaption}
            </div>
          ) : null}
        </div>
        </div>

        {/* LEG THERMOMETER */}
        <div className="raised" style={{ margin: "8px 0" }}>
          <div className="center" style={{ fontWeight: "bold", color: "#000080" }}>
            {board.hits} of {LEAGUE_SIZE} TOUCHDOWNS SO FAR
            {board.live > 0 ? ` (${board.live} still playing)` : ""}
          </div>
          <LegCount picks={board.picks} />
          {remaining > 0 ? (
            <div className="center small">
              waiting on {remaining} pick{remaining === 1 ? "" : "s"} &mdash;{" "}
              <Link href="/pick">go pick your guy!</Link>
            </div>
          ) : null}
        </div>

        {!isArchive ? <LiveRefresher /> : (
          <div className="center small">(archived week &mdash; final results)</div>
        )}

        {/* THE ACTUAL BOARD */}
        {board.picks.length === 0 ? (
          <div className="sunken center" style={{ marginTop: 10 }}>
            <p style={{ fontWeight: "bold" }}>
              No picks yet for {weekLabel(week.season, week.seasonType, week.weekNum)}.
            </p>
            <p>
              <Link className="navbtn" href="/pick">
                BE THE FIRST TO PICK &raquo;
              </Link>
            </p>
          </div>
        ) : (
          <div className="scroll-x" style={{ marginTop: 10 }}>
          <table className="board">
            <thead>
              <tr>
                <th>#</th>
                <th>MANAGER</th>
                <th>THEIR GUY</th>
                <th>TEAM</th>
                <th>vs</th>
                <th>KICKOFF</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {board.picks.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: "bold" }}>{p.member.displayName}</td>
                  <td>
                    {p.playerName}{" "}
                    <span className="small">({p.position || "?"})</span>
                    {p.scoredTds > 1 ? (
                      <span className="small" style={{ color: "#007a00" }}>
                        {" "}&times;{p.scoredTds} TDs!
                      </span>
                    ) : null}
                  </td>
                  <td>{p.nflTeam}</td>
                  <td>{p.opponent}</td>
                  <td className="small">{formatKickoff(p.kickoffAt)}</td>
                  <td>
                    <StatusPill status={p.status} />
                    {p.isManual ? <span className="small"> *</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {board.earliestKickoff && !isArchive ? (
          <div className="center small" style={{ marginTop: 6 }}>
            &#9201; Head Gambler: place the DraftKings ticket before{" "}
            <b>{formatKickoff(board.earliestKickoff)}</b> (earliest kickoff)
          </div>
        ) : null}
      </Window>
        </main>

        {weeks.length > 1 ? (
          <aside className="sidebar">
            <Window title="PAST WEEKS" icon={"\uD83D\uDCC1"}>
              <div className="center">
                {weeks.map((wk) => {
                  const isCurrent = wk.id === week.id;
                  return (
                    <Link
                      key={wk.id}
                      className="navbtn"
                      href={`/?season=${wk.season}&st=${wk.seasonType}&w=${wk.weekNum}`}
                      style={isCurrent ? { background: "#ffff99", textDecoration: "underline" } : undefined}
                    >
                      {weekLabel(wk.season, wk.seasonType, wk.weekNum)}
                    </Link>
                  );
                })}
              </div>
            </Window>
          </aside>
        ) : null}
      </div>

      <FooterJunk />
    </div>
  );
}
