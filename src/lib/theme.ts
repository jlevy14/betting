import "server-only";
import { cookies } from "next/headers";
import { THEME_COOKIE } from "./theme-cookie";

export type ThemeMode = "auto" | "halloween" | "thanksgiving" | "normal";
export type ActiveSkin = "halloween" | "thanksgiving" | "normal";

/** The cheesy Halloween window: all of October. */
function isHalloweenSeason(now: Date = new Date()): boolean {
  return now.getMonth() === 9; // 0-indexed; 9 = October
}

/** The cheesy Thanksgiving window: all of November. */
function isThanksgivingSeason(now: Date = new Date()): boolean {
  return now.getMonth() === 10; // 0-indexed; 10 = November
}

/** Reads the visitor's explicit skin override, if they've set one. */
export async function getThemeMode(): Promise<ThemeMode> {
  const store = await cookies();
  const raw = store.get(THEME_COOKIE)?.value;
  return raw === "halloween" || raw === "thanksgiving" || raw === "normal"
    ? raw
    : "auto";
}

/**
 * Which skin should render right now. An explicit toggle (via one of the
 * skin buttons) always wins; otherwise the site auto-equips a costume based
 * on the calendar -- cursed in October, stuffed in November.
 */
export async function getActiveSkin(): Promise<ActiveSkin> {
  const mode = await getThemeMode();
  if (mode === "halloween" || mode === "thanksgiving" || mode === "normal") {
    return mode;
  }
  if (isThanksgivingSeason()) return "thanksgiving";
  if (isHalloweenSeason()) return "halloween";
  return "normal";
}

/** Whether the Halloween skin should render right now. */
export async function isHalloweenActive(): Promise<boolean> {
  return (await getActiveSkin()) === "halloween";
}

/** Whether the Thanksgiving skin should render right now. */
export async function isThanksgivingActive(): Promise<boolean> {
  return (await getActiveSkin()) === "thanksgiving";
}
