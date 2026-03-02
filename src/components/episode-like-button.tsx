"use client";

import { useState } from "react";

export function EpisodeLikeButton({ episodeId, initialLiked }: { episodeId: string; initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId, like: !liked }),
    });

    if (response.ok) {
      setLiked(!liked);
    }

    setLoading(false);
  }

  return (
    <button onClick={toggleLike} disabled={loading} className="mt-2 rounded-md border px-2 py-1 text-xs">
      {liked ? "★ いいね済み" : "☆ いいね"}
    </button>
  );
}
