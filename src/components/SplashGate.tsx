"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IntroNavEffect } from "@/components/IntroNavEffect";

type Props = {
  splashSrc: string;
  ms: number;
  children: React.ReactNode;
};

export function SplashGate({ splashSrc, ms, children }: Props) {
  const [stage, setStage] = useState<"splash" | "intro" | "site">("splash");

  useEffect(() => {
    const t = window.setTimeout(() => setStage("intro"), ms);
    return () => window.clearTimeout(t);
  }, [ms]);

  if (stage === "splash") {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        <div className="relative h-full w-full">
          <Image
            src={splashSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/40" />
        </div>
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="relative min-h-screen bg-[#06130f] text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <div className="rounded-3xl border border-emerald-400/25 bg-slate-900/70 p-6 shadow-2xl backdrop-blur sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
              Welcome participants
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Konami Kingdom Tournament
            </h1>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              We are featuring <span className="font-semibold text-white">100 participants</span>.
              Players will play half of the league games, then the table eliminates
              players. Top 8 secure direct places to the round of 16, while positions
              9 to 24 enter the round of 32. Knockout fixtures are randomly assigned.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-amber-200">Winner</p>
                <p className="mt-1 text-xl font-bold text-amber-100">KSh 8,000</p>
              </div>
              <div className="rounded-xl border border-slate-300/40 bg-slate-200/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-200">1st runner-up</p>
                <p className="mt-1 text-xl font-bold text-white">KSh 5,000</p>
              </div>
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-emerald-200">Top scorer</p>
                <p className="mt-1 text-xl font-bold text-emerald-100">KSh 2,000</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg font-semibold text-white">Rules</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                <li>Only registered and admin-approved players can compete.</li>
                <li>League phase determines eliminations and seeding.</li>
                <li>Top 8 go directly to round of 16.</li>
                <li>Ranks 9 to 24 enter the round of 32 knockout bracket.</li>
                <li>Knockout fixtures are assigned randomly by the system.</li>
                <li>Entry to the semifinals and finals is KSh 100, and food is provided.</li>
              </ul>
            </div>

            <p className="mt-5 text-sm font-semibold text-red-300">
              Slots are very limited.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("kk_register_tab", "signup");
                  setStage("site");
                }}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg hover:bg-emerald-400"
              >
                Create an account
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("kk_register_tab", "login");
                  setStage("site");
                }}
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("kk_intro_hash", "finals-seats");
                  setStage("site");
                }}
                className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-500/30"
              >
                Book a seat
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Booking opens only after the organiser sets the semifinal/final day (public date &amp; venue) on the site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <IntroNavEffect />
      {children}
    </>
  );
}

