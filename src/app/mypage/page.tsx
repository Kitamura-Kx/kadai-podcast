import Link from "next/link";
import { EpisodeLikeButton } from "@/components/episode-like-button";
import { LogoutButton } from "@/components/logout-button";
import { refreshStalePodcasts } from "@/lib/podcasts";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
    supabase
      .from("episodes")
      .select("id, podcast_id, title, published_at, audio_url")
      .order("published_at", { ascending: false })
      .limit(120),
    supabase.from("episode_likes").select("episode_id"),
  ]);

  const podcasts = (podcastsResult.data ?? []) as Podcast[];
  const episodes = (episodesResult.data ?? []) as Episode[];
  const likedSet = new Set((likesResult.data ?? []).map((like: { episode_id: string }) => like.episode_id));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Podcasts</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-md border px-3 py-1.5 text-sm">
            登録画面へ戻る
          </Link>
          <Link href="/mypage/likes" className="rounded-md border px-3 py-1.5 text-sm">
            いいね一覧
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="space-y-6">
        {podcasts.map((podcast) => {
          const ownEpisodes = episodes.filter((episode) => episode.podcast_id === podcast.id).slice(0, 10);

          return (
            <section key={podcast.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="font-semibold">{podcast.title ?? "Untitled"}</h2>
                <p className="line-clamp-2 text-sm text-gray-600">{podcast.description ?? "説明なし"}</p>
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
                    <EpisodeLikeButton episodeId={episode.id} initialLiked={likedSet.has(episode.id)} />
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
