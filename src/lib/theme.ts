import "server-only";

export type ActiveSkin = "halloween" | "thanksgiving" | "normal";

/** The cheesy Halloween window: all of October. */
function isHalloweenSeason(now: Date = new Date()): boolean {
  return now.getMonth() === 9; // 0-indexed; 9 = October
}

/** The cheesy Thanksgiving window: all of November. */
function isThanksgivingSeason(now: Date = new Date()): boolean {
  return now.getMonth() === 10; // 0-indexed; 10 = November
}

/**
 * Which skin renders right now. Purely calendar-driven -- cursed in
 * October, stuffed in November -- with no visitor override. Whatever the
 * calendar says is the only view available.
 */
export async function getActiveSkin(): Promise<ActiveSkin> {
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
