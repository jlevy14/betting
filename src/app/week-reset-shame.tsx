"use client";

import { useState } from "react";

type Recap = {
  weekLabel: string;
  missers: string[];
  hits: number;
  totalPicks: number;
  dead: boolean;
  jackpot: boolean;
};

const ROASTS = [
  "played themselves.",
  "let the whole league down.",
  "picked a human traffic cone.",
  "owes everyone an apology.",
  "should be ashamed to show their face.",
  "cost us the bag. Again.",
  "is why we can't have nice things.",
  "belongs on a milk carton for that pick.",
];

function roast(name: string, i: number): string {
  let h = (i * 2654435761) >>> 0;
  for (let k = 0; k < name.length; k++) h = (h * 31 + name.charCodeAt(k)) >>> 0;
  return ROASTS[h % ROASTS.length];
}

// One-time-per-week interstitial: the first time a browser opens the site after
// the week rolled over, it recaps the previous week and publicly roasts the
// people whose picks missed. Dismissing sets a cookie so it won't nag again
// until the NEXT new week.
export function WeekResetShame({
  active,
  weekKey,
  recap,
}: {
  active: boolean;
  weekKey: string;
  recap: Recap;
}) {
  const [open, setOpen] = useState(active);
  if (!active || !open) return null;

  function dismiss() {
    document.cookie = `lmab_seen_week=${encodeURIComponent(
      weekKey
    )}; path=/; max-age=${60 * 60 * 24 * 60}`;
    setOpen(false);
  }

  return (
    <div className="wrs-overlay" role="dialog" aria-modal="true">
      <div className="wrs-modal">
        <div className="wrs-title blink">
          &#128197; NEW WEEK. {recap.weekLabel.toUpperCase()} IS IN THE BOOKS.
        </div>

        {recap.jackpot ? (
          <div className="wrs-jackpot">
            &#129297; WE HIT THE WHOLE PARLAY. Bow to the champions. &#129297;
          </div>
        ) : (
          <>
            <div className="wrs-dead">
              &#128128; LAST WEEK&apos;S TICKET <u>DIED</u> &#128128;
              <div className="wrs-sub">
                {recap.hits}/{recap.totalPicks} legs hit. It only takes one clown
                to kill a billion. Say hello to the clown(s):
              </div>
            </div>
            <ul className="wrs-list">
              {recap.missers.map((n, i) => (
                <li key={n}>
                  <span className="wrs-name">{n.toUpperCase()}</span> {roast(n, i)}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="center" style={{ marginTop: 12 }}>
          <button type="button" className="bigbtn" onClick={dismiss}>
            {recap.jackpot ? "LET'S RUN IT BACK \u00BB" : "I ACCEPT MY SHAME \u00BB"}
          </button>
        </div>
      </div>
    </div>
  );
}
