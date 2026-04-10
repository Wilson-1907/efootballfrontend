"use client";

import { useEffect, useMemo, useState } from "react";

type PanelMode = "signup" | "login" | "bookSeat";

type PlayerMe = {
  player: {
    id: string;
    name: string;
    email: string;
    phone: string;
    konamiName: string;
    status: "pending" | "confirmed";
    seasonReserved: boolean;
  };
  fixtures: {
    id: string;
    stage: string;
    status: string;
    scheduledAt: string | null;
    fixtureCode: string | null;
    codeSendAt: string | null;
    homeCodeSubmittedAt: string | null;
    awayCodeSubmittedAt: string | null;
    homeId: string;
    awayId: string;
    isHome: boolean;
    home: { id: string; name: string };
    away: { id: string; name: string };
  }[];
  progress: {
    submitted: number;
    approved: number;
    rejected: number;
  };
};

function fmt(iso: string | null): string {
  if (!iso) return "TBC";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBC";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function fmtSubmitted(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function PlayerAccessPanel({
  registrationOpen,
  authScreenOnly = false,
  onAuthenticated,
  onLogout,
}: {
  registrationOpen: boolean;
  /** When true, do not show the logged-in dashboard here — parent opens the full site. */
  authScreenOnly?: boolean;
  onAuthenticated?: () => void;
  onLogout?: () => void;
}) {
  const [mode, setMode] = useState<PanelMode>("signup");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [me, setMe] = useState<PlayerMe | null>(null);
  const [codeByMatch, setCodeByMatch] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = sessionStorage.getItem("kk_register_tab");
    if (t === "signup" || t === "login" || t === "bookSeat") {
      setMode(t);
      sessionStorage.removeItem("kk_register_tab");
    }
  }, []);

  async function refreshMe() {
    const r = await fetch("/api/player/me", { credentials: "same-origin" });
    if (!r.ok) {
      setMe(null);
      return;
    }
    const j = (await r.json()) as PlayerMe;
    setMe(j);
  }

  useEffect(() => {
    if (authScreenOnly) {
      let cancelled = false;
      void (async () => {
        const r = await fetch("/api/player/me", { credentials: "same-origin" });
        if (!cancelled && r.ok) {
          onAuthenticated?.();
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    void refreshMe();
  }, [authScreenOnly, onAuthenticated]);

  const upcomingMine = useMemo(
    () => (me?.fixtures ?? []).filter((m) => m.status !== "completed"),
    [me],
  );

  async function createAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const passwordConfirm = String(fd.get("passwordConfirm") ?? "");
    if (password !== passwordConfirm) {
      setLoading(false);
      setMsg("Passwords do not match. Type the same password twice.");
      return;
    }
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      konamiName: String(fd.get("konamiName") ?? ""),
      password,
      passwordConfirm,
    };
    const r = await fetch("/api/player/account/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    setMsg(j.message ?? j.error ?? (r.ok ? "Account created." : "Failed."));
    if (r.ok) {
      e.currentTarget.reset();
      if (authScreenOnly && onAuthenticated) {
        onAuthenticated();
      } else {
        await refreshMe();
      }
    }
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      konamiName: String(fd.get("konamiName") ?? ""),
      password: String(fd.get("password") ?? ""),
    };
    const r = await fetch("/api/player/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    setMsg(j.message ?? j.error ?? (r.ok ? "Logged in." : "Login failed."));
    if (r.ok) {
      e.currentTarget.reset();
      if (authScreenOnly && onAuthenticated) {
        onAuthenticated();
      } else {
        await refreshMe();
      }
    }
  }

  async function logout() {
    await fetch("/api/player/logout", { method: "POST", credentials: "same-origin" });
    setMe(null);
    setMsg("Logged out.");
    onLogout?.();
  }

  async function submitCode(matchId: string) {
    const code = (codeByMatch[matchId] ?? "").trim().toUpperCase();
    if (!code) {
      setMsg("Enter the fixture code first.");
      return;
    }
    const r = await fetch(`/api/player/matches/${matchId}/submit-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ code }),
    });
    const j = await r.json().catch(() => ({}));
    setMsg(j.message ?? j.error ?? (r.ok ? "Code accepted." : "Failed."));
    if (r.ok) await refreshMe();
  }

  async function reserveSpot() {
    const r = await fetch("/api/player/reserve-spot", {
      method: "POST",
      credentials: "same-origin",
    });
    const j = await r.json().catch(() => ({}));
    setMsg(j.message ?? j.error ?? (r.ok ? "Spot reserved." : "Could not reserve."));
    if (r.ok) await refreshMe();
  }

  if (me && !authScreenOnly) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-200">
              Logged in as{" "}
              <span className="font-semibold">{me.player.konamiName || me.player.name}</span>
            </p>
            <p className="text-xs text-slate-400">
              Season spot: {me.player.seasonReserved ? "Reserved" : "Not reserved"} · Admin:{" "}
              {me.player.status}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {!me.player.seasonReserved ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {registrationOpen ? (
              <button
                type="button"
                onClick={reserveSpot}
                className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-300"
              >
                Save spot for this season
              </button>
            ) : (
              <span>Registration is closed — you cannot reserve a spot for this season.</span>
            )}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">My fixtures</p>
          {upcomingMine.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming fixtures assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {upcomingMine.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-sm text-white">
                    {m.home.name} <span className="text-slate-500">vs</span> {m.away.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {fmt(m.scheduledAt)} · {m.stage.replace(/_/g, " ")}
                  </p>
                  {m.isHome ? (
                    <>
                      <p className="mt-2 text-xs text-slate-400">
                        You are <span className="text-emerald-300">home</span>. Confirm the fixture code with the system (same code shown to your opponent):
                      </p>
                      <p className="mt-1 font-mono text-sm text-emerald-200">{m.fixtureCode ?? "PENDING"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={codeByMatch[m.id] ?? ""}
                          onChange={(e) =>
                            setCodeByMatch((s) => ({ ...s, [m.id]: e.target.value }))
                          }
                          placeholder="Type the code to confirm"
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={() => submitCode(m.id)}
                          className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-300"
                        >
                          Submit code
                        </button>
                        <span className="text-[11px] text-slate-500">
                          {m.homeCodeSubmittedAt
                            ? "Recorded on your account"
                            : `Reminder window from ${fmt(m.codeSendAt)}`}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                        <li>
                          <span className="text-slate-400">You (home):</span>{" "}
                          {m.homeCodeSubmittedAt
                            ? `confirmed · ${fmtSubmitted(m.homeCodeSubmittedAt)}`
                            : "not confirmed yet"}
                        </li>
                        <li>
                          <span className="text-slate-400">{m.away.name} (away):</span>{" "}
                          {m.awayCodeSubmittedAt
                            ? `confirmed · ${fmtSubmitted(m.awayCodeSubmittedAt)}`
                            : "not confirmed yet"}
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-slate-300">
                        You are <span className="text-amber-200">away</span>. Use this code in-game, then enter it here so your account shows you joined the correct lobby:
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold tracking-wider text-amber-200">
                        {m.fixtureCode ?? "PENDING"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          value={codeByMatch[m.id] ?? ""}
                          onChange={(e) =>
                            setCodeByMatch((s) => ({ ...s, [m.id]: e.target.value }))
                          }
                          placeholder="Type the same code to confirm"
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={() => submitCode(m.id)}
                          className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-300"
                        >
                          Submit code
                        </button>
                        <span className="text-[11px] text-slate-500">
                          {m.awayCodeSubmittedAt
                            ? "Recorded on your account"
                            : `Reminder window from ${fmt(m.codeSendAt)}`}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-0.5 text-[11px] text-slate-500">
                        <li>
                          <span className="text-slate-400">{m.home.name} (home):</span>{" "}
                          {m.homeCodeSubmittedAt
                            ? `confirmed · ${fmtSubmitted(m.homeCodeSubmittedAt)}`
                            : "not confirmed yet"}
                        </li>
                        <li>
                          <span className="text-slate-400">You (away):</span>{" "}
                          {m.awayCodeSubmittedAt
                            ? `confirmed · ${fmtSubmitted(m.awayCodeSubmittedAt)}`
                            : "not confirmed yet"}
                        </li>
                      </ul>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Screenshot uploads for the score still go in “Submit match result” below.
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-slate-300">
          Your uploads: {me.progress.submitted} submitted · {me.progress.approved} approved ·{" "}
          {me.progress.rejected} rejected — also check the public fixtures &amp; table on this page.
        </div>
        {msg ? <p className="text-sm text-emerald-200">{msg}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "signup" ? "bg-emerald-400 text-emerald-950" : "border border-white/15 text-slate-200"}`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "login" ? "bg-emerald-400 text-emerald-950" : "border border-white/15 text-slate-200"}`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("bookSeat");
            window.location.hash = "finals-seats";
          }}
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${mode === "bookSeat" ? "bg-amber-300 text-amber-950" : "border border-amber-400/40 text-amber-100"}`}
        >
          Book a seat
        </button>
      </div>

      {mode === "bookSeat" ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-950/30 p-4 text-sm text-amber-50/90">
          <p>
            Spectator seats for <strong>semifinals and finals day</strong> are booked in the section below. It only works after the organiser publishes the event date and venue.
          </p>
          <a
            href="#finals-seats"
            className="mt-3 inline-block rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-200"
          >
            Go to book a seat
          </a>
        </div>
      ) : null}

      {mode === "signup" ? (
        <form onSubmit={createAccount} className="grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Full name" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <input name="konamiName" required placeholder="Konami/eFootball name" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <input name="phone" required placeholder="Phone / WhatsApp" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
          <input
            name="password"
            type="password"
            minLength={6}
            required
            placeholder="Password (min 6)"
            autoComplete="new-password"
            className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white sm:col-span-2"
          />
          <input
            name="passwordConfirm"
            type="password"
            minLength={6}
            required
            placeholder="Confirm password"
            autoComplete="new-password"
            className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white sm:col-span-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60 sm:col-span-2"
          >
            {loading ? "Please wait..." : "Create account"}
          </button>
          <p className="text-xs text-slate-400 sm:col-span-2">
            You can create an account even when registration is closed. Saving a player spot for the season is only allowed while registration is open.
          </p>
        </form>
      ) : mode === "login" ? (
        <form onSubmit={login} className="grid gap-3 sm:grid-cols-2">
          <input
            name="konamiName"
            required
            autoComplete="username"
            placeholder="Konami / eFootball name"
            className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white sm:col-span-2"
          />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white sm:col-span-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60 sm:col-span-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : null}
      {msg ? <p className="text-sm text-slate-200">{msg}</p> : null}
    </div>
  );
}
