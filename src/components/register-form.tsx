"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [rssUrl, setRssUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/podcasts/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rssUrl }),
    });

    const json = await response.json().catch(() => ({}));

    setLoading(false);
    if (!response.ok) {
      setError(json.error ?? "登録に失敗しました");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <h1 className="text-lg font-semibold">RSS URL登録</h1>
      <input
        type="url"
        required
        value={rssUrl}
        onChange={(e) => setRssUrl(e.target.value)}
        placeholder="https://example.com/feed.xml"
        className="w-full rounded-md border px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "登録中..." : "登録"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
