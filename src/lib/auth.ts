import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const LEAGUE_COOKIE = "lmab_league";
const COMMISH_COOKIE = "lmab_commish";

type Role = "league" | "commish";

function secretFor(role: Role): string {
  if (role === "commish") {
    return process.env.COMMISH_PASSWORD || "changeme";
  }
  return process.env.LEAGUE_PASSWORD || "letsgo";
}

// A deterministic token derived from the password. The raw password is never
// stored in the cookie, and the token can't be forged without knowing it.
function tokenFor(role: Role): string {
  return createHmac("sha256", secretFor(role)).update(`lmab:${role}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Compare a user-supplied password against the configured one. */
export function checkPassword(role: Role, supplied: string): boolean {
  return safeEqual(supplied ?? "", secretFor(role));
}

const cookieName: Record<Role, string> = {
  league: LEAGUE_COOKIE,
  commish: COMMISH_COOKIE,
};

export async function grantAccess(role: Role): Promise<void> {
  const store = await cookies();
  store.set(cookieName[role], tokenFor(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120, // ~ a full NFL season
  });
}

export async function revokeAccess(role: Role): Promise<void> {
  const store = await cookies();
  store.delete(cookieName[role]);
}

export async function hasAccess(role: Role): Promise<boolean> {
  const store = await cookies();
  const val = store.get(cookieName[role])?.value;
  if (!val) return false;
  return safeEqual(val, tokenFor(role));
}
