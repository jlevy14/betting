export function centsToDollars(cents: number | null | undefined): string {
  if (cents == null) return "$0.00";
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function dollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (cleaned === "") return null;
  const num = Number(cleaned);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

export function seasonTypeLabel(seasonType: number): string {
  if (seasonType === 1) return "Preseason";
  if (seasonType === 3) return "Playoffs";
  return "Week";
}

export function weekLabel(season: number, seasonType: number, weekNum: number): string {
  return `${season} ${seasonTypeLabel(seasonType)} ${weekNum}`;
}

export function formatKickoff(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "TBD";
  // Pin to Eastern time (America/New_York) instead of relying on the
  // server's local zone -- the app runs on a UTC server, so without this
  // every kickoff time would render in UTC regardless of who's viewing it.
  // Using the IANA zone (rather than a hardcoded "EST") also means this
  // automatically flips between EDT/EST across the NFL season.
  return d.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
}
