import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const podcastId = body?.podcastId;
  const like = Boolean(body?.like);

  if (!podcastId || typeof podcastId !== "string") {
    return NextResponse.json({ error: "podcastId is required" }, { status: 400 });
  }

  const query = supabase.from("podcast_likes");
  const { error } = like
    ? await query.insert({ podcast_id: podcastId })
    : await query.delete().eq("podcast_id", podcastId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, liked: like });
}
