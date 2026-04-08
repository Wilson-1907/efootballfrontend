"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") ?? "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Login failed");
      return;
    }
    router.push(from.startsWith("/admin") ? from : "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-400/90">
          Karatina Tournament
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight">
          Staff sign in
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          This area is restricted to tournament administrators.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500/40"
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            ← Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
