import "server-only";
import { cookies } from "next/headers";
import { THEME_COOKIE } from "./theme-cookie";

export type ThemeMode = "auto" | "halloween" | "normal";

/**
 * The cheesy seasonal window: all of October, plus a couple grace days into
 * November for stragglers who haven't taken their decorations down yet.
 */
function isHalloweenSeason(now: Date = new Date()): boolean {
  const month = now.getMonth(); // 0-indexed; 9 = October
  const day = now.getDate();
  return month === 9 || (month === 10 && day <= 2);
}

/** Reads the visitor's explicit skin override, if they've set one. */
export async function getThemeMode(): Promise<ThemeMode> {
  const store = await cookies();
  const raw = store.get(THEME_COOKIE)?.value;
  return raw === "halloween" || raw === "normal" ? raw : "auto";
}

/**
 * Whether the Halloween skin should render right now. An explicit toggle
 * (via the SPOOKY MODE button) always wins; otherwise the site auto-equips
 * its cursed costume for the whole month of October.
 */
export async function isHalloweenActive(): Promise<boolean> {
  const mode = await getThemeMode();
  if (mode === "halloween") return true;
  if (mode === "normal") return false;
  return isHalloweenSeason();
}
