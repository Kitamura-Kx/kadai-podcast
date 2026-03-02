import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LikedEpisode = {
  id: string;
  title: string | null;
  published_at: string | null;
  audio_url: string | null;
  podcasts: {
    title: string | null;
  } | null;
};

export default async function LikesPage() {
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("episode_likes")
    .select("episodes(id, title, published_at, audio_url, podcasts(title))")
    .order("created_at", { ascending: false });

  const likedEpisodes = (data ?? [])
    .map((row) => row.episodes)
    .filter((episode): episode is LikedEpisode => Boolean(episode));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">いいねしたPodcast一覧</h1>
        <Link href="/mypage" className="rounded-md border px-3 py-1.5 text-sm">
          My Podcastsへ戻る
        </Link>
      </div>

      {likedEpisodes.length === 0 ? (
        <p className="text-sm text-gray-600">まだいいねしたエピソードはありません。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {likedEpisodes.map((episode) => (
            <article key={episode.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{episode.podcasts?.title ?? "Unknown Podcast"}</p>
              <h2 className="mt-1 line-clamp-2 font-semibold">{episode.title ?? "Untitled episode"}</h2>
              <p className="mt-1 text-xs text-gray-500">
                {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : "日付なし"}
              </p>
              {episode.audio_url ? <audio controls className="mt-3 w-full" src={episode.audio_url} preload="none" /> : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
