"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const n = searchParams.get("next") || "/";
    return n.startsWith("/") ? n : "/";
  }, [searchParams]);

  const envMissing = searchParams.get("env") === "missing";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase環境変数が未設定です。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。");
      return;
    }

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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full">
        <div className="mb-3 flex justify-end">
          <Link href="/signup" className="rounded-md border px-3 py-1.5 text-sm">
            新規登録
          </Link>
        </div>
        <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border p-6 shadow-sm">
          <h1 className="text-xl font-bold">ログイン</h1>
          {envMissing ? (
            <p className="rounded-md border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-800">
              Supabase 環境変数が未設定のため、プレビューではログイン機能を利用できません。
            </p>
          ) : null}
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
      </div>
    </main>
  );
}
