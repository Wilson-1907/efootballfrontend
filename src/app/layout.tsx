import type { Metadata } from "next";
import "./globals.css";
import { AppBackground } from "@/components/AppBackground";

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
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0c1210] text-slate-100">
        <AppBackground />
        {children}
      </body>
    </html>
  );
}
