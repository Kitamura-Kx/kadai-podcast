"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onLogout}>
      ログアウト
    </button>
  );
}
