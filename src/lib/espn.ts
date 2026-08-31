// Thin, defensive wrapper around ESPN's public (unofficial) NFL JSON endpoints.
// No API key required. Everything here degrades to empty results on failure so
// the site never hard-crashes if ESPN changes shape or is unreachable.

const BASE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

export type SeasonMeta = {
  season: number;
  seasonType: number; // 1 pre, 2 regular, 3 post
  week: number;
};

export type GameTeam = {
  teamId: string;
  abbrev: string;
  displayName: string;
  logo: string | null;
};

export type WeekGame = {
  eventId: string;
  kickoffAt: string; // ISO
  state: "pre" | "in" | "post";
  shortDetail: string;
  home: GameTeam;
  away: GameTeam;
};

export type WeekPlayer = {
  athleteId: string;
  name: string;
  position: string;
  headshot: string | null;
  teamId: string;
  teamAbbrev: string;
  teamName: string;
  opponentAbbrev: string;
  eventId: string;
  kickoffAt: string;
};

// Positions that essentially never score an anytime TD - hide them from the
// picker so the (already enormous) dropdown is a little less absurd.
const HIDE_POSITIONS = new Set([
  "K", "PK", "P", "LS", "C", "G", "OG", "OT", "OL", "T", "G/T", "NT",
]);

// Box-score stat groups that represent an "anytime" TD (rush/rec/return/def).
// NOTE: "passing" is intentionally excluded - a QB's passing TDs do NOT count.
const TD_CATEGORIES = [
  "rushing", "receiving", "kickReturns", "puntReturns", "interceptions", "fumbles", "defensive",
];

// Small in-memory TTL cache. We deliberately avoid Next's Data Cache because
// it persists across requests and does not play well with live-updating sports
// data (a single blocked/empty response would get "stuck" until revalidation).
type CacheEntry = { at: number; value: unknown };
const memCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

async function getJson<T>(url: string, ttlSeconds: number): Promise<T | null> {
  const now = Date.now();
  const cached = memCache.get(url);
  if (cached && now - cached.at < ttlSeconds * 1000) {
    return cached.value as T;
  }
  // De-dupe concurrent identical requests (e.g. many roster fetches).
  const existing = inflight.get(url);
  if (existing) return (await existing) as T | null;

  const task = (async () => {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          accept: "application/json, text/plain, */*",
        },
      });
      if (!res.ok) {
        console.error("[espn] non-ok", res.status, url);
        return null;
      }
      const json = (await res.json()) as T;
      memCache.set(url, { at: Date.now(), value: json });
      return json;
    } catch (e) {
      console.error("[espn] fetch error", url, (e as Error)?.message);
      return null;
    } finally {
      inflight.delete(url);
    }
  })();
  inflight.set(url, task);
  return (await task) as T | null;
}

function normState(state: string | undefined): "pre" | "in" | "post" {
  if (state === "in") return "in";
  if (state === "post") return "post";
  return "pre";
}

/** Detect the current NFL season/week from ESPN's default scoreboard. */
export async function getCurrentMeta(): Promise<SeasonMeta> {
  const data = await getJson<any>(`${BASE}/scoreboard`, 300);
  const season = Number(data?.season?.year) || new Date().getFullYear();
  const seasonType = Number(data?.season?.type) || 2;
  const week = Number(data?.week?.number) || 1;
  return { season, seasonType, week };
}

function parseGame(event: any): WeekGame | null {
  const comp = event?.competitions?.[0];
  if (!comp) return null;
  const competitors = comp.competitors ?? [];
  const homeC = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0];
  const awayC = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1];
  if (!homeC || !awayC) return null;
  const toTeam = (c: any): GameTeam => ({
    teamId: String(c.team?.id ?? ""),
    abbrev: c.team?.abbreviation ?? "??",
    displayName: c.team?.displayName ?? c.team?.name ?? "Unknown",
    logo: c.team?.logo ?? null,
  });
  return {
    eventId: String(event.id),
    kickoffAt: comp.date ?? event.date,
    state: normState(comp.status?.type?.state),
    shortDetail: comp.status?.type?.shortDetail ?? "",
    home: toTeam(homeC),
    away: toTeam(awayC),
  };
}

/** All games for a given week. */
export async function getWeekGames(meta: SeasonMeta): Promise<WeekGame[]> {
  const url = `${BASE}/scoreboard?dates=${meta.season}&seasontype=${meta.seasonType}&week=${meta.week}`;
  const data = await getJson<any>(url, 60);
  const events: any[] = data?.events ?? [];
  return events.map(parseGame).filter((g): g is WeekGame => !!g);
}

async function getRoster(teamId: string): Promise<{ id: string; name: string; position: string; headshot: string | null }[]> {
  const data = await getJson<any>(`${BASE}/teams/${teamId}/roster`, 60 * 60 * 6);
  const groups: any[] = data?.athletes ?? [];
  const out: { id: string; name: string; position: string; headshot: string | null }[] = [];
  for (const group of groups) {
    for (const a of group.items ?? []) {
      const position = a.position?.abbreviation ?? "";
      if (HIDE_POSITIONS.has(position)) continue;
      out.push({
        id: String(a.id),
        name: a.fullName ?? a.displayName ?? "Unknown",
        position,
        headshot: a.headshot?.href ?? null,
      });
    }
  }
  return out;
}

/** Every pickable player for the week, tagged with their game + opponent. */
export async function getWeekPlayers(meta: SeasonMeta): Promise<WeekPlayer[]> {
  const games = await getWeekGames(meta);
  const teamTasks: Promise<WeekPlayer[]>[] = [];

  for (const game of games) {
    const sides: [GameTeam, GameTeam][] = [
      [game.home, game.away],
      [game.away, game.home],
    ];
    for (const [team, opp] of sides) {
      if (!team.teamId) continue;
      teamTasks.push(
        getRoster(team.teamId).then((players) =>
          players.map((p) => ({
            athleteId: p.id,
            name: p.name,
            position: p.position,
            headshot: p.headshot,
            teamId: team.teamId,
            teamAbbrev: team.abbrev,
            teamName: team.displayName,
            opponentAbbrev: opp.abbrev,
            eventId: game.eventId,
            kickoffAt: game.kickoffAt,
          }))
        )
      );
    }
  }

  const nested = await Promise.all(teamTasks);
  return nested.flat();
}

export type EventTdInfo = {
  state: "pre" | "in" | "post";
  tds: Record<string, number>; // athleteId -> anytime TDs
};

/** Anytime TD counts (rush/rec/return/def) per athlete for one game. */
export async function getEventTdInfo(eventId: string): Promise<EventTdInfo> {
  const data = await getJson<any>(`${BASE}/summary?event=${eventId}`, 20);
  const state = normState(data?.header?.competitions?.[0]?.status?.type?.state);
  const tds: Record<string, number> = {};

  const teams: any[] = data?.boxscore?.players ?? [];
  for (const teamBlock of teams) {
    for (const cat of teamBlock.statistics ?? []) {
      const name = String(cat.name ?? "").toLowerCase();
      if (!TD_CATEGORIES.includes(name)) continue;
      const labels: string[] = cat.labels ?? [];
      const tdIndex = labels.findIndex((l) => l.toUpperCase() === "TD");
      if (tdIndex < 0) continue;
      for (const row of cat.athletes ?? []) {
        const id = String(row.athlete?.id ?? "");
        if (!id) continue;
        const raw = row.stats?.[tdIndex];
        const val = parseInt(String(raw ?? "0"), 10);
        if (!Number.isNaN(val) && val > 0) {
          tds[id] = (tds[id] ?? 0) + val;
        }
      }
    }
  }

  return { state, tds };
}
