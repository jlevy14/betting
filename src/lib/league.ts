import "server-only";
import { prisma } from "@/lib/db";
import {
  getCurrentMeta,
  getEventTdInfo,
  getWeekGames,
  type SeasonMeta,
} from "@/lib/espn";
import { weekLabel } from "@/lib/format";
import type { Member, Pick, Week } from "@prisma/client";

export const LEAGUE_SIZE = 12;
export const ENTRY_DOLLARS = 12; // $1 per member

const DEFAULT_MEMBER_NAMES = Array.from(
  { length: LEAGUE_SIZE },
  (_, i) => `Manager ${i + 1}`
);

/** Create the 12 league members if the table is empty. */
export async function ensureMembers(): Promise<void> {
  const count = await prisma.member.count();
  if (count > 0) return;
  await prisma.member.createMany({
    data: DEFAULT_MEMBER_NAMES.map((displayName, sortOrder) => ({
      displayName,
      sortOrder,
    })),
  });
}

/** Detect the current NFL week and make sure a matching, active Week row exists. */
export async function getOrCreateActiveWeek(): Promise<Week> {
  await ensureMembers();
  const meta = await getCurrentMeta();

  const week = await prisma.week.upsert({
    where: {
      season_seasonType_weekNum: {
        season: meta.season,
        seasonType: meta.seasonType,
        weekNum: meta.week,
      },
    },
    update: {},
    create: {
      season: meta.season,
      seasonType: meta.seasonType,
      weekNum: meta.week,
      label: weekLabel(meta.season, meta.seasonType, meta.week),
      isActive: true,
    },
  });

  if (!week.isActive) {
    await prisma.week.updateMany({
      where: { isActive: true, NOT: { id: week.id } },
      data: { isActive: false },
    });
    return prisma.week.update({ where: { id: week.id }, data: { isActive: true } });
  }
  // Make sure no stale week is also flagged active.
  await prisma.week.updateMany({
    where: { isActive: true, NOT: { id: week.id } },
    data: { isActive: false },
  });
  return week;
}

export function weekMeta(week: Week): SeasonMeta {
  return { season: week.season, seasonType: week.seasonType, week: week.weekNum };
}

/**
 * Pull live TD data from ESPN for every game that has a pick in this week and
 * update pick statuses. Commissioner overrides (isManual) are left untouched.
 */
export async function syncWeekLive(weekId: string): Promise<void> {
  const picks = await prisma.pick.findMany({ where: { weekId } });
  const eventIds = Array.from(
    new Set(picks.map((p) => p.espnEventId).filter((id) => id))
  );
  if (eventIds.length === 0) return;

  const infos = new Map<string, Awaited<ReturnType<typeof getEventTdInfo>>>();
  await Promise.all(
    eventIds.map(async (id) => {
      infos.set(id, await getEventTdInfo(id));
    })
  );

  await Promise.all(
    picks.map(async (pick) => {
      if (pick.isManual) return;
      const info = pick.espnEventId ? infos.get(pick.espnEventId) : undefined;
      const gameState = info?.state ?? "pre";
      const tds = info?.tds[pick.espnAthleteId] ?? 0;

      let status: string;
      if (tds > 0) status = "hit";
      else if (gameState === "post") status = "miss";
      else if (gameState === "in") status = "live";
      else status = "pending";

      if (
        pick.status === status &&
        pick.gameState === gameState &&
        pick.scoredTds === tds
      ) {
        return; // no change, skip the write
      }

      await prisma.pick.update({
        where: { id: pick.id },
        data: { status, gameState, scoredTds: tds },
      });
    })
  );
}

export type PickRow = Pick & { member: Member };

export type BoardData = {
  week: Week;
  picks: PickRow[];
  picksMade: number;
  hits: number;
  misses: number;
  live: number;
  pending: number;
  alive: boolean;
  jackpot: boolean; // all 12 legs hit
  anyLive: boolean;
  payoutCents: number | null;
  perShareCents: number | null;
  earliestKickoff: Date | null;
};

export async function getBoardData(week: Week): Promise<BoardData> {
  const picks = (await prisma.pick.findMany({
    where: { weekId: week.id },
    include: { member: true },
    orderBy: { member: { sortOrder: "asc" } },
  })) as PickRow[];

  const hits = picks.filter((p) => p.status === "hit").length;
  const misses = picks.filter((p) => p.status === "miss").length;
  const live = picks.filter((p) => p.status === "live").length;
  const pending = picks.filter((p) => p.status === "pending").length;
  const alive = misses === 0;
  const jackpot = picks.length === LEAGUE_SIZE && hits === LEAGUE_SIZE;

  const payoutCents = week.dkPayoutCents ?? null;
  const perShareCents =
    payoutCents != null ? Math.round(payoutCents / LEAGUE_SIZE) : null;

  const kickoffs = picks
    .map((p) => p.kickoffAt)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    week,
    picks,
    picksMade: picks.length,
    hits,
    misses,
    live,
    pending,
    alive,
    jackpot,
    anyLive: picks.some((p) => p.gameState === "in"),
    payoutCents,
    perShareCents,
    earliestKickoff: kickoffs[0] ?? null,
  };
}

// How long before the week's first kickoff the Wall of Shame turns on.
const SHAME_LEAD_MS = 8 * 60 * 60 * 1000; // 8 hours

export type ShameInfo = {
  active: boolean;
  firstKickoff: Date | null;
  deadbeats: string[]; // display names of members with no pick this week
};

/**
 * Figures out who hasn't picked yet, but only "activates" starting 8 hours
 * before the first kickoff of the week. Everything is scoped to the given week,
 * so it empties as people pick and resets automatically each new week.
 */
export async function getShameInfo(week: Week): Promise<ShameInfo> {
  const games = await getWeekGames(weekMeta(week));
  const kicks = games
    .map((g) => new Date(g.kickoffAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const firstKickoff = kicks[0] ?? null;

  const now = Date.now();
  const active =
    !!firstKickoff && now >= firstKickoff.getTime() - SHAME_LEAD_MS;

  if (!active) {
    return { active: false, firstKickoff, deadbeats: [] };
  }

  const members = await prisma.member.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const picks = await prisma.pick.findMany({
    where: { weekId: week.id },
    select: { memberId: true },
  });
  const picked = new Set(picks.map((p) => p.memberId));
  const deadbeats = members
    .filter((m) => !picked.has(m.id))
    .map((m) => m.displayName);

  return { active: true, firstKickoff, deadbeats };
}

export type LeaderRow = {
  memberId: string;
  displayName: string;
  hits: number;
  misses: number;
  picks: number;
};

/** Season-long standings: who has the most correct (hit) picks across all weeks. */
export async function getLeaderboard(): Promise<LeaderRow[]> {
  const members = await prisma.member.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const picks = await prisma.pick.findMany({
    select: { memberId: true, status: true },
  });

  const tally = new Map<string, { hits: number; misses: number; picks: number }>();
  for (const m of members) tally.set(m.id, { hits: 0, misses: 0, picks: 0 });
  for (const p of picks) {
    const t = tally.get(p.memberId);
    if (!t) continue;
    t.picks += 1;
    if (p.status === "hit") t.hits += 1;
    else if (p.status === "miss") t.misses += 1;
  }

  return members
    .map((m) => {
      const t = tally.get(m.id)!;
      return { memberId: m.id, displayName: m.displayName, ...t };
    })
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        b.hits / (b.picks || 1) - a.hits / (a.picks || 1) ||
        a.displayName.localeCompare(b.displayName)
    );
}

export type WeekRecap = {
  weekLabel: string;
  weekKey: string;
  missers: string[];
  hits: number;
  totalPicks: number;
  jackpot: boolean;
  dead: boolean;
};

/** Key that uniquely identifies a week (used to detect "new week" per browser). */
export function weekKey(week: Week): string {
  return `${week.season}-${week.seasonType}-${week.weekNum}`;
}

/**
 * Recap of the most recent NON-active week, used for the "welcome back to a new
 * week" humiliation. Returns null if there's no prior week with picks.
 */
export async function getPreviousWeekRecap(
  activeWeek: Week
): Promise<WeekRecap | null> {
  const weeks = await listWeeks(); // newest first
  const prev = weeks.find((w) => w.id !== activeWeek.id);
  if (!prev) return null;

  const picks = await prisma.pick.findMany({
    where: { weekId: prev.id },
    include: { member: true },
    orderBy: { member: { sortOrder: "asc" } },
  });
  if (picks.length === 0) return null;

  const missers = picks
    .filter((p) => p.status === "miss")
    .map((p) => p.member.displayName);
  const hits = picks.filter((p) => p.status === "hit").length;
  const jackpot = picks.length === LEAGUE_SIZE && hits === LEAGUE_SIZE;

  return {
    weekLabel: weekLabel(prev.season, prev.seasonType, prev.weekNum),
    weekKey: weekKey(prev),
    missers,
    hits,
    totalPicks: picks.length,
    jackpot,
    dead: missers.length > 0,
  };
}

export async function listWeeks(): Promise<Week[]> {
  return prisma.week.findMany({
    orderBy: [{ season: "desc" }, { seasonType: "desc" }, { weekNum: "desc" }],
  });
}

export async function findWeek(
  season: number,
  seasonType: number,
  weekNum: number
): Promise<Week | null> {
  return prisma.week.findUnique({
    where: {
      season_seasonType_weekNum: { season, seasonType, weekNum },
    },
  });
}
