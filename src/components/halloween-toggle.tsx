"use client";

import { useRouter } from "next/navigation";
import { THEME_COOKIE } from "@/lib/theme-cookie";

/** Lets any visitor cursed with good taste flip the Halloween skin on or off. */
export function HalloweenToggle({ active }: { active: boolean }) {
  const router = useRouter();

  function toggle() {
    const next = active ? "normal" : "halloween";
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <button
      type="button"
      className="navbtn hw-toggle"
      onClick={toggle}
      title="Toggle the cheesiest skin on the entire internet"
    >
      {active ? "\u2600\uFE0F EXIT SPOOKY MODE" : "\uD83C\uDF83 SPOOKY MODE"}
    </button>
  );
}
