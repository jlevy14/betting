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
      <div className="logo">LETS MAKE A BILLION</div>
      <div className="tagline">
        &#9733; The Official 12-Man $12 Anytime-TD Parlay Tracker &#9733;
      </div>
      <Marquee>
        WELCOME 2 THE BEST FANTASY SITE ON THE INTERNET!!! &nbsp; ONE DOLLAR IN,
        A BILLION DOLLARS OUT (results not guaranteed) &nbsp; PICK A GUY. HE
        SCORES. WE EAT. &nbsp; GO GO GO!!!!
      </Marquee>
    </>
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
        &#128081; COMMISSIONER
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
        &#9888; UNDER CONSTRUCTION &#9888; PARDON OUR DUST &#9888;
      </div>
      <div>
        You are visitor #{" "}
        <span className="counter">{visits.toLocaleString("en-US")}</span>
      </div>
      <div>Best viewed in Internet Explorer 6 at 1024&times;768</div>
      <div>&#169; {new Date().getFullYear()} letsmakeabillion.com &#8212; Made with Notepad &#10084;</div>
      <div className="small">
        For entertainment only. We do not place bets for you and this is not
        affiliated with the NFL or DraftKings. Stats via ESPN.
      </div>
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
