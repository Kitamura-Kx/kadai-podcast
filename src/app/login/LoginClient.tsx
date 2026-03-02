// app/login/LoginClient.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // open redirect対策として "/" 始まりだけ許可（最小だけど安全）
  const nextPath = useMemo(() => {
    const n = searchParams.get("next") || "/";
    return n.startsWith("/") ? n : "/";
  }, [searchParams]);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Link
        href="/"
        className="absolute right-4 top-4 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
      >
        新規登録へ
      </Link>
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-bold">ログイン</h1>
        <input
          className="w-full rounded-md border px-3 py-2"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </main>
  );
}
