import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getActiveSkin } from "@/lib/theme";
import { HalloweenDecor } from "@/components/halloween-decor";
import { ThanksgivingDecor } from "@/components/thanksgiving-decor";

export const metadata: Metadata = {
  title: "LETS WIN A BILLION!!! ~ Official League Parlay Tracker ~",
  description:
    "The #1 site on the World Wide Web for tracking our 12-man $12 anytime touchdown parlay. Best viewed in Internet Explorer 6.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const skin = await getActiveSkin();
  const bodyClass =
    skin === "halloween"
      ? "halloween-mode"
      : skin === "thanksgiving"
      ? "thanksgiving-mode"
      : undefined;
  return (
    <html lang="en">
      <body className={bodyClass}>
        {skin === "halloween" ? <HalloweenDecor /> : null}
        {skin === "thanksgiving" ? <ThanksgivingDecor /> : null}
        {children}
      </body>
    </html>
  );
}
