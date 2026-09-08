"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type PlayerOpt = {
  id: string;
  name: string;
  position: string;
  team: string;
  opp: string;
  kickoffLabel: string;
  started: boolean;
  takenBy: string | null;
};

// Type-to-search player picker. Writes the chosen player's ESPN id into a
// hidden <input name="athleteId"> so the existing server action keeps working.
export function PlayerSearch({ players }: { players: PlayerOpt[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PlayerOpt | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name);
      })
      .slice(0, 25);
  }, [query, players]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(p: PlayerOpt) {
    if (p.started || p.takenBy) return;
    setSelected(p);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="psearch" ref={boxRef}>
      <input type="hidden" name="athleteId" value={selected?.id ?? ""} />

      {selected ? (
        <div className="psearch-selected">
          <span>
            &#9989; <b>{selected.name}</b> ({selected.position}) &mdash;{" "}
            {selected.team} vs {selected.opp}
          </span>
          <button
            type="button"
            className="psearch-clear"
            onClick={() => {
              setSelected(null);
              setOpen(false);
            }}
          >
            change
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            className="psearch-input"
            placeholder="Start typing a player's name..."
            value={query}
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const p = results[active];
                if (p) choose(p);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />

          {open && query.trim().length >= 2 ? (
            <ul className="psearch-list">
              {results.length === 0 ? (
                <li className="psearch-empty">
                  no players match &ldquo;{query}&rdquo;
                </li>
              ) : (
                results.map((p, i) => {
                  const disabled = p.started || !!p.takenBy;
                  return (
                    <li
                      key={p.id}
                      className={
                        "psearch-item" +
                        (i === active ? " active" : "") +
                        (disabled ? " disabled" : "")
                      }
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        choose(p);
                      }}
                    >
                      <span className="psearch-name">{p.name}</span>{" "}
                      <span className="psearch-meta">
                        {p.position} &middot; {p.team} vs {p.opp} &middot;{" "}
                        {p.kickoffLabel}
                      </span>
                      {p.takenBy ? (
                        <span className="psearch-tag">TAKEN by {p.takenBy}</span>
                      ) : p.started ? (
                        <span className="psearch-tag">game started</span>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
