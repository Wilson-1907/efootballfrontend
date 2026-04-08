"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
      className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
    >
      Log out
    </button>
  );
}
