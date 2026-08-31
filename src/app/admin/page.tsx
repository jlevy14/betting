import Link from "next/link";
import { Window, SiteHeader, Nav, FooterJunk, Alert } from "@/components/chrome";
import { StatusPill } from "@/components/status";
import {
  loginCommish,
  logoutCommish,
  adminSetNames,
  adminSetPayout,
  adminOverridePick,
  adminClearPick,
  adminSyncNow,
} from "../actions";
import { hasAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateActiveWeek, getBoardData } from "@/lib/league";
import { centsToDollars, formatKickoff, weekLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok : null;
  const err = typeof sp.error === "string" ? sp.error : null;

  const authed = await hasAccess("commish");

  if (!authed) {
    return (
      <>
        <SiteHeader />
        <Nav active="admin" />
        <Window title="COMMISSIONER LOGIN" icon={"\uD83D\uDC51"}>
          <Alert ok={ok} err={err} />
          <div className="sunken">
            <p style={{ fontWeight: "bold" }}>
              &#128081; This is the commissioner control panel. Members can&apos;t
              come back here.
            </p>
            <form action={loginCommish}>
              <p>
                <label>Commissioner Password:&nbsp;</label>
                <input type="password" name="password" autoFocus />
                &nbsp;
                <button type="submit" className="bigbtn">ENTER &raquo;</button>
              </p>
            </form>
          </div>
        </Window>
        <FooterJunk />
      </>
    );
  }

  const week = await getOrCreateActiveWeek();
  const members = await prisma.member.findMany({ orderBy: { sortOrder: "asc" } });
  const board = await getBoardData(week);

  return (
    <>
      <SiteHeader />
      <Nav active="admin" />

      <Window title={`COMMISSIONER PANEL - ${weekLabel(week.season, week.seasonType, week.weekNum)}`} icon={"\uD83D\uDC51"}>
        <Alert ok={ok} err={err} />
        <div className="small center" style={{ marginBottom: 6 }}>
          <form action={logoutCommish} style={{ display: "inline" }}>
            <button type="submit" style={{ padding: "1px 6px", fontSize: 11 }}>
              log out
            </button>
          </form>
        </div>

        {/* PAYOUT */}
        <div className="raised" style={{ marginBottom: 10 }}>
          <h3 style={{ marginTop: 0, fontFamily: "Tahoma", color: "#000080" }}>
            &#128176; DRAFTKINGS PAYOUT
          </h3>
          <p className="small">
            After you place the $12 / 12-leg anytime-TD parlay, type the total
            &quot;To Win&quot; amount here. Each of the {members.length} managers
            gets an equal share.
          </p>
          <form action={adminSetPayout}>
            <p>
              <label>Total to win ($):&nbsp;</label>
              <input
                type="text"
                name="payout"
                placeholder="e.g. 48372.44"
                defaultValue={
                  week.dkPayoutCents != null
                    ? (week.dkPayoutCents / 100).toFixed(2)
                    : ""
                }
              />
              {week.dkPayoutCents != null ? (
                <span className="small">
                  {" "}
                  = {centsToDollars(week.dkPayoutCents)} total /{" "}
                  {centsToDollars(Math.round(week.dkPayoutCents / members.length))} each
                </span>
              ) : null}
            </p>
            <p>
              <label>Ticket caption (optional):&nbsp;</label>
              <input
                type="text"
                name="caption"
                placeholder="e.g. +4030300 odds"
                defaultValue={week.payoutCaption ?? ""}
                size={30}
              />
            </p>
            <p>
              <label>Notes (optional):&nbsp;</label>
              <br />
              <textarea name="notes" rows={2} cols={50} defaultValue={week.notes ?? ""} />
            </p>
            <p>
              <button type="submit" className="bigbtn">SAVE PAYOUT</button>
            </p>
          </form>
        </div>

        {/* SYNC */}
        <div className="raised" style={{ marginBottom: 10 }}>
          <h3 style={{ marginTop: 0, fontFamily: "Tahoma", color: "#000080" }}>
            &#128260; LIVE STATS
          </h3>
          <p className="small">
            Stats refresh automatically, but you can force a pull from ESPN right
            now. Current: {board.hits} hit / {board.misses} miss / {board.live}{" "}
            playing / {board.pending} not started.
          </p>
          <form action={adminSyncNow}>
            <button type="submit">SYNC WITH ESPN NOW</button>
          </form>
        </div>

        {/* OVERRIDES */}
        <div className="raised" style={{ marginBottom: 10 }}>
          <h3 style={{ marginTop: 0, fontFamily: "Tahoma", color: "#000080" }}>
            &#9997; FIX A LEG (manual override)
          </h3>
          <p className="small">
            Use this only if ESPN is wrong or someone fat-fingered a pick.
            Setting a status manually stops the auto-sync from changing it (marked
            with *). &quot;AUTO&quot; hands it back to ESPN.
          </p>
          {board.picks.length === 0 ? (
            <p>No picks yet this week.</p>
          ) : (
            <table className="board">
              <thead>
                <tr>
                  <th>MANAGER</th>
                  <th>PLAYER</th>
                  <th>KICKOFF</th>
                  <th>STATUS</th>
                  <th>SET</th>
                  <th>CLEAR</th>
                </tr>
              </thead>
              <tbody>
                {board.picks.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: "bold" }}>{p.member.displayName}</td>
                    <td>
                      {p.playerName}{" "}
                      <span className="small">
                        ({p.position} {p.nflTeam})
                      </span>
                    </td>
                    <td className="small">{formatKickoff(p.kickoffAt)}</td>
                    <td>
                      <StatusPill status={p.status} />
                      {p.isManual ? " *" : ""}
                    </td>
                    <td>
                      <form action={adminOverridePick} style={{ display: "flex", gap: 2 }}>
                        <input type="hidden" name="pickId" value={p.id} />
                        <select name="status" defaultValue="">
                          <option value="" disabled>
                            set...
                          </option>
                          <option value="hit">HIT</option>
                          <option value="miss">MISS</option>
                          <option value="live">PLAYING</option>
                          <option value="pending">NOT STARTED</option>
                          <option value="auto">AUTO (ESPN)</option>
                        </select>
                        <button type="submit">GO</button>
                      </form>
                    </td>
                    <td>
                      <form action={adminClearPick}>
                        <input type="hidden" name="pickId" value={p.id} />
                        <button type="submit">X</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* NAMES */}
        <div className="raised">
          <h3 style={{ marginTop: 0, fontFamily: "Tahoma", color: "#000080" }}>
            &#128100; LEAGUE MEMBER NAMES
          </h3>
          <p className="small">
            Rename the {members.length} managers. These show up in the name
            dropdown on the pick page and on the board.
          </p>
          <form action={adminSetNames}>
            {members.map((m, i) => (
              <p key={m.id} style={{ margin: "3px 0" }}>
                <label>#{i + 1}:&nbsp;</label>
                <input type="text" name={`name_${m.id}`} defaultValue={m.displayName} size={24} />
              </p>
            ))}
            <p>
              <button type="submit" className="bigbtn">SAVE NAMES</button>
            </p>
          </form>
        </div>

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
