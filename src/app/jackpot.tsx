"use client";

import { useEffect } from "react";

// Emojis rained down + fireworks when all 12 legs hit.
const DROP_EMOJI = [
  "\u{1F4B5}", // dollar bills
  "\u{1F4B0}", // money bag
  "\u{1F911}", // money mouth
  "\u{1F389}", // party popper
  "\u{1F38A}", // confetti ball
  "\u2B50", // star
  "\u{1F3C8}", // football
  "\u{1F48E}", // gem
];
const FIRE_EMOJI = ["\u{1F386}", "\u{1F387}", "\u2728", "\u{1F4A5}"];

export function JackpotCelebration({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;

    document.body.classList.add("jackpot-mode");

    const overlay = document.createElement("div");
    overlay.className = "jackpot-overlay";
    document.body.appendChild(overlay);

    // Money / confetti rain.
    const DROPS = 90;
    for (let i = 0; i < DROPS; i++) {
      const s = document.createElement("span");
      s.className = "drop";
      s.textContent = DROP_EMOJI[Math.floor(Math.random() * DROP_EMOJI.length)];
      s.style.left = Math.random() * 100 + "vw";
      const dur = 2.5 + Math.random() * 3.5;
      s.style.animationDuration = dur + "s";
      s.style.animationDelay = -Math.random() * dur + "s";
      s.style.fontSize = 18 + Math.random() * 30 + "px";
      overlay.appendChild(s);
    }

    // Periodic firework bursts.
    const fw = window.setInterval(() => {
      const f = document.createElement("span");
      f.className = "firework";
      f.textContent = FIRE_EMOJI[Math.floor(Math.random() * FIRE_EMOJI.length)];
      f.style.left = 8 + Math.random() * 84 + "vw";
      f.style.top = 8 + Math.random() * 55 + "vh";
      f.style.fontSize = 34 + Math.random() * 40 + "px";
      overlay.appendChild(f);
      window.setTimeout(() => f.remove(), 1000);
    }, 300);

    return () => {
      window.clearInterval(fw);
      overlay.remove();
      document.body.classList.remove("jackpot-mode");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="jackpot-megatext">
      <span aria-hidden>&#129297;</span> WE ARE BILLIONAIRES{" "}
      <span aria-hidden>&#129297;</span>
    </div>
  );
}
