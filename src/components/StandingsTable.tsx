import type { StandingsRow } from "@/lib/api-types";

export function StandingsTable({
  standings,
  variant = "public",
}: {
  standings: StandingsRow[];
  variant?: "public" | "admin-readonly";
}) {
  const isDark = variant === "admin-readonly";

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr
            className={
              isDark
                ? "border-b border-white/10 text-slate-400"
                : "border-b border-emerald-900/10 bg-emerald-50/80 text-emerald-900/70 dark:bg-white/5 dark:text-slate-400"
            }
          >
            <th className="py-3 pl-4 pr-2 font-semibold">#</th>
            <th className="py-3 pr-3 font-semibold">Konami name</th>
            <th className="py-3 pr-3 font-semibold">P</th>
            <th className="py-3 pr-3 font-semibold">W</th>
            <th className="py-3 pr-3 font-semibold">D</th>
            <th className="py-3 pr-3 font-semibold">L</th>
            <th className="py-3 pr-3 font-semibold">GF</th>
            <th className="py-3 pr-3 font-semibold">GA</th>
            <th className="py-3 pr-3 font-semibold">GD</th>
            <th className="py-3 pr-4 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className={
                  isDark
                    ? "py-10 text-center text-slate-500"
                    : "py-10 text-center text-emerald-900/50 dark:text-slate-500"
                }
              >
                Standings appear after results are recorded for completed games.
              </td>
            </tr>
          ) : (
            standings.map((row, i) => (
              <tr
                key={row.playerId}
                className={
                  isDark
                    ? "border-b border-white/5 hover:bg-white/[0.02]"
                    : `border-b border-emerald-900/5 ${i % 2 === 0 ? "bg-white/60 dark:bg-white/[0.02]" : "bg-emerald-50/40 dark:bg-transparent"}`
                }
              >
                <td
                  className={
                    isDark
                      ? "py-3 pl-4 pr-2 text-slate-400"
                      : "py-3 pl-4 pr-2 text-emerald-900/60 dark:text-slate-400"
                  }
                >
                  {row.rank}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-3 font-medium text-white"
                      : "py-3 pr-3 font-medium text-emerald-950 dark:text-white"
                  }
                >
                  {row.playerName}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.played}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.won}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.drawn}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.lost}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.goalsFor}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.goalsAgainst}
                </td>
                <td
                  className={
                    isDark ? "py-3 pr-3 text-slate-300" : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {row.goalDifference}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-4 text-right font-semibold text-emerald-300"
                      : "py-3 pr-4 text-right font-semibold text-emerald-700 dark:text-emerald-300"
                  }
                >
                  {row.points}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
