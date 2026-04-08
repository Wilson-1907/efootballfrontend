"use client";

import { useState } from "react";

export function ResultUploadForm({
  enabled,
}: {
  enabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-400">
        Result upload opens when fixtures are published and the tournament is
        active.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("loading");
    setMessage(null);
    const r = await fetch("/api/results/upload", {
      method: "POST",
      body: fd,
    });
    const j = await r.json().catch(() => ({}));
    setStatus(r.ok ? "ok" : "err");
    setMessage(
      j.message ??
        j.error ??
        (r.ok ? "Uploaded." : "Upload failed."),
    );
    if (r.ok) form.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 sm:grid-cols-2"
      encType="multipart/form-data"
    >
      <p className="sm:col-span-2 text-sm text-slate-400">
        Upload a screenshot of your match result. The system reads the image and
        updates the table automatically if both{" "}
        <span className="text-slate-200">registered Konami names</span> and the
        score are visible, and you are one of the two players in that scheduled
        match.
      </p>
      <label className="block text-sm sm:col-span-2">
        <span className="text-emerald-100/80">Registered email</span>
        <input
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400/50"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="text-emerald-100/80">Match result screenshot</span>
        <input
          name="screenshot"
          type="file"
          accept="image/*"
          required
          className="mt-1 w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-950"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg hover:bg-emerald-300 disabled:opacity-60"
        >
          {status === "loading" ? "Processing…" : "Submit screenshot"}
        </button>
        {message ? (
          <p
            className={
              status === "ok"
                ? "mt-2 text-sm text-emerald-200"
                : "mt-2 text-sm text-red-300"
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
