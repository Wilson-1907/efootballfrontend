import type { TournamentWrapUp as WrapUp } from "@/lib/api-types";

export function TournamentWrapUpSection({ wrap }: { wrap: WrapUp }) {
  const { champion, runnerUp, thirdPlace, stats, goldenBoot, bestDefense } =
    wrap;

  return (
    <section
      id="tournament-results"
      className="scroll-mt-24 space-y-6 rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-500/15 via-slate-900/60 to-slate-900/80 p-6 shadow-xl backdrop-blur sm:p-10"
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300/90">
          Tournament complete
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Champion
        </h2>
        <p className="mt-3 text-2xl font-semibold text-amber-200 sm:text-3xl">
          {champion.playerName}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {champion.points} points · {champion.played} played · {champion.won}W{" "}
          {champion.drawn}D {champion.lost}L · GF {champion.goalsFor} GA{" "}
          {champion.goalsAgainst} · GD{" "}
          {champion.goalDifference > 0 ? "+" : ""}
          {champion.goalDifference}
        </p>
      </div>

      {(runnerUp || thirdPlace) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {runnerUp ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Runner-up
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {runnerUp.playerName}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {runnerUp.points} pts · GD{" "}
                {runnerUp.goalDifference > 0 ? "+" : ""}
                {runnerUp.goalDifference}
              </p>
            </div>
          ) : null}
          {thirdPlace ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Third place
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                {thirdPlace.playerName}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {thirdPlace.points} pts
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 sm:px-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-300/90">
          Tournament analysis
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-200">
          {wrap.analysis.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Matches"
          value={String(stats.totalMatches)}
          hint="All fixtures finished"
        />
        <StatCard
          label="Total goals"
          value={String(stats.totalGoals)}
          hint={`${stats.avgGoalsPerMatch} per match avg`}
        />
        <StatCard
          label="Draws"
          value={String(stats.draws)}
          hint="Level after full time"
        />
        {stats.biggestWin ? (
          <StatCard
            label="Biggest win"
            value={stats.biggestWin.scoreline}
            hint={`${stats.biggestWin.winnerName} vs ${stats.biggestWin.loserName}`}
          />
        ) : (
          <StatCard label="Biggest win" value="—" hint="No decisive margins" />
        )}
      </div>

      {(goldenBoot && goldenBoot.goals > 0) || bestDefense ? (
        <div className="flex flex-wrap justify-center gap-4 text-center text-sm">
          {goldenBoot && goldenBoot.goals > 0 ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-emerald-300/90">
                Golden boot
              </p>
              <p className="mt-1 font-semibold text-white">
                {goldenBoot.playerName}
              </p>
              <p className="text-slate-400">{goldenBoot.goals} goals</p>
            </div>
          ) : null}
          {bestDefense ? (
            <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-sky-300/90">
                Best defense
              </p>
              <p className="mt-1 font-semibold text-white">
                {bestDefense.playerName}
              </p>
              <p className="text-slate-400">
                {bestDefense.goalsAgainst} conceded
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
