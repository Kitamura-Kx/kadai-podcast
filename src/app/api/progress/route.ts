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
  const positionSeconds = Number(body?.positionSeconds ?? 0);
  const completed = Boolean(body?.completed ?? false);

  if (!episodeId || typeof episodeId !== "string") {
    return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
  }

  const { error } = await supabase.from("episode_progress").upsert({
    episode_id: episodeId,
    position_seconds: Math.max(0, positionSeconds),
    completed,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
