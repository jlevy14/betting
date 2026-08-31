import Link from "next/link";
import {
  Window,
  SiteHeader,
  Nav,
  FooterJunk,
} from "@/components/chrome";
import { StatusPill, LegCount } from "@/components/status";
import { LiveRefresher } from "./live-refresher";
import {
  getOrCreateActiveWeek,
  getBoardData,
  syncWeekLive,
  listWeeks,
  findWeek,
  LEAGUE_SIZE,
} from "@/lib/league";
import { centsToDollars, formatKickoff, weekLabel } from "@/lib/format";
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

  const remaining = LEAGUE_SIZE - board.picksMade;

  return (
    <>
      <SiteHeader />
      <Nav active="board" />

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

      {/* WEEK ARCHIVE */}
      {weeks.length > 1 ? (
        <Window title="PAST WEEKS (our glorious history)" icon={"\uD83D\uDCC1"}>
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
      ) : null}

      <FooterJunk />
    </>
  );
}
