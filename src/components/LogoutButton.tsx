"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className={className ?? "text-sm font-medium text-ink-300 hover:text-white"}>
      Log out
    </button>
  );
}
