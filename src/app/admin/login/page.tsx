import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Loading…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
