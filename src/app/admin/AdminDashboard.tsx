"use client";

import { useMemo, useState } from "react";
import type { StandingsRow } from "@/lib/api-types";

type PlayerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  konamiName: string;
  paid: boolean;
  status: string;
  createdAt: string;
};

type MatchRow = {
  id: string;
  round: number;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string | null;
  status: string;
  home: { id: string; name: string };
  away: { id: string; name: string };
};

export type AdminOverviewInitial = {
  settings: {
    tournamentName: string;
    registrationStartsAt: string;
    registrationEndsAt: string;
    fixturesGenerated: boolean;
    tournamentStartsAt: string;
    tournamentEndsAt: string;
    matchDurationMinutes: number;
    breakMinutes: number;
    rulesMarkdown: string;
    tournamentStopped: boolean;
  };
  players: PlayerRow[];
  matches: MatchRow[];
  standings: StandingsRow[];
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminDashboard({ initial }: { initial: AdminOverviewInitial }) {
  const [settings, setSettings] = useState(initial.settings);
  const [players, setPlayers] = useState(initial.players);
  const [matches, setMatches] = useState(initial.matches);
  const [standings, setStandings] = useState(initial.standings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const regLocal = useMemo(
    () => toDatetimeLocalValue(settings.registrationEndsAt),
    [settings.registrationEndsAt],
  );
  const regStartLocal = useMemo(
    () => toDatetimeLocalValue(settings.registrationStartsAt),
    [settings.registrationStartsAt],
  );
  const tStartLocal = useMemo(
    () => toDatetimeLocalValue(settings.tournamentStartsAt),
    [settings.tournamentStartsAt],
  );
  const tEndLocal = useMemo(
    () => toDatetimeLocalValue(settings.tournamentEndsAt),
    [settings.tournamentEndsAt],
  );

  function show(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tournamentName = String(fd.get("tournamentName") ?? "");
    const registrationStartsAt = String(fd.get("registrationStartsAt") ?? "");
    const registrationEndsAt = String(fd.get("registrationEndsAt") ?? "");
    const tournamentStartsAt = String(fd.get("tournamentStartsAt") ?? "");
    const tournamentEndsAt = String(fd.get("tournamentEndsAt") ?? "");
    const matchDurationMinutes = Number(fd.get("matchDurationMinutes") ?? 90);
    const breakMinutes = Number(fd.get("breakMinutes") ?? 15);
    const rulesMarkdown = String(fd.get("rulesMarkdown") ?? "");
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentName,
        registrationStartsAt,
        registrationEndsAt,
        tournamentStartsAt,
        tournamentEndsAt,
        matchDurationMinutes,
        breakMinutes,
        rulesMarkdown,
      }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      show(j.error ?? "Could not save settings");
      return;
    }
    const j = await r.json();
    setSettings((s) => ({
      ...s,
      tournamentName: j.tournamentName,
      registrationStartsAt: j.registrationStartsAt,
      registrationEndsAt: j.registrationEndsAt,
      tournamentStartsAt: j.tournamentStartsAt,
      tournamentEndsAt: j.tournamentEndsAt,
      matchDurationMinutes: j.matchDurationMinutes,
      breakMinutes: j.breakMinutes,
      rulesMarkdown: j.rulesMarkdown,
      fixturesGenerated: j.fixturesGenerated,
      tournamentStopped: j.tournamentStopped ?? s.tournamentStopped,
    }));
    show("Settings saved");
  }

  async function resetSeason() {
    if (
      !window.confirm(
        "Clear ALL players, matches, and result uploads? Use this before a new registration period. Settings (dates, name, rules) are kept.",
      )
    ) {
      return;
    }
    const r = await fetch("/api/admin/tournament/reset", { method: "POST" });
    if (!r.ok) {
      show("Reset failed");
      return;
    }
    window.location.reload();
  }

  async function endTournament() {
    if (
      !window.confirm(
        "End tournament and DELETE all data (players, fixtures, uploads)? Registration will be blocked until you reset dates and use “New season”.",
      )
    ) {
      return;
    }
    const r = await fetch("/api/admin/tournament/end", { method: "POST" });
    if (!r.ok) {
      show("Could not end tournament");
      return;
    }
    window.location.reload();
  }

  async function setPlayerStatus(playerId: string, status: "pending" | "confirmed") {
    setBusyId(playerId);
    const r = await fetch("/api/admin/players/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, status }),
    });
    setBusyId(null);
    if (!r.ok) {
      show("Update failed");
      return;
    }
    setPlayers((list) =>
      list.map((p) => (p.id === playerId ? { ...p, status } : p)),
    );
    window.location.reload();
  }

  async function setPlayerPaid(playerId: string, paid: boolean) {
    setBusyId(playerId);
    const r = await fetch("/api/admin/players/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, status: "pending", paid }),
    });
    setBusyId(null);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      show(j.error ?? "Update failed");
      return;
    }
    setPlayers((list) => list.map((p) => (p.id === playerId ? { ...p, paid } : p)));
    window.location.reload();
  }

  async function saveMatch(
    matchId: string,
    payload: {
      homeScore?: number | null;
      awayScore?: number | null;
      scheduledAt?: string | null;
      status?: string;
    },
  ) {
    setBusyId(matchId);
    const r = await fetch("/api/admin/matches/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, ...payload }),
    });
    setBusyId(null);
    if (!r.ok) {
      show("Could not save match");
      return;
    }
    show("Match updated");
    window.location.reload();
  }

  return (
    <div className="space-y-10">
      {toast ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {toast}
        </div>
      ) : null}

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Season control</h2>
        <p className="mt-1 text-sm text-amber-100/80">
          Status:{" "}
          <span className="font-semibold">
            {settings.tournamentStopped ? "Ended / stopped" : "Active"}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetSeason}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            New season (clear data, keep settings)
          </button>
          <button
            type="button"
            onClick={endTournament}
            className="rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/30"
          >
            End tournament &amp; wipe data
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Use <span className="text-slate-200">New season</span> when opening a
          fresh registration window—everything resets except your configured
          dates and rules.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Tournament settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Set the registration window first. When registration closes, the
          system generates fixtures for confirmed players and auto-assigns match
          kickoffs using the tournament window and slot length below.
        </p>
        <form onSubmit={saveSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-400">Tournament name</span>
            <input
              name="tournamentName"
              defaultValue={settings.tournamentName}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Registration opens (local time)</span>
            <input
              type="datetime-local"
              name="registrationStartsAt"
              defaultValue={regStartLocal}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Registration closes (local time)</span>
            <input
              type="datetime-local"
              name="registrationEndsAt"
              defaultValue={regLocal}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Tournament starts (local time)</span>
            <input
              type="datetime-local"
              name="tournamentStartsAt"
              defaultValue={tStartLocal}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Tournament ends (local time)</span>
            <input
              type="datetime-local"
              name="tournamentEndsAt"
              defaultValue={tEndLocal}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Match duration (minutes)</span>
            <input
              type="number"
              min={10}
              max={240}
              name="matchDurationMinutes"
              defaultValue={settings.matchDurationMinutes}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-400">Gap between matches (minutes)</span>
            <input
              type="number"
              min={0}
              max={120}
              name="breakMinutes"
              defaultValue={settings.breakMinutes}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-400">Rules (shown after registration closes)</span>
            <textarea
              name="rulesMarkdown"
              defaultValue={settings.rulesMarkdown}
              rows={6}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="- Rule 1\n- Rule 2"
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Save settings
            </button>
            <span className="text-xs text-slate-500">
              Fixtures generated:{" "}
              <span className="text-slate-300">
                {settings.fixturesGenerated ? "Yes" : "Not yet"}
              </span>
            </span>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl overflow-x-auto">
        <h2 className="text-lg font-semibold text-white">Registrants</h2>
        <p className="mt-1 text-sm text-slate-400">
          Confirm players before the deadline so they are included in automatic
          pairing.
        </p>
        <table className="mt-4 w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Konami name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 pr-4 font-medium">Paid</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No registrations yet.
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="py-3 pr-4 font-medium text-white">{p.name}</td>
                  <td className="py-3 pr-4 text-slate-200">{p.konamiName || "—"}</td>
                  <td className="py-3 pr-4 text-slate-300">{p.email}</td>
                  <td className="py-3 pr-4 text-slate-300">{p.phone}</td>
                  <td className="py-3 pr-4">
                    {p.paid ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                        paid
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-xs text-slate-300">
                        not paid
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        p.status === "confirmed"
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300"
                          : "rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200"
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {!p.paid ? (
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => setPlayerPaid(p.id, true)}
                          className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
                        >
                          Mark paid
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => setPlayerPaid(p.id, false)}
                          className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-50"
                        >
                          Unmark paid
                        </button>
                      )}
                      {p.status === "pending" ? (
                        <button
                          type="button"
                          disabled={busyId === p.id || !p.paid}
                          onClick={() => setPlayerStatus(p.id, "confirmed")}
                          className="rounded-lg bg-emerald-600/80 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                          title={!p.paid ? "Must be paid first" : undefined}
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => setPlayerStatus(p.id, "pending")}
                          className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl overflow-x-auto">
        <h2 className="text-lg font-semibold text-white">Matches &amp; results</h2>
        <p className="mt-1 text-sm text-slate-400">
          Schedule kickoffs and enter scores; standings update when both scores
          are set.
        </p>
        <table className="mt-4 w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="py-2 pr-4 font-medium">Home</th>
              <th className="py-2 pr-4 font-medium">Away</th>
              <th className="py-2 pr-4 font-medium">Schedule</th>
              <th className="py-2 pr-4 font-medium">Score</th>
              <th className="py-2 font-medium">Save</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No fixtures yet. They appear after registration closes with at
                  least two confirmed players.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <MatchEditorRow
                  key={m.id}
                  match={m}
                  busy={busyId === m.id}
                  onSave={saveMatch}
                />
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl overflow-x-auto">
        <h2 className="text-lg font-semibold text-white">Standings</h2>
        <table className="mt-4 w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Konami name</th>
              <th className="py-2 pr-3 font-medium">P</th>
              <th className="py-2 pr-3 font-medium">W</th>
              <th className="py-2 pr-3 font-medium">D</th>
              <th className="py-2 pr-3 font-medium">L</th>
              <th className="py-2 pr-3 font-medium">GF</th>
              <th className="py-2 pr-3 font-medium">GA</th>
              <th className="py-2 pr-3 font-medium">GD</th>
              <th className="py-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  No completed matches yet.
                </td>
              </tr>
            ) : (
              standings.map((row) => (
                <tr
                  key={row.playerId}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="py-3 pr-3 text-slate-400">{row.rank}</td>
                  <td className="py-3 pr-3 font-medium text-white">
                    {row.playerName}
                  </td>
                  <td className="py-3 pr-3">{row.played}</td>
                  <td className="py-3 pr-3">{row.won}</td>
                  <td className="py-3 pr-3">{row.drawn}</td>
                  <td className="py-3 pr-3">{row.lost}</td>
                  <td className="py-3 pr-3">{row.goalsFor}</td>
                  <td className="py-3 pr-3">{row.goalsAgainst}</td>
                  <td className="py-3 pr-3">{row.goalDifference}</td>
                  <td className="py-3 font-semibold text-emerald-300">
                    {row.points}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MatchEditorRow({
  match,
  busy,
  onSave,
}: {
  match: MatchRow;
  busy: boolean;
  onSave: (
    matchId: string,
    payload: {
      homeScore?: number | null;
      awayScore?: number | null;
      scheduledAt?: string | null;
      status?: string;
    },
  ) => void;
}) {
  const defaultSchedule = match.scheduledAt
    ? toDatetimeLocalValue(match.scheduledAt)
    : "";

  return (
    <tr className="border-b border-white/5 align-top">
      <td className="py-3 pr-4 text-white">{match.home.name}</td>
      <td className="py-3 pr-4 text-white">{match.away.name}</td>
      <td className="py-3 pr-4">
        <input
          type="datetime-local"
          defaultValue={defaultSchedule}
          className="w-full min-w-[11rem] rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
          id={`sched-${match.id}`}
        />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={match.homeScore ?? ""}
            className="w-14 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
            id={`hs-${match.id}`}
          />
          <span className="text-slate-500">–</span>
          <input
            type="number"
            min={0}
            defaultValue={match.awayScore ?? ""}
            className="w-14 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
            id={`as-${match.id}`}
          />
        </div>
      </td>
      <td className="py-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const schedEl = document.getElementById(
              `sched-${match.id}`,
            ) as HTMLInputElement | null;
            const hsEl = document.getElementById(
              `hs-${match.id}`,
            ) as HTMLInputElement | null;
            const asEl = document.getElementById(
              `as-${match.id}`,
            ) as HTMLInputElement | null;
            const scheduledRaw = schedEl?.value;
            const scheduledAt =
              scheduledRaw && scheduledRaw.length > 0
                ? new Date(scheduledRaw).toISOString()
                : null;
            const hs = hsEl?.value === "" ? null : Number(hsEl?.value);
            const as = asEl?.value === "" ? null : Number(asEl?.value);
            onSave(match.id, {
              scheduledAt,
              homeScore: Number.isFinite(hs as number) ? hs : null,
              awayScore: Number.isFinite(as as number) ? as : null,
            });
          }}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
        >
          Save
        </button>
      </td>
    </tr>
  );
}
