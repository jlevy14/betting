"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 5 * 60 * 1000; // every 5 minutes

// Polls /api/live to pull fresh ESPN data, then refreshes the server-rendered
// board. Runs every 5 minutes so nobody has to hit refresh during Sunday games,
// and pauses while the tab is hidden (re-checking immediately when you return).
export function LiveRefresher() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("connecting to the satellite...");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(tick, POLL_MS);
    }

    async function tick() {
      if (cancelled || busy.current) return;
      // Don't poll a hidden tab; we'll poll again when it becomes visible.
      if (typeof document !== "undefined" && document.hidden) {
        schedule();
        return;
      }
      busy.current = true;
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok) {
          const stamp = new Date().toLocaleTimeString("en-US");
          setStatus(
            data.anyLive ? `LIVE! updated ${stamp}` : `up to date as of ${stamp}`
          );
          router.refresh();
        } else if (!cancelled) {
          setStatus("could not reach ESPN, will retry...");
        }
      } catch {
        if (!cancelled) setStatus("could not reach ESPN, will retry...");
      } finally {
        busy.current = false;
        if (!cancelled) schedule();
      }
    }

    function onVisible() {
      if (!document.hidden && !cancelled) tick();
    }

    tick(); // immediate first check
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return (
    <div className="center small" style={{ marginTop: 6 }}>
      <span className="pill live">&#128225; {status}</span>{" "}
      <span className="small">(auto-updates every 5 min)</span>
    </div>
  );
}
