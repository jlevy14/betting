"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  checkPassword,
  grantAccess,
  hasAccess,
  revokeAccess,
} from "@/lib/auth";
import { getWeekPlayers } from "@/lib/espn";
import {
  getOrCreateActiveWeek,
  syncWeekLive,
  weekMeta,
} from "@/lib/league";
import { dollarsToCents } from "@/lib/format";

// ---------------------------------------------------------------- auth

export async function loginLeague(formData: FormData): Promise<void> {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword("league", pw)) {
    redirect("/pick?error=" + encodeURIComponent("WRONG PASSWORD. Try again, champ."));
  }
  await grantAccess("league");
  redirect("/pick");
}

export async function loginCommish(formData: FormData): Promise<void> {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword("commish", pw)) {
    redirect("/admin?error=" + encodeURIComponent("Nope. Commissioner only."));
  }
  await grantAccess("commish");
  redirect("/admin");
}

export async function logoutLeague(): Promise<void> {
  await revokeAccess("league");
  redirect("/pick");
}

export async function logoutCommish(): Promise<void> {
  await revokeAccess("commish");
  redirect("/admin");
}

// ---------------------------------------------------------------- picks

export async function submitPick(formData: FormData): Promise<void> {
  if (!(await hasAccess("league"))) {
    redirect("/pick?error=" + encodeURIComponent("Enter the league password first."));
  }

  const memberId = String(formData.get("memberId") ?? "");
  const athleteId = String(formData.get("athleteId") ?? "");

  if (!memberId || !athleteId) {
    redirect("/pick?error=" + encodeURIComponent("Pick your name AND a player."));
  }

  const week = await getOrCreateActiveWeek();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    redirect("/pick?error=" + encodeURIComponent("That manager doesn't exist."));
  }

  // Resolve the player from ESPN server-side (don't trust the client's labels).
  const players = await getWeekPlayers(weekMeta(week));
  const player = players.find((p) => p.athleteId === athleteId);
  if (!player) {
    redirect("/pick?error=" + encodeURIComponent("That player isn't playing this week."));
  }

  const now = Date.now();
  const kickoff = new Date(player.kickoffAt);
  if (!Number.isNaN(kickoff.getTime()) && kickoff.getTime() <= now) {
    redirect(
      "/pick?error=" +
        encodeURIComponent(`${player.name}'s game already kicked off. Locked!`)
    );
  }

  // If this manager already has a locked pick, they can't change it.
  const existing = await prisma.pick.findUnique({
    where: { weekId_memberId: { weekId: week.id, memberId: member!.id } },
  });
  if (existing && existing.kickoffAt.getTime() <= now) {
    redirect(
      "/pick?error=" +
        encodeURIComponent("Your current pick's game already started. No takebacks.")
    );
  }

  // Is the player already taken by someone else?
  const taken = await prisma.pick.findUnique({
    where: { weekId_espnAthleteId: { weekId: week.id, espnAthleteId: athleteId } },
  });
  if (taken && taken.memberId !== member!.id) {
    redirect(
      "/pick?error=" +
        encodeURIComponent(`${player.name} is already taken. No duplicates!`)
    );
  }

  const data = {
    espnAthleteId: player.athleteId,
    playerName: player.name,
    position: player.position,
    nflTeam: player.teamAbbrev,
    opponent: player.opponentAbbrev,
    espnEventId: player.eventId,
    kickoffAt: kickoff,
    status: "pending",
    gameState: "pre",
    scoredTds: 0,
    isManual: false,
  };

  try {
    await prisma.pick.upsert({
      where: { weekId_memberId: { weekId: week.id, memberId: member!.id } },
      update: data,
      create: { weekId: week.id, memberId: member!.id, ...data },
    });
  } catch {
    redirect("/pick?error=" + encodeURIComponent("Couldn't save that pick. Maybe it got taken?"));
  }

  revalidatePath("/");
  revalidatePath("/pick");
  redirect(
    "/pick?ok=" +
      encodeURIComponent(`${member!.displayName} is riding with ${player.name}!`)
  );
}

// ---------------------------------------------------------------- admin

async function requireCommish(): Promise<void> {
  if (!(await hasAccess("commish"))) {
    redirect("/admin?error=" + encodeURIComponent("Commissioner only."));
  }
}

export async function adminSetNames(formData: FormData): Promise<void> {
  await requireCommish();
  const members = await prisma.member.findMany({ orderBy: { sortOrder: "asc" } });
  await Promise.all(
    members.map((m) => {
      const raw = String(formData.get(`name_${m.id}`) ?? "").trim();
      const displayName = raw || m.displayName;
      if (displayName === m.displayName) return Promise.resolve(m);
      return prisma.member.update({ where: { id: m.id }, data: { displayName } });
    })
  );
  revalidatePath("/");
  revalidatePath("/pick");
  redirect("/admin?ok=" + encodeURIComponent("Names updated."));
}

export async function adminSetPayout(formData: FormData): Promise<void> {
  await requireCommish();
  const week = await getOrCreateActiveWeek();
  const payoutRaw = String(formData.get("payout") ?? "");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const dkPayoutCents = payoutRaw.trim() === "" ? null : dollarsToCents(payoutRaw);

  await prisma.week.update({
    where: { id: week.id },
    data: { dkPayoutCents, payoutCaption: caption, notes },
  });
  revalidatePath("/");
  redirect("/admin?ok=" + encodeURIComponent("Payout saved. LET'S GET RICH."));
}

export async function adminOverridePick(formData: FormData): Promise<void> {
  await requireCommish();
  const pickId = String(formData.get("pickId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!pickId) redirect("/admin");

  if (status === "auto") {
    await prisma.pick.update({
      where: { id: pickId },
      data: { isManual: false },
    });
    const week = await getOrCreateActiveWeek();
    await syncWeekLive(week.id);
  } else if (["hit", "miss", "live", "pending"].includes(status)) {
    await prisma.pick.update({
      where: { id: pickId },
      data: {
        status,
        isManual: true,
        scoredTds: status === "hit" ? Math.max(1, 1) : 0,
      },
    });
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent("Leg updated."));
}

export async function adminClearPick(formData: FormData): Promise<void> {
  await requireCommish();
  const pickId = String(formData.get("pickId") ?? "");
  if (pickId) {
    await prisma.pick.delete({ where: { id: pickId } }).catch(() => {});
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent("Pick cleared."));
}

export async function adminSyncNow(): Promise<void> {
  await requireCommish();
  const week = await getOrCreateActiveWeek();
  await syncWeekLive(week.id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent("Synced with ESPN."));
}
