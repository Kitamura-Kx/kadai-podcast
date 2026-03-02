import Parser from "rss-parser";

const parser = new Parser({ timeout: 10000 });

type FeedItem = Record<string, unknown> & {
  guid?: string;
  id?: string;
  link?: string;
  title?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  isoDate?: string;
  enclosure?: { url?: string };
};

function toIsoDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function extractAudioUrl(item: FeedItem) {
  if (item.enclosure && typeof item.enclosure.url === "string") {
    return item.enclosure.url;
  }

  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  return null;
}

export function buildGuid(item: FeedItem) {
  const rawGuid = item.guid ?? item.id ?? item.link;
  if (rawGuid && String(rawGuid).trim()) return String(rawGuid).trim();
  return null;
}

export async function fetchAndParseFeed(rssUrl: string) {
  const feed = await parser.parseURL(rssUrl);

  const episodes = (feed.items ?? [])
    .map((item) => {
      const typedItem = item as FeedItem;
      const guid = buildGuid(typedItem);
      if (!guid) return null;

      return {
        guid,
        title: typedItem.title ?? "Untitled",
        description: typedItem.contentSnippet ?? typedItem.content ?? null,
        audio_url: extractAudioUrl(typedItem),
        published_at: toIsoDate(typedItem.isoDate ?? typedItem.pubDate),
        duration_seconds: null,
        episode_json: typedItem,
      };
    })
    .filter((episode): episode is NonNullable<typeof episode> => episode !== null);

  return {
    title: feed.title ?? rssUrl,
    description: feed.description ?? null,
    image_url: (feed.image && "url" in feed.image ? String(feed.image.url ?? "") : "") || null,
    site_url: feed.link ?? null,
    feed_json: feed,
    episodes,
  };
}
