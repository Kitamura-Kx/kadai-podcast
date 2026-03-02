import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function getSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseEnv();

  if (!configured) {
    return null;
  }

  return createBrowserClient(url!, anonKey!);
}
