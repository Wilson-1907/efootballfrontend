"use client";

import { useState } from "react";

export function FinalsSeatForm({ enabled }: { enabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 px-5 py-4 text-sm text-amber-100/90">
        Seat booking is closed until the organiser sets the <strong>public event date &amp; time</strong> and{" "}
        <strong>venue</strong> in admin settings (semifinal/final day). After the final is played, this list resets for the next season.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    };
    const r = await fetch("/api/watchers/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    setStatus(r.ok ? "ok" : "err");
    setMsg(j.message ?? j.error ?? (r.ok ? "Booked." : "Failed."));
    if (r.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
      <input name="name" required placeholder="Your name" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
      <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
      <input name="phone" required placeholder="Phone" className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white" />
      <button type="submit" disabled={status === "loading"} className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-amber-950 sm:col-span-3">
        {status === "loading" ? "Booking..." : "Book a seat for semifinals + final day"}
      </button>
      {msg ? <p className="text-sm text-amber-100 sm:col-span-3">{msg}</p> : null}
    </form>
  );
}
