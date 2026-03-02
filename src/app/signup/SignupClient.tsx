"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignupClient() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("登録が完了しました。ログインしてください。");
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
      >
        ログインへ
      </Link>
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-bold">アカウント新規登録</h1>
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
          minLength={6}
        />
        <button
          disabled={loading}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-60"
          type="submit"
        >
          {loading ? "登録中..." : "登録する"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
      </form>
    </main>
  );
}
