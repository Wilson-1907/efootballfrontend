import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

async function loadOverview() {
  const base = process.env.API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "API_URL is not set. Point it at the backend (e.g. http://127.0.0.1:4000).",
    );
  }
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${base}/api/admin/overview`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
    cache: "no-store",
  });
  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) {
    throw new Error(`Admin API failed (${res.status})`);
  }
  return res.json();
}

export default async function AdminHomePage() {
  const data = await loadOverview();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400/90">
              Karatina · Staff
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              Tournament control centre
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              View public site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AdminDashboard initial={data} />
      </main>
    </div>
  );
}
