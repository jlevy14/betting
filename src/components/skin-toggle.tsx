"use client";

import { useRouter } from "next/navigation";
import { THEME_COOKIE } from "@/lib/theme-cookie";
import type { ActiveSkin } from "@/lib/theme";

/**
 * Lets any visitor flip a seasonal skin on or off. Each button controls its
 * own skin (halloween / thanksgiving) but they share one cookie, so turning
 * one on automatically turns the other off.
 */
export function SkinToggle({
  skin,
  active,
  onLabel,
  offLabel,
  title,
}: {
  skin: ActiveSkin;
  active: boolean;
  onLabel: string;
  offLabel: string;
  title: string;
}) {
  const router = useRouter();

  function toggle() {
    const next = active ? "normal" : skin;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <button type="button" className="navbtn hw-toggle" onClick={toggle} title={title}>
      {active ? offLabel : onLabel}
    </button>
  );
}
