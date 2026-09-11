import Link from "next/link";
import { CompactHeader, Nav, FooterJunk } from "@/components/chrome";
import { getLeaderboard } from "@/lib/league";

export const dynamic = "force-dynamic";

function medal(rank: number): string {
  if (rank === 1) return "\uD83E\uDD47"; // gold
  if (rank === 2) return "\uD83E\uDD48"; // silver
  if (rank === 3) return "\uD83E\uDD49"; // bronze
  return "";
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();
  const anyPicks = rows.some((r) => r.picks > 0);
  const topHits = rows.length ? rows[0].hits : 0;

  return (
    <div id="top">
      <CompactHeader />
      <Nav active="leaderboard" />

      <div className="window" style={{ maxWidth: 760, margin: "0 auto 14px" }}>
        <div className="titlebar">
          <span className="title">
            <span aria-hidden>{"\uD83C\uDFC6"}</span> SEASON LEADERBOARD &#8212; MOST CORRECT PICKS
          </span>
          <span className="buttons">
            <span>_</span>
            <span>&#9633;</span>
            <span>&times;</span>
          </span>
        </div>
        <div className="window-body">
          {!anyPicks ? (
            <div className="sunken center">
              <p style={{ fontWeight: "bold" }}>
                No results yet. Once games are played, the legends (and the
                clowns) will be ranked here.
              </p>
              <p>
                <Link className="navbtn" href="/pick">
                  MAKE A PICK &raquo;
                </Link>
              </p>
            </div>
          ) : (
            <div className="scroll-x">
              <table className="board leaderboard">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>MANAGER</th>
                    <th>&#9989; HITS</th>
                    <th>&#128128; MISSES</th>
                    <th>PICKS</th>
                    <th>HIT %</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const rank = i + 1;
                    const pct =
                      r.picks > 0
                        ? Math.round((r.hits / r.picks) * 100)
                        : 0;
                    const isLeader = r.hits > 0 && r.hits === topHits;
                    return (
                      <tr key={r.memberId}>
                        <td style={{ fontWeight: "bold" }}>
                          {medal(rank)} {rank}
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          {r.displayName}
                          {isLeader ? (
                            <span className="hotnew blink" style={{ marginLeft: 6 }}>
                              LEADER
                            </span>
                          ) : null}
                        </td>
                        <td style={{ color: "#007a00", fontWeight: "bold" }}>
                          {r.hits}
                        </td>
                        <td style={{ color: "#b00000" }}>{r.misses}</td>
                        <td>{r.picks}</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="center small" style={{ marginTop: 8 }}>
            Ranked by total correct picks (touchdowns), then hit rate. Updates
            live as guys score.
          </p>
        </div>
      </div>

      <FooterJunk />
    </div>
  );
}
