"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Polls /api/live to pull fresh ESPN data, then refreshes the server-rendered
// board when something changed. Polls fast while games are live, slow otherwise.
export function LiveRefresher() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("connecting to the satellite...");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      let nextDelay = 60_000;
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok) {
          nextDelay = data.anyLive ? 30_000 : 60_000;
          const stamp = new Date().toLocaleTimeString("en-US");
          setStatus(
            data.anyLive
              ? `LIVE! updated ${stamp}`
              : `up to date as of ${stamp}`
          );
          router.refresh();
        } else if (!cancelled) {
          setStatus("could not reach ESPN, retrying...");
        }
      } catch {
        if (!cancelled) setStatus("could not reach ESPN, retrying...");
      }
      if (!cancelled) {
        timer.current = setTimeout(tick, nextDelay);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  return (
    <div className="center small" style={{ marginTop: 6 }}>
      <span className="pill live">&#128225; {status}</span>
    </div>
  );
}
