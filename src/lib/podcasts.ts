import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAndParseFeed } from "@/lib/rss";

export async function upsertPodcastFromRss(supabase: SupabaseClient, rssUrl: string) {
  const parsed = await fetchAndParseFeed(rssUrl);

  const { data: podcast, error: podcastError } = await supabase
    .from("podcasts")
    .upsert(
      {
        rss_url: rssUrl,
        title: parsed.title,
        description: parsed.description,
        image_url: parsed.image_url,
        site_url: parsed.site_url,
        feed_json: parsed.feed_json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "rss_url" }
    )
    .select("id")
    .single();

  if (podcastError || !podcast) {
    throw new Error(podcastError?.message ?? "podcast upsert failed");
  }

  if (parsed.episodes.length > 0) {
    const { error: episodesError } = await supabase.from("episodes").upsert(
      parsed.episodes.map((episode) => ({
        ...episode,
        podcast_id: podcast.id,
      })),
      { onConflict: "podcast_id,guid" }
    );

    if (episodesError) {
      throw new Error(episodesError.message);
    }
  }

  return { podcastId: podcast.id };
}

export async function refreshStalePodcasts(supabase: SupabaseClient, staleMinutes = 60) {
  const threshold = new Date(Date.now() - staleMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("podcasts")
    .select("rss_url, updated_at")
    .lt("updated_at", threshold)
    .order("updated_at", { ascending: true })
    .limit(2);

  if (error || !data) return;

  for (const podcast of data as { rss_url: string | null }[]) {
    if (!podcast.rss_url) continue;
    try {
      await upsertPodcastFromRss(supabase, podcast.rss_url);
    } catch {
      // ignore refresh errors to keep page render stable
    }
  }
}
