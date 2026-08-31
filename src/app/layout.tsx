import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LETS MAKE A BILLION!!! ~ Official League Parlay Tracker ~",
  description:
    "The #1 site on the World Wide Web for tracking our 12-man $12 anytime touchdown parlay. Best viewed in Internet Explorer 6.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
