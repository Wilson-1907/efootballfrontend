"use client";

import { useState } from "react";

export function RegisterForm({
  registrationOpen,
  registrationEndsAt,
}: {
  registrationOpen: boolean;
  registrationEndsAt: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!registrationOpen) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
        Registration is closed. Fixtures and standings are published below for
        confirmed players.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const endsAt = new Date(registrationEndsAt).getTime();
    if (!registrationOpen || Number.isNaN(endsAt) || Date.now() >= endsAt) {
      setStatus("err");
      setMessage("Registration is closed. You can no longer reserve a spot.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const konamiName = String(fd.get("konamiName") ?? "");
    const r = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, konamiName }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setStatus("err");
      setMessage(j.error ?? "Something went wrong");
      return;
    }
    setStatus("ok");
    setMessage(j.message ?? "You are registered.");
    form.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <label className="sm:col-span-2 block text-sm">
        <span className="text-emerald-100/80">Full name</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none ring-emerald-400/0 transition placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-400/50"
          placeholder="e.g. Sam Kimani"
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400/50"
          placeholder="you@example.com"
        />
      </label>
      <label className="block text-sm">
        <span className="text-emerald-100/80">Phone / WhatsApp</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400/50"
          placeholder="+254…"
        />
      </label>
      <label className="sm:col-span-2 block text-sm">
        <span className="text-emerald-100/80">Konami / eFootball name</span>
        <input
          name="konamiName"
          required
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400/50"
          placeholder="Your in-game name"
        />
      </label>
      <div className="sm:col-span-2 flex flex-col gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 hover:bg-emerald-300 disabled:opacity-60"
        >
          {status === "loading" ? "Submitting…" : "Submit registration"}
        </button>
        {message ? (
          <p
            className={
              status === "ok"
                ? "text-sm text-emerald-200"
                : "text-sm text-red-300"
            }
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
