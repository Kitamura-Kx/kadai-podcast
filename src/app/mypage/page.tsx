import { LikeButton } from "@/components/like-button";
import { LogoutButton } from "@/components/logout-button";
import { refreshStalePodcasts } from "@/lib/podcasts";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

type Podcast = {
  id: string;
  title: string | null;
  description: string | null;
};

type Episode = {
  id: string;
  podcast_id: string;
  title: string | null;
  published_at: string | null;
  audio_url: string | null;
};

export default async function MyPage() {
  const supabase = await getSupabaseServerClient();

  await refreshStalePodcasts(supabase, 60);

  const [podcastsResult, episodesResult, likesResult] = await Promise.all([
    supabase.from("podcasts").select("id, title, description").order("created_at", { ascending: false }),
    supabase.from("episodes").select("id, podcast_id, title, published_at, audio_url").order("published_at", { ascending: false }).limit(120),
    supabase.from("podcast_likes").select("podcast_id"),
  ]);

  const podcasts = (podcastsResult.data ?? []) as Podcast[];
  const episodes = (episodesResult.data ?? []) as Episode[];
  const likedSet = new Set((likesResult.data ?? []).map((like: { podcast_id: string }) => like.podcast_id));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Podcasts</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            RSS URL登録画面へ戻る
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="space-y-6">
        {podcasts.map((podcast) => {
          const ownEpisodes = episodes.filter((episode) => episode.podcast_id === podcast.id).slice(0, 10);

          return (
            <section key={podcast.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{podcast.title ?? "Untitled"}</h2>
                  <p className="line-clamp-2 text-sm text-gray-600">{podcast.description ?? "説明なし"}</p>
                </div>
                <LikeButton podcastId={podcast.id} initialLiked={likedSet.has(podcast.id)} />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {ownEpisodes.map((episode) => (
                  <article key={episode.id} className="min-w-64 max-w-64 shrink-0 rounded-lg border p-3">
                    <p className="line-clamp-2 text-sm font-medium">{episode.title ?? "Untitled episode"}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : "日付なし"}
                    </p>
                    {episode.audio_url ? (
                      <audio controls className="mt-2 w-full" src={episode.audio_url} preload="none" />
                    ) : null}
                  </article>
                ))}
                {ownEpisodes.length === 0 ? <p className="text-sm text-gray-500">エピソードなし</p> : null}
              </div>
            </section>
          );
        })}

        {podcasts.length === 0 ? <p className="text-sm text-gray-600">まずはRSS URLを登録してください。</p> : null}
      </div>
    </main>
  );
}
