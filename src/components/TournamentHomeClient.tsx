"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MatchesTable } from "@/components/MatchesTable";
import { FinalsSeatForm } from "@/components/FinalsSeatForm";
import { PlayerAccessPanel } from "@/components/PlayerAccessPanel";
import { ResultUploadForm } from "@/components/ResultUploadForm";
import { StandingsTable } from "@/components/StandingsTable";
import { TournamentWrapUpSection } from "@/components/TournamentWrapUp";
import type { PublicMeta } from "@/lib/public-meta";
import type { PublicTournamentState } from "@/lib/api-types";

function confirmedLine(
  count: number,
  fixtures: boolean,
  matchCount: number,
) {
  if (count === 0) return "No confirmed players yet.";
  if (matchCount > 0)
    return `${count} confirmed player${count === 1 ? "" : "s"} in this draw.`;
  if (!fixtures)
    return `${count} confirmed player${count === 1 ? "" : "s"} — draw runs after registration closes (needs at least two confirmed).`;
  return `${count} confirmed player${count === 1 ? "" : "s"} — fixture list should appear shortly; try refreshing.`;
}

function RulesCard({ rulesMarkdown }: { rulesMarkdown: string }) {
  const lines = rulesMarkdown
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-200 shadow-xl backdrop-blur dark:bg-slate-900/60">
      {lines.length === 0 ? (
        <p className="text-slate-400">Rules will be published here.</p>
      ) : (
        <ul className="list-disc space-y-2 pl-5">
          {lines.map((l, i) => (
            <li key={i} className="text-slate-200">
              {l.replace(/^-+\s*/, "")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TournamentMainContent({ state }: { state: PublicTournamentState }) {
  const starts = new Date(state.registrationStartsAt);
  const ends = new Date(state.registrationEndsAt);
  const tStarts = new Date(state.tournamentStartsAt);
  const tEnds = new Date(state.tournamentEndsAt);
  const endsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(ends);
  const startsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(starts);
  const tStartsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(tStarts);
  const tEndsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(tEnds);
  const publicEventLabel = state.publicEventDateTime
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(state.publicEventDateTime))
    : null;

  return (
    <>
      <header className="relative overflow-hidden border-b border-white/10">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-12 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            Karatina · Community football
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {state.tournamentName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-50/85">
            Create an account once, then each season just save your spot when registration opens.
            You are signed in — full fixtures and table are below, plus your personal panel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg hover:bg-emerald-50"
            >
              My account &amp; spot
            </a>
            <a
              href="#finals-seats"
              className="rounded-xl border border-amber-300/40 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-300/10"
            >
              Book a seat (semis &amp; final day)
            </a>
            <a
              href="#fixtures"
              className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Fixtures &amp; table
            </a>
            {state.tournamentWrapUp ? (
              <a
                href="#tournament-results"
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-400/20"
              >
                Champion &amp; analysis
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-14">
        {state.tournamentStopped ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            This tournament has ended. Check back when a new season opens.
          </div>
        ) : null}
        <section
          id="register"
          className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur sm:p-10 dark:bg-slate-900/60"
        >
          <h2 className="text-2xl font-semibold text-white">Player account &amp; spot</h2>
          <p className="mt-2 text-sm text-slate-400">
            {state.registrationNotStarted ? (
              <>
                Registration opens on{" "}
                <span className="text-slate-200">{startsLabel}</span>. Please
                check back then.
              </>
            ) : state.registrationOpen ? (
              <>
                Registration closes on{" "}
                <span className="text-slate-200">{endsLabel}</span>. An
                administrator must confirm your entry before you are included
                in scheduled games.
              </>
            ) : (
              <>
                Registration closed on{" "}
                <span className="text-slate-200">{endsLabel}</span>
                {state.matches.length > 0
                  ? ". Pairings are listed below in Fixtures & scores."
                  : state.confirmedCount >= 2
                    ? ". At least two players are confirmed — the draw runs automatically after the close time; refresh in a moment if the table is still empty."
                    : ". Pairings are drawn once at least two players are confirmed after registration closes."}
              </>
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">
                Admin approval required
              </p>
              <p className="mt-1">
                After registration, your entry stays pending until an admin
                reviews and confirms it.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">
                Customer care
              </p>
              <p className="mt-1">
                For help call/WhatsApp:{" "}
                <span className="font-semibold">0723355705</span>.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <PlayerAccessPanel
              registrationOpen={state.registrationOpen && !state.tournamentStopped}
              authScreenOnly={false}
              onLogout={() => {
                window.location.reload();
              }}
            />
          </div>
        </section>

        <section id="finals-seats" className="scroll-mt-24 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 shadow-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-amber-100">Book a seat — semifinals &amp; finals day</h2>
          <p className="mt-2 text-sm text-amber-100/80">
            Semifinals and finals are on the same day. Booking is only available after the organiser publishes the event date and venue below.
            {state.publicEventDateTime && state.publicVenue.trim() ? (
              <>
                {" "}
                <span className="font-medium text-amber-50">
                  {publicEventLabel} · {state.publicVenue}
                </span>
              </>
            ) : null}
          </p>
          <div className="mt-4">
            <FinalsSeatForm enabled={state.finalsBookingOpen === true && !state.tournamentStopped} />
          </div>
        </section>

        <section id="results-upload" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-950 dark:text-white">
              Submit match result (screenshot)
            </h2>
            <p className="text-sm text-emerald-900/70 dark:text-slate-400">
              The system reads your screenshot and updates the league table
              automatically—no staff approval needed when validation passes.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur sm:p-8 dark:bg-slate-900/60">
            <ResultUploadForm
              enabled={
                state.fixturesGenerated &&
                !state.tournamentStopped &&
                state.matches.length > 0 &&
                state.tournamentComplete !== true
              }
              tournamentComplete={state.tournamentComplete === true}
            />
          </div>
        </section>

        <section id="fixtures" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950 dark:text-white">
                Fixtures &amp; scores
              </h2>
              <p className="text-sm text-emerald-900/70 dark:text-slate-400">
                Upcoming and completed matches in a clear grid. When
                registration closes, fixtures are generated and kickoffs are
                auto-assigned inside the tournament window.
              </p>
            </div>
            <p className="text-xs text-emerald-900/50 dark:text-slate-500">
              {confirmedLine(
                state.confirmedCount,
                state.fixturesGenerated,
                state.matches.length,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Tournament window: <span className="font-semibold">{tStartsLabel}</span>{" "}
            to <span className="font-semibold">{tEndsLabel}</span> · Slot size:{" "}
            <span className="font-semibold">
              {state.matchDurationMinutes}m + {state.breakMinutes}m gap
            </span>{" "}
            · Total registered:{" "}
            <span className="font-semibold">{state.totalRegistered}</span>
            <span className="mt-1 block text-emerald-900/55 dark:text-slate-500">
              Dates and times follow your device timezone (stored on the server
              as UTC).
            </span>
          </div>
          <MatchesTable
            matches={state.matches}
            confirmedCount={state.confirmedCount}
            fixturesGenerated={state.fixturesGenerated}
            caption="Tournament fixtures and scores"
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-emerald-950 dark:text-white">
              League table
            </h2>
            <p className="text-sm text-emerald-900/70 dark:text-slate-400">
              Points, goals, and ranking update automatically from completed
              results (3 points for a win, 1 for a draw).
            </p>
          </div>
          <StandingsTable standings={state.standings} />
        </section>

        {state.tournamentWrapUp ? (
          <TournamentWrapUpSection wrap={state.tournamentWrapUp} />
        ) : null}

        {!state.registrationOpen ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-950 dark:text-white">
                Tournament rules
              </h2>
              <p className="text-sm text-emerald-900/70 dark:text-slate-400">
                Official rules for this tournament (set by the admin team).
              </p>
            </div>
            <RulesCard rulesMarkdown={state.rulesMarkdown} />
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {publicEventLabel && state.publicVenue.trim().length > 0 ? (
                <p>
                  Date &amp; time: <span className="font-semibold">{publicEventLabel}</span> · Venue:{" "}
                  <span className="font-semibold">{state.publicVenue}</span>
                </p>
              ) : (
                <p className="text-slate-300">
                  The date, time, and venue will be updated to the public whenever it is set.
                </p>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <footer className="border-t border-white/10 bg-slate-950 py-10 text-center text-sm text-slate-500">
        <p>Karatina Football Tournament — organised for the community.</p>
        <p className="mt-2">
          <Link
            href="/admin/login"
            className="text-emerald-500 hover:text-emerald-400"
          >
            Staff login
          </Link>
        </p>
      </footer>
    </>
  );
}

function AuthOnlyScreen({
  meta,
  onAuthenticated,
}: {
  meta: PublicMeta;
  onAuthenticated: () => void;
}) {
  const endsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(meta.registrationEndsAt));
  const startsLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(meta.registrationStartsAt));
  const publicEventLabel = meta.publicEventDateTime
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(meta.publicEventDateTime))
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0c1210] text-slate-100">
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
          Konami Kingdom · Sign in
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{meta.tournamentName}</h1>
        <p className="mt-3 text-sm text-slate-400">
          The tournament site opens after you sign in with your <strong className="text-slate-200">Konami name</strong> and password, or create an account (password entered twice to confirm). Spectators can book a seat below without playing.
        </p>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          {meta.registrationNotStarted ? (
            <>Player registration opens <span className="text-slate-200">{startsLabel}</span>.</>
          ) : meta.registrationOpen ? (
            <>Player spot registration closes <span className="text-slate-200">{endsLabel}</span>.</>
          ) : (
            <>Player registration has closed.</>
          )}
        </div>
        <div id="register" className="mt-8 scroll-mt-24">
          <PlayerAccessPanel
            registrationOpen={meta.registrationOpen && !meta.tournamentStopped}
            authScreenOnly
            onAuthenticated={onAuthenticated}
          />
        </div>
      </div>

      <section
        id="finals-seats"
        className="mx-auto w-full max-w-lg border-t border-white/10 px-4 py-10 sm:max-w-5xl"
      >
        <h2 className="text-lg font-semibold text-amber-100">Book a seat — semifinals &amp; finals day</h2>
        <p className="mt-2 text-sm text-amber-100/80">
          {meta.publicEventDateTime && meta.publicVenue.trim() ? (
            <span className="font-medium text-amber-50">
              {publicEventLabel} · {meta.publicVenue}
            </span>
          ) : (
            "Booking opens when the organiser sets the public event date and venue."
          )}
        </p>
        <div className="mt-4">
          <FinalsSeatForm enabled={meta.finalsBookingOpen && !meta.tournamentStopped} />
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <Link href="/admin/login" className="text-emerald-500 hover:text-emerald-400">
          Staff login
        </Link>
      </footer>
    </div>
  );
}

export function TournamentHomeClient() {
  const [phase, setPhase] = useState<"loading" | "anon" | "in">("loading");
  const [meta, setMeta] = useState<PublicMeta | null>(null);
  const [state, setState] = useState<PublicTournamentState | null>(null);

  const enterApp = useCallback(async () => {
    setPhase("loading");
    try {
      const me = await fetch("/api/player/me", { credentials: "same-origin" });
      if (!me.ok) {
        const m = await fetch("/api/public/meta", { credentials: "same-origin" });
        if (m.ok) {
          setMeta((await m.json()) as PublicMeta);
        } else {
          setMeta(null);
        }
        setState(null);
        setPhase("anon");
        return;
      }
      const st = await fetch("/api/public/state", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!st.ok) throw new Error("state failed");
      setState(await st.json());
      setPhase("in");
    } catch {
      try {
        const m = await fetch("/api/public/meta", { credentials: "same-origin" });
        if (m.ok) {
          setMeta((await m.json()) as PublicMeta);
        } else {
          setMeta(null);
        }
      } catch {
        setMeta(null);
      }
      setState(null);
      setPhase("anon");
    }
  }, []);

  useEffect(() => {
    void enterApp();
  }, [enterApp]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c1210] text-slate-300">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-hidden />
        <p className="mt-4 text-sm">Checking your session…</p>
      </div>
    );
  }

  if (phase === "anon") {
    if (meta) {
      return <AuthOnlyScreen meta={meta} onAuthenticated={enterApp} />;
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0c1210] px-4 text-center text-slate-300">
        <p className="text-sm">Could not load sign-in information. Check your connection and API URL.</p>
        <button
          type="button"
          onClick={() => void enterApp()}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Retry
        </button>
        <Link href="/admin/login" className="text-xs text-emerald-500 hover:text-emerald-400">
          Staff login
        </Link>
      </div>
    );
  }

  if (phase === "in" && state) {
    return <TournamentMainContent state={state} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1210] text-red-300">
      Something went wrong loading the site. Refresh the page.
    </div>
  );
}
