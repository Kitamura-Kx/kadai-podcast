import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function getSupabaseServerClient() {
  const { url, anonKey, configured } = getSupabaseEnv();

  if (!configured) {
    throw new Error("SUPABASE_ENV_MISSING");
  }

  const cookieStore = await cookies();

  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Components cannot write cookies. Middleware handles refresh.
      },
    },
  });
}
