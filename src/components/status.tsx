export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    hit: { cls: "hit", label: "TD! HIT" },
    miss: { cls: "miss", label: "MISS" },
    live: { cls: "live", label: "PLAYING" },
    pending: { cls: "pending", label: "NOT STARTED" },
  };
  const s = map[status] ?? map.pending;
  return <span className={`pill ${s.cls}`}>{s.label}</span>;
}

export function LegCount({
  picks,
}: {
  picks: { status: string }[];
}) {
  const dot = (status: string, i: number) => {
    if (status === "hit") return <span key={i} className="hitdot">&#9679;</span>;
    if (status === "miss") return <span key={i} className="missdot">&#10006;</span>;
    if (status === "live") return <span key={i} className="livedot">&#9679;</span>;
    return <span key={i} className="pendingdot">&#9675;</span>;
  };
  return <div className="legcount">{picks.map((p, i) => dot(p.status, i))}</div>;
}
