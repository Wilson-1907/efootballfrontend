import Link from "next/link";
import { cache } from "react";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MatchesTable } from "@/components/MatchesTable";
import { RegisterForm } from "@/components/RegisterForm";
import { ResultUploadForm } from "@/components/ResultUploadForm";
import { StandingsTable } from "@/components/StandingsTable";
import { SplashGate } from "@/components/SplashGate";
import { TournamentWrapUpSection } from "@/components/TournamentWrapUp";
import type { PublicTournamentState } from "@/lib/api-types";

export const dynamic = "force-dynamic";

async function loadPublicState(): Promise<PublicTournamentState> {
  const base = process.env.API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "API_URL is not set. Point it at the backend (e.g. http://127.0.0.1:4000).",
    );
  }
  const res = await fetch(`${base}/api/public/state`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Tournament API failed (${res.status})`);
  }
  return res.json() as Promise<PublicTournamentState>;
}

const getPublicState = cache(loadPublicState);

export default async function HomePage() {
  const state = await getPublicState();

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
    <SplashGate splashSrc="/efootball1.jpeg" ms={3000}>
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
            Register for the local tournament, follow fixtures as they drop, and
            track live standings—all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg hover:bg-emerald-50"
            >
              Register
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
          <h2 className="text-2xl font-semibold text-white">Player registration</h2>
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
            <RegisterForm
              registrationOpen={
                state.registrationOpen && !state.tournamentStopped
              }
            />
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
    </SplashGate>
  );
}

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
