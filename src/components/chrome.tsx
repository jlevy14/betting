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

export function Nav({ active }: { active: "board" | "pick" | "admin" }) {
  return (
    <div className="navbar">
      <Link className="navbtn" href="/" style={active === "board" ? underline : undefined}>
        &#127968; THE BOARD
      </Link>
      <Link className="navbtn" href="/pick" style={active === "pick" ? underline : undefined}>
        &#9997; MAKE YOUR PICK
      </Link>
      <Link className="navbtn" href="/admin" style={active === "admin" ? underline : undefined}>
        &#128081; HEAD GAMBLER
      </Link>
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
