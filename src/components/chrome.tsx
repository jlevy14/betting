import { createElement } from "react";
import Link from "next/link";

// <marquee> is deprecated HTML with no React JSX typing - build it manually.
function Marquee({ children }: { children: React.ReactNode }) {
  return createElement(
    "marquee",
    { scrollamount: "7", behavior: "scroll", direction: "left" },
    children
  );
}

export function Window({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="window">
      <div className="titlebar">
        <span className="title">
          <span aria-hidden>{icon ?? "\uD83C\uDFC8"}</span>
          {title}
        </span>
        <span className="buttons">
          <span>_</span>
          <span>&#9633;</span>
          <span>&times;</span>
        </span>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="center" style={{ marginBottom: 2 }}>
        <span className="spin" style={{ fontSize: 30 }}>&#127944;</span>
        <span className="hotnew blink">HOT!</span>
        <span className="bob" style={{ fontSize: 26 }}>&#128176;</span>
        <span className="hotnew" style={{ transform: "rotate(8deg)" }}>NEW!</span>
        <span className="spin" style={{ fontSize: 30 }}>&#127944;</span>
      </div>
      <div className="logo shake">LETS WIN A BILLION</div>
      <div className="tagline blink">
        &#9733;&#9733;&#9733; The Official 12-Man $12 Anytime-TD Parlay Tracker &#9733;&#9733;&#9733;
      </div>
      <div className="center flames">
        &#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;
      </div>
      <Marquee>
        WELCOME 2 THE BEST FANTASY SITE ON THE ENTIRE WORLD WIDE WEB!!!1! &nbsp;
        &#128176; ONE DOLLAR IN, A BILLION DOLLARS OUT (results DEFINITELY not
        guaranteed) &#128176; &nbsp; PICK A GUY. HE SCORES. WE EAT. &nbsp; GO GO
        GO!!!! &nbsp; TELL UR FRIENDS &nbsp; &#9733; SIGN THE GUESTBOOK &#9733;
      </Marquee>
    </>
  );
}

// Heinous (but not hateful) roasts for people who haven't picked yet.
const SHAME_INSULTS = [
  "{name} is a spineless, mouth-breathing coward who's scared of a DROPDOWN.",
  "Still nothing from {name}. Weak grip, weak mind, weak bloodline.",
  "{name} would drop a wide-open touchdown and then blame the sun. PICK. NOW.",
  "The league drags {name} around like dead weight every single week. Pathetic.",
  "{name} folds under the pressure of ONE little click. Absolutely feeble.",
  "BREAKING: {name} has the football IQ of a soggy gas-station napkin.",
  "{name} is out here fumbling life itself. Make a pick, you gutless clown.",
  "Everyone agrees {name} is the reason we can't have nice things.",
  "{name} ghosts the parlay the same way they ghost every responsibility. Shameful.",
  "{name}: always last, always sweating, always a bottom-feeder.",
  "{name} couldn't find the 'MAKE A PICK' button with two hands and a flashlight.",
  "History will remember {name} as the deadbeat who cost us the billion.",
];

function insultFor(name: string, seed: number): string {
  let h = seed >>> 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SHAME_INSULTS[h % SHAME_INSULTS.length].replace(
    /\{name\}/g,
    name.toUpperCase()
  );
}

// The Wall of Shame: fires 8h before first kickoff, names + roasts everyone who
// hasn't picked. Disappears per-person the moment they pick.
export function ShameWall({ names }: { names: string[] }) {
  if (!names || names.length === 0) return null;
  const scroll = names
    .map((n) => `\uD83D\uDCA9 ${n.toUpperCase()} STILL HASN'T PICKED \uD83D\uDCA9`)
    .join(" \u2022 ");
  return (
    <div className="shame-wall">
      <div className="shame-title blink">
        &#128680;&#128680; WALL OF SHAME &#8212; PICK OR PERISH &#128680;&#128680;
      </div>
      <Marquee>
        {scroll} &#8212; {scroll}
      </Marquee>
      <ul className="shame-list">
        {names.map((n, i) => (
          <li key={n}>
            <span className="shame-name">{n.toUpperCase()}</span>{" "}
            {insultFor(n, i * 2654435761)}
          </li>
        ))}
      </ul>
      <div className="shame-foot blink">
        &#9888; {names.length} DEADBEAT{names.length === 1 ? "" : "S"} LEFT.
        GO TO &ldquo;MAKE A PICK&rdquo; BEFORE KICKOFF OR STAY A COWARD FOREVER.
      </div>
    </div>
  );
}

// Slimmer header for the board so the page fits on one screen. The loud
// decorations live in the sidebar (SidebarJunk) instead of stacked up top.
export function CompactHeader() {
  return (
    <>
      <Marquee>
        &#128176; ONE DOLLAR IN, A BILLION DOLLARS OUT (results DEFINITELY not
        guaranteed) &#128176; PICK A GUY. HE SCORES. WE EAT. &nbsp; GO GO GO!!!!
      </Marquee>
      <div className="tagline blink">
        &#9733;&#9733;&#9733; LETS WIN A BILLION &#8212; 12-Man $12 Anytime-TD Parlay Tracker &#9733;&#9733;&#9733;
      </div>
    </>
  );
}

// All the obnoxious 2003 junk, packed into the sidebar column.
export function SidebarJunk() {
  const visits = 1_000_000 - 12;
  return (
    <div className="window">
      <div className="titlebar">
        <span className="title">
          <span aria-hidden>{"\uD83C\uDFC8"}</span> EXTRAS.EXE
        </span>
        <span className="buttons">
          <span>_</span>
          <span>&times;</span>
        </span>
      </div>
      <div className="window-body sidebar-body">
        <div className="center" style={{ marginBottom: 4 }}>
          <span className="spin" style={{ fontSize: 26 }}>&#127944;</span>
          <span className="hotnew blink">HOT!</span>
          <span className="bob" style={{ fontSize: 22 }}>&#128176;</span>
          <span className="hotnew" style={{ transform: "rotate(8deg)" }}>NEW!</span>
        </div>
        <div className="center flames">&#128293;&#128293;&#128293;&#128293;&#128293;</div>

        <div className="badges">
          <span className="badge ie">Best viewed in<br /><b>IE 6</b></span>
          <span className="badge ns">Netscape<br /><b>NOW!</b></span>
          <span className="badge html"><b>HTML</b><br />4 EVER</span>
          <span className="badge notepad">Made with<br /><b>Notepad</b></span>
        </div>

        <div className="center" style={{ margin: "6px 0" }}>
          Visitor #<br />
          <span className="counter">{visits.toLocaleString("en-US")}</span>
        </div>

        <div className="guestbook center">
          <span className="bob" style={{ fontSize: 18 }}>&#9997;</span>{" "}
          <a href="#guestbook">SIGN GUESTBOOK</a>
          <br />
          <a href="#webring">&laquo; PARLAY WEBRING &raquo;</a>
        </div>

        <div className="construction blink center" style={{ marginTop: 6 }}>
          &#9888; UNDER CONSTRUCTION &#9888;
        </div>
        <div className="center small" style={{ marginTop: 6 }}>
          &#169; {new Date().getFullYear()} letswinabillion.com
          <br />
          Made with Notepad &#10084; Powered by VIBES
        </div>
      </div>
    </div>
  );
}

export function Nav({
  active,
}: {
  active: "board" | "pick" | "leaderboard" | "admin";
}) {
  return (
    <div className="navbar">
      <Link className="navbtn" href="/" style={active === "board" ? underline : undefined}>
        &#127968; THE BOARD
      </Link>
      <Link className="navbtn" href="/pick" style={active === "pick" ? underline : undefined}>
        &#9997; MAKE YOUR PICK
      </Link>
      <Link
        className="navbtn"
        href="/leaderboard"
        style={active === "leaderboard" ? underline : undefined}
      >
        &#127942; LEADERBOARD
      </Link>
      <Link className="navbtn" href="/admin" style={active === "admin" ? underline : undefined}>
        &#128081; HEAD GAMBLER
      </Link>
    </div>
  );
}

// Roasts for managers whose picked player laid an egg (missed).
const MISS_INSULTS = [
  "picked a guy who forgot how to score. Brickfingered.",
  "bet on a literal ghost. Zero. Zilch. Coward's pick.",
  "whiffed so hard the wind knocked over a stadium.",
  "single-handedly threatened the billion. Unforgivable.",
  "chose a player allergic to the end zone. Embarrassing.",
  "made a pick so bad it belongs in a museum of failure.",
  "got cooked. Somewhere a scout is laughing at them.",
  "fumbled the assignment. A stain on this proud league.",
];

function missInsult(name: string, i: number): string {
  let h = (i * 2654435761) >>> 0;
  for (let k = 0; k < name.length; k++) h = (h * 31 + name.charCodeAt(k)) >>> 0;
  return MISS_INSULTS[h % MISS_INSULTS.length];
}

// Scrolling shame ticker for anyone whose pick has already missed this week.
export function MissScroller({ names }: { names: string[] }) {
  if (!names || names.length === 0) return null;
  return (
    <div className="miss-scroller">
      <Marquee>
        {names.map((n, i) => (
          <span key={n} style={{ marginRight: 40 }}>
            &#128128; <b>{n.toUpperCase()}</b> {missInsult(n, i)}
          </span>
        ))}
        {names.map((n, i) => (
          <span key={n + "-2"} style={{ marginRight: 40 }}>
            &#128128; <b>{n.toUpperCase()}</b> {missInsult(n, i)}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

const underline: React.CSSProperties = {
  textDecoration: "underline",
  background: "#ffff99",
};

export function FooterJunk() {
  const visits = 1_000_000 - 12; // "almost a billion visitors"
  return (
    <div className="footer-junk">
      <hr className="fancy" />
      <div className="construction blink">
        &#9888;&#128679; UNDER CONSTRUCTION &#128679;&#9888; PARDON OUR DUST &#9888;&#128679;
      </div>
      <div className="flames">
        &#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;&#128293;
      </div>

      <div>
        You are visitor #{" "}
        <span className="counter">{visits.toLocaleString("en-US")}</span>{" "}
        <span className="hotnew">so far!</span>
      </div>

      <div className="guestbook">
        <span className="bob" style={{ fontSize: 20 }}>&#9997;</span>{" "}
        <a href="#guestbook">SIGN MY GUESTBOOK</a> &nbsp;|&nbsp;{" "}
        <a href="#webring">&laquo; PARLAY WEBRING &raquo;</a> &nbsp;|&nbsp;{" "}
        <a href="#top">BACK 2 TOP</a>
      </div>

      <div>Best viewed in Internet Explorer 6 at 1024&times;768</div>
      <div>&#169; {new Date().getFullYear()} letswinabillion.com &#8212; Made with Notepad &#10084; &#8212; Powered by VIBES</div>
      <div className="small">
        For entertainment only. We do not place bets for you and this is not
        affiliated with the NFL or DraftKings. Stats via ESPN. Please gamble
        responsibly (or don&apos;t, we&apos;re not your dad).
      </div>

      <Marquee>
        &#11088; THANKS 4 VISITING &#11088; COME BACK SOON &#11088; DON&apos;T
        FORGET 2 PAY UR DOLLAR &#11088; THIS SITE IS 100% RADICAL &#11088;
      </Marquee>
    </div>
  );
}

export function Alert({
  ok,
  err,
}: {
  ok?: string | null;
  err?: string | null;
}) {
  if (!ok && !err) return null;
  return (
    <>
      {ok ? <div className="alert ok">&#9989; {ok}</div> : null}
      {err ? <div className="alert err">&#10060; {err}</div> : null}
    </>
  );
}
