type MatchPublic = {
  id: string;
  round: number;
  phase?: "league" | "knockout";
  stage?: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: Date | string | null;
  home: { name: string };
  away: { name: string };
};

function formatWhen(iso: Date | string | null): string {
  if (!iso) return "TBC";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "TBC";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function scoreCell(
  status: string,
  home: number | null,
  away: number | null,
): string {
  if (status === "completed" && home != null && away != null)
    return `${home} – ${away}`;
  return "—";
}

function stageLabel(stage?: string): string {
  if (!stage) return "";
  if (stage === "league") return "League";
  if (stage === "round_of_32") return "Round of 32";
  if (stage === "round_of_16") return "Round of 16";
  if (stage === "quarter_final") return "Quarter-final";
  if (stage === "semi_final") return "Semi-final";
  if (stage === "final") return "Final";
  return stage.replace(/_/g, " ");
}

export function MatchesTable({
  matches,
  caption,
  variant = "public",
  confirmedCount,
  fixturesGenerated,
}: {
  matches: MatchPublic[];
  caption?: string;
  variant?: "public" | "admin-readonly";
  confirmedCount?: number;
  fixturesGenerated?: boolean;
}) {
  const isDark = variant === "admin-readonly";

  const emptyMessage = (() => {
    if ((confirmedCount ?? 0) < 2) {
      return "The draw needs at least two confirmed players. Once both are confirmed and registration has closed, fixtures appear here automatically.";
    }
    if (fixturesGenerated === false) {
      return "Registration is still open or the draw has not run yet. Fixtures appear here after the registration deadline.";
    }
    return "Fixtures are being generated. Refresh the page in a few seconds.";
  })();

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr
            className={
              isDark
                ? "border-b border-white/10 text-slate-400"
                : "border-b border-emerald-900/10 bg-emerald-50/80 text-emerald-900/70 dark:bg-white/5 dark:text-slate-400"
            }
          >
            <th className="py-3 pl-4 pr-3 font-semibold">When</th>
            <th className="py-3 pr-3 font-semibold">Phase</th>
            <th className="py-3 pr-3 font-semibold">Home</th>
            <th className="py-3 pr-3 font-semibold">Away</th>
            <th className="py-3 pr-4 text-right font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {matches.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className={
                  isDark
                    ? "py-10 text-center text-slate-500"
                    : "py-10 text-center text-emerald-900/50 dark:text-slate-500"
                }
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            matches.map((m, i) => (
              <tr
                key={m.id}
                className={
                  isDark
                    ? "border-b border-white/5 hover:bg-white/[0.02]"
                    : `border-b border-emerald-900/5 ${i % 2 === 0 ? "bg-white/60 dark:bg-white/[0.02]" : "bg-emerald-50/40 dark:bg-transparent"}`
                }
              >
                <td
                  className={
                    isDark
                      ? "py-3 pl-4 pr-3 text-slate-400"
                      : "py-3 pl-4 pr-3 text-emerald-900/70 dark:text-slate-400"
                  }
                >
                  {formatWhen(m.scheduledAt)}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-3 text-slate-300"
                      : "py-3 pr-3 text-emerald-900/80 dark:text-slate-300"
                  }
                >
                  {stageLabel(m.stage)}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-3 font-medium text-white"
                      : "py-3 pr-3 font-medium text-emerald-950 dark:text-white"
                  }
                >
                  {m.home.name}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-3 font-medium text-white"
                      : "py-3 pr-3 font-medium text-emerald-950 dark:text-white"
                  }
                >
                  {m.away.name}
                </td>
                <td
                  className={
                    isDark
                      ? "py-3 pr-4 text-right font-mono text-slate-200"
                      : "py-3 pr-4 text-right font-mono text-emerald-900 dark:text-slate-200"
                  }
                >
                  {scoreCell(m.status, m.homeScore, m.awayScore)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
