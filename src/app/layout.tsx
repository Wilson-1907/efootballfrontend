import type { Metadata } from "next";
import "./globals.css";
import { AppBackground } from "@/components/AppBackground";
import { FreeMovingBanner } from "@/components/FreeMovingBanner";

export const metadata: Metadata = {
  title: "Karatina Football Tournament",
  description:
    "Register, follow fixtures, and view league standings for the Karatina community football tournament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const freeBannerEnabled =
    (process.env.NEXT_PUBLIC_FREE_BANNER_ENABLED ?? "true").toLowerCase() !==
    "false";

  const freeBannerMessage =
    process.env.NEXT_PUBLIC_FREE_BANNER_MESSAGE ??
    "FREE up to next month — play now while it’s free!";

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0c1210] text-slate-100">
        <AppBackground />
        <FreeMovingBanner enabled={freeBannerEnabled} message={freeBannerMessage} />
        {children}
      </body>
    </html>
  );
}
