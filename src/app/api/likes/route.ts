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
  const episodeId = body?.episodeId;
  const like = Boolean(body?.like);

  if (!episodeId || typeof episodeId !== "string") {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  const query = supabase.from("episode_likes");
  const { error } = like
    ? await query.insert({ episode_id: episodeId })
    : await query.delete().eq("episode_id", episodeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, liked: like });
}
