import Link from "next/link";
import "./admin.css";
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

function Badge({ status }: { status: string }) {
  const label: Record<string, string> = {
    hit: "TD / Hit",
    miss: "Miss",
    live: "Playing",
    pending: "Not started",
  };
  return <span className={`hg-badge ${status}`}>{label[status] ?? status}</span>;
}

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
      <div className="adminpage">
        <div className="hg-login">
          <div className="hg-topbar" style={{ borderRadius: "16px 16px 0 0", marginBottom: 0 }}>
            <div>
              <h1>&#127920; Head Gambler</h1>
              <div className="sub">Restricted console</div>
            </div>
          </div>
          <div className="hg-card" style={{ borderRadius: "0 0 16px 16px" }}>
            {err ? <div className="hg-alert err">{err}</div> : null}
            {ok ? <div className="hg-alert ok">{ok}</div> : null}
            <p className="help">Enter the Head Gambler password to manage the league.</p>
            <form action={loginCommish}>
              <div className="hg-field">
                <label>Password</label>
                <input type="password" name="password" autoFocus placeholder="Head Gambler password" />
              </div>
              <button type="submit">Sign in</button>
              <Link href="/" style={{ marginLeft: 12 }}>Back to the site</Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const week = await getOrCreateActiveWeek();
  const members = await prisma.member.findMany({ orderBy: { sortOrder: "asc" } });
  const board = await getBoardData(week);

  return (
    <div className="adminpage">
      <div className="hg-topbar">
        <div>
          <h1>&#127920; Head Gambler Console</h1>
          <div className="sub">
            {weekLabel(week.season, week.seasonType, week.weekNum)} &middot;{" "}
            {board.picksMade}/{members.length} picks in
          </div>
        </div>
        <div className="hg-actions">
          <Link href="/" style={{ color: "#e5e7eb" }}>
            View public board &#8599;
          </Link>
          <form action={logoutCommish}>
            <button type="submit" className="btn-ghost btn-sm">Log out</button>
          </form>
        </div>
      </div>

      {ok ? <div className="hg-alert ok">{ok}</div> : null}
      {err ? <div className="hg-alert err">{err}</div> : null}

      {/* PAYOUT */}
      <div className="hg-card">
        <h2>&#128181; DraftKings payout</h2>
        <p className="help">
          After you place the $12 / 12-leg anytime-TD parlay, enter the total
          &ldquo;To Win&rdquo; amount. Each of the {members.length} managers gets an
          equal share.
        </p>
        <form action={adminSetPayout}>
          <div className="hg-grid2">
            <div className="hg-field">
              <label>Total to win ($)</label>
              <input
                type="text"
                name="payout"
                placeholder="e.g. 48372.44"
                defaultValue={
                  week.dkPayoutCents != null ? (week.dkPayoutCents / 100).toFixed(2) : ""
                }
              />
              {week.dkPayoutCents != null ? (
                <div className="hg-hint">
                  {centsToDollars(week.dkPayoutCents)} total &middot;{" "}
                  {centsToDollars(Math.round(week.dkPayoutCents / members.length))} each
                </div>
              ) : null}
            </div>
            <div className="hg-field">
              <label>Ticket caption (optional)</label>
              <input
                type="text"
                name="caption"
                placeholder="e.g. +4030300 odds"
                defaultValue={week.payoutCaption ?? ""}
              />
            </div>
          </div>
          <div className="hg-field">
            <label>Notes (optional)</label>
            <textarea name="notes" rows={2} defaultValue={week.notes ?? ""} />
          </div>
          <button type="submit">Save payout</button>
        </form>
      </div>

      {/* LIVE STATS */}
      <div className="hg-card">
        <h2>&#128202; Live stats</h2>
        <p className="help">
          The public board auto-updates every 5 minutes. Force a fresh pull from
          ESPN anytime.
        </p>
        <div className="hg-stats">
          <div className="hg-stat hit">
            <div className="n">{board.hits}</div>
            <div className="l">Hit</div>
          </div>
          <div className="hg-stat miss">
            <div className="n">{board.misses}</div>
            <div className="l">Miss</div>
          </div>
          <div className="hg-stat live">
            <div className="n">{board.live}</div>
            <div className="l">Playing</div>
          </div>
          <div className="hg-stat">
            <div className="n">{board.pending}</div>
            <div className="l">Not started</div>
          </div>
        </div>
        <form action={adminSyncNow}>
          <button type="submit" className="btn-secondary">Sync with ESPN now</button>
        </form>
      </div>

      {/* OVERRIDES */}
      <div className="hg-card">
        <h2>&#9998; Picks &amp; manual overrides</h2>
        <p className="help">
          Use overrides only if ESPN is wrong or someone fat-fingered a pick.
          Setting a status manually stops auto-sync from changing it; choose
          &ldquo;Auto&rdquo; to hand it back to ESPN.
        </p>
        {board.picks.length === 0 ? (
          <p className="hg-muted">No picks yet this week.</p>
        ) : (
          <div className="hg-scroll">
            <table className="hg-table">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th>Player</th>
                  <th>Kickoff</th>
                  <th>Status</th>
                  <th>Set</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {board.picks.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.member.displayName}</td>
                    <td>
                      {p.playerName}{" "}
                      <span className="hg-muted">
                        {p.position} &middot; {p.nflTeam}
                      </span>
                    </td>
                    <td className="hg-muted">{formatKickoff(p.kickoffAt)}</td>
                    <td>
                      <Badge status={p.status} />
                      {p.isManual ? <span className="hg-muted"> (manual)</span> : null}
                    </td>
                    <td>
                      <form action={adminOverridePick} className="hg-row-actions">
                        <input type="hidden" name="pickId" value={p.id} />
                        <select name="status" defaultValue="" className="btn-sm" style={{ width: "auto" }}>
                          <option value="" disabled>Set…</option>
                          <option value="hit">Hit</option>
                          <option value="miss">Miss</option>
                          <option value="live">Playing</option>
                          <option value="pending">Not started</option>
                          <option value="auto">Auto (ESPN)</option>
                        </select>
                        <button type="submit" className="btn-secondary btn-sm">Apply</button>
                      </form>
                    </td>
                    <td>
                      <form action={adminClearPick}>
                        <input type="hidden" name="pickId" value={p.id} />
                        <button type="submit" className="btn-danger btn-sm">Clear</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NAMES */}
      <div className="hg-card">
        <h2>&#128100; League members</h2>
        <p className="help">
          Rename the {members.length} managers. These appear in the pick dropdown
          and on the public board.
        </p>
        <form action={adminSetNames}>
          <div className="names-grid">
            {members.map((m, i) => (
              <div className="hg-field" key={m.id} style={{ marginBottom: 4 }}>
                <label>Manager {i + 1}</label>
                <input type="text" name={`name_${m.id}`} defaultValue={m.displayName} />
              </div>
            ))}
          </div>
          <button type="submit" style={{ marginTop: 12 }}>Save names</button>
        </form>
      </div>
    </div>
  );
}
