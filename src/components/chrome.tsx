import { createElement } from "react";
import Link from "next/link";
import { isHalloweenActive } from "@/lib/theme";
import { HalloweenToggle } from "./halloween-toggle";

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

export async function SiteHeader() {
  const halloween = await isHalloweenActive();

  if (halloween) {
    return (
      <>
        <div className="center" style={{ marginBottom: 2 }}>
          {/* the spinning skeleton heads, as promised */}
          <span className="spin" style={{ fontSize: 32 }}>&#128128;</span>
          <span className="hotnew blink">BOO!</span>
          <span className="bob" style={{ fontSize: 28 }}>&#127875;</span>
          <span className="hotnew" style={{ transform: "rotate(8deg)" }}>CURSED!</span>
          <span className="spin" style={{ fontSize: 32 }}>&#128128;</span>
        </div>
        <div className="logo shake logo-hw">LETS WIN A CURSED BILLION</div>
        <div className="tagline blink">
          &#9760;&#9760;&#9760; The Official 12-Man $12 Anytime-TD HAUNTED Parlay Tracker &#9760;&#9760;&#9760;
        </div>
        <div className="center flames">
          &#127875;&#128123;&#129415;&#128378;&#65039;&#128128;&#129499;&#8205;&#9792;&#65039;&#128378;&#65039;&#129415;&#127875;
        </div>
        <Marquee>
          WELCOME 2 THE MOST HAUNTED FANTASY SITE ON THE ENTIRE WORLD WIDE
          WEB!!!1! &nbsp; &#127875; ONE DOLLAR IN, A BILLION DOLLARS OUT (OR A
          HEX, RESULTS DEFINITELY NOT GUARANTEED) &#127875; &nbsp; PICK A GUY.
          HE SCORES. WE EAT. HE MISSES. WE ARE HAUNTED FOREVER. &nbsp; TRICK
          OR TREAT &nbsp; &#9760; SIGN THE CURSED GUESTBOOK &#9760;
        </Marquee>
      </>
    );
  }

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
export async function CompactHeader() {
  const halloween = await isHalloweenActive();

  if (halloween) {
    return (
      <>
        <div className="center" style={{ marginBottom: 2 }}>
          <span className="spin" style={{ fontSize: 24 }}>&#128128;</span>
          <span className="bob" style={{ fontSize: 22 }}>&#127875;</span>
          <span className="spin" style={{ fontSize: 24, animationDirection: "reverse" }}>&#128128;</span>
          <span className="bob" style={{ fontSize: 22 }}>&#127875;</span>
        </div>
        <Marquee>
          &#127875; ONE DOLLAR IN, A BILLION DOLLARS OUT (OR A CURSE, RESULTS
          DEFINITELY NOT GUARANTEED) &#127875; PICK A GUY. HE SCORES. WE EAT.
          &nbsp; TRICK OR TREAT!!!!
        </Marquee>
        <div className="tagline blink">
          &#9760;&#9760;&#9760; LETS WIN A CURSED BILLION &#8212; 12-Man $12 Anytime-TD HAUNTED Parlay Tracker &#9760;&#9760;&#9760;
        </div>
      </>
    );
  }

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

export async function Nav({
  active,
}: {
  active: "board" | "pick" | "leaderboard" | "admin";
}) {
  const halloween = await isHalloweenActive();
  return (
    <div className="navbar">
      <Link className="navbtn" href="/" style={active === "board" ? underline : undefined}>
        {halloween ? "\uD83C\uDF83 THE BOARD" : "\uD83C\uDFE0 THE BOARD"}
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
      <HalloweenToggle active={halloween} />
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

// Minimum streak length (in weeks) before someone gets called out, in either
// direction -- one bad/good week isn't a "streak" yet.
const STREAK_THRESHOLD = 2;

// Bullying for people stuck on a losing (miss) streak, bucketed by how long
// the drought has run. Each tier is meaner than the last -- by the time
// someone hits "max: Infinity" they've earned every bit of it. {n} is always
// a positive number of consecutive misses.
type InsultTier = { max: number; lines: string[] };

const SLUMP_TIERS: InsultTier[] = [
  {
    // 2-3 weeks: a little ribbing, nothing personal yet.
    max: 3,
    lines: [
      "{name} has gone cold for {n} straight weeks. Rough, but recoverable.",
      "{n} weeks, {n} misses for {name}. Due for a bounce-back... probably.",
      "{name} hasn't hit in {n} weeks. Mildly concerning, deeply funny.",
      "{n} consecutive L's for {name}. Maybe try picking the kicker next.",
    ],
  },
  {
    // 4-5 weeks: it's officially a problem.
    max: 5,
    lines: [
      "{n} straight weeks of nothing from {name}. The parlay is starting to notice.",
      "{name} is {n}-for-{n} on whiffing. People are talking.",
      "{name}'s {n}-week slump has its own weather pattern now: pure gloom.",
      "The scouting report on {name}: {n} weeks of pure, uncut disappointment.",
    ],
  },
  {
    // 6-7 weeks: historic levels of failure.
    max: 7,
    lines: [
      "{n} consecutive weeks of disaster for {name}. This is a cry for help.",
      "{name} is an active, certified hazard to this billion -- {n} weeks running.",
      "The league has started a support group for victims of {name}'s {n}-week slump.",
      "Somewhere, a football is relieved it doesn't have to deal with {name} anymore -- {n} straight whiffs.",
    ],
  },
  {
    // 8+ weeks: no more jokes, just devastation.
    max: Infinity,
    lines: [
      "{n} STRAIGHT WEEKS. {name} is no longer a manager, {name} is a cautionary tale.",
      "Scientists studying {name}'s {n}-week slump have classified it as a natural disaster.",
      "{name} has missed {n} weeks in a row. At this point, retirement is a mercy.",
      "{n} weeks of pure, uncut failure. {name}, it's time to let someone else pick.",
    ],
  },
];

// Spookier flavor of the same escalation, used while the Halloween skin is
// active -- still no slurs, just increasingly cursed nonsense.
const SLUMP_TIERS_HALLOWEEN: InsultTier[] = [
  {
    max: 3,
    lines: [
      "{name} has been hexed for {n} straight weeks. A minor curse, so far.",
      "{n} weeks of bad juju for {name}. The pumpkin patch is watching.",
      "{name} hasn't hit in {n} weeks. Something in the graveyard is laughing.",
    ],
  },
  {
    max: 5,
    lines: [
      "{n} straight weeks of darkness for {name}. The crypt keeper is taking notes.",
      "{name} is {n}-for-{n} on getting cursed. The candy bowl is empty for a reason.",
      "{name}'s {n}-week haunting shows no sign of lifting.",
    ],
  },
  {
    max: 7,
    lines: [
      "{n} weeks possessed by failure. {name} needs an exorcism, not a pep talk.",
      "{name} is a walking curse on this billion -- {n} weeks and counting.",
      "The cauldron bubbles every time {name} misses. That's {n} weeks of bubbling.",
    ],
  },
  {
    max: Infinity,
    lines: [
      "{n} STRAIGHT WEEKS OF DAMNATION. {name} is not cursed, {name} IS the curse.",
      "The ghosts have unionized against {name} -- {n} weeks of coordinated haunting.",
      "{name} has been dead weight for {n} weeks. Even the skeletons are embarrassed.",
    ],
  },
];

// Praise for people on a winning (hit) streak -- also escalates, just upward.
const HEAT_TIERS: InsultTier[] = [
  {
    max: 3,
    lines: [
      "{name} is {n}-for-{n} and somehow still humble about it. Respect.",
      "{n} straight hits for {name}. Somebody check their crystal ball.",
    ],
  },
  {
    max: 5,
    lines: [
      "{name} has hit {n} weeks in a row. Certified league menace.",
      "All hail {name}: {n}-week hit streak and counting.",
    ],
  },
  {
    max: 7,
    lines: [
      "{name} is COOKING -- {n} straight weeks of touchdowns. Buy stock now.",
      "{n} for {n}. {name} might actually be cheating. (They're not. They're just better.)",
    ],
  },
  {
    max: Infinity,
    lines: [
      "{name} is on a heater of biblical proportions: {n} weeks, {n} hits, zero doubt.",
      "The rest of the league is on upset watch -- {name} just extended it to {n} in a row. Unstoppable.",
    ],
  },
];

function pickTier(tiers: InsultTier[], n: number): string[] {
  return (tiers.find((t) => n <= t.max) ?? tiers[tiers.length - 1]).lines;
}

function streakLine(
  name: string,
  n: number,
  seed: number,
  bad: boolean,
  halloween: boolean
): string {
  const bank = bad
    ? pickTier(halloween ? SLUMP_TIERS_HALLOWEEN : SLUMP_TIERS, n)
    : pickTier(HEAT_TIERS, n);
  let h = seed >>> 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return bank[h % bank.length]
    .replace(/\{name\}/g, name.toUpperCase())
    .replace(/\{n\}/g, String(n));
}

export type StreakRow = { displayName: string; streak: number };

// Scrolling ticker that bullies anyone on a 2+ week miss streak and hypes up
// anyone on a 2+ week hit streak. The bullying gets progressively nastier the
// longer the slump runs. Quietly does nothing if nobody qualifies.
export async function StreakTicker({ rows }: { rows: StreakRow[] }) {
  const halloween = await isHalloweenActive();
  const slumping = rows.filter((r) => r.streak <= -STREAK_THRESHOLD);
  const heating = rows.filter((r) => r.streak >= STREAK_THRESHOLD);
  if (slumping.length === 0 && heating.length === 0) return null;

  return (
    <div className="streak-ticker">
      {heating.length > 0 ? (
        <div className="streak-hot">
          <Marquee>
            {heating.map((r, i) => (
              <span key={r.displayName} style={{ marginRight: 40 }}>
                &#128293; {streakLine(r.displayName, r.streak, i * 2654435761, false, halloween)}
              </span>
            ))}
          </Marquee>
        </div>
      ) : null}
      {slumping.length > 0 ? (
        <div className="streak-cold">
          <Marquee>
            {slumping.map((r, i) => (
              <span key={r.displayName} style={{ marginRight: 40 }}>
                {halloween ? "\uD83D\uDC80" : "\uD83E\uDD98"}{" "}
                {streakLine(r.displayName, -r.streak, i * 2654435761, true, halloween)}
              </span>
            ))}
          </Marquee>
        </div>
      ) : null}
    </div>
  );
}

const underline: React.CSSProperties = {
  textDecoration: "underline",
  background: "#ffff99",
};

export async function FooterJunk() {
  const visits = 1_000_000 - 12; // "almost a billion visitors"
  const halloween = await isHalloweenActive();
  return (
    <div className="footer-junk">
      <hr className="fancy" />
      <div className="construction blink">
        {halloween
          ? <>&#127875;&#128123; THE CRYPT IS UNDER CONSTRUCTION &#128123;&#127875; PARDON OUR GHOSTS &#127875;&#128123;</>
          : <>&#9888;&#128679; UNDER CONSTRUCTION &#128679;&#9888; PARDON OUR DUST &#9888;&#128679;</>}
      </div>
      <div className="flames">
        {halloween
          ? "\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}\u{1F383}"
          : "\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}\u{1F525}"}
      </div>

      <div>
        You are visitor #{" "}
        <span className="counter">{visits.toLocaleString("en-US")}</span>{" "}
        <span className="hotnew">{halloween ? "to rise from the grave!" : "so far!"}</span>
      </div>

      <div className="guestbook">
        <span className="bob" style={{ fontSize: 20 }}>&#9997;</span>{" "}
        <a href="#guestbook">{halloween ? "SIGN MY CURSED GUESTBOOK" : "SIGN MY GUESTBOOK"}</a>{" "}
        &nbsp;|&nbsp;{" "}
        <a href="#webring">&laquo; PARLAY WEBRING &raquo;</a> &nbsp;|&nbsp;{" "}
        <a href="#top">BACK 2 TOP</a>
      </div>

      <div>
        {halloween
          ? "Best viewed by candlelight at 1024\u00d7768 (RIP IE6, gone but not forgotten)"
          : "Best viewed in Internet Explorer 6 at 1024\u00d7768"}
      </div>
      <div>&#169; {new Date().getFullYear()} letswinabillion.com &#8212; Made with Notepad &#10084; &#8212; Powered by VIBES</div>
      <div className="small">
        For entertainment only. We do not place bets for you and this is not
        affiliated with the NFL or DraftKings. Stats via ESPN. Please gamble
        responsibly (or don&apos;t, we&apos;re not your dad).
      </div>

      <Marquee>
        {halloween
          ? "\u{1F383} THANKS 4 VISITING THE CRYPT \u{1F383} COME BACK SOON (OR WE WILL FIND YOU) \u{1F383} DON'T FORGET 2 PAY UR DOLLAR OR FACE THE CURSE \u{1F383} THIS SITE IS 100% HAUNTED \u{1F383}"
          : "\u2B50 THANKS 4 VISITING \u2B50 COME BACK SOON \u2B50 DON'T FORGET 2 PAY UR DOLLAR \u2B50 THIS SITE IS 100% RADICAL \u2B50"}
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
