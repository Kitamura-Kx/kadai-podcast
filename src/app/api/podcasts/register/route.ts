import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { upsertPodcastFromRss } from "@/lib/podcasts";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rssUrl = body?.rssUrl;

  if (!rssUrl || typeof rssUrl !== "string") {
    return NextResponse.json({ error: "rssUrl is required" }, { status: 400 });
  }

  try {
    const result = await upsertPodcastFromRss(supabase, rssUrl);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "RSS registration failed" },
      { status: 400 }
    );
  }
}
