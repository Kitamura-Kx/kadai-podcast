"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Note = {
  id: number;
  content: string;
};

export default function Page() {
  const [session, setSession] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signUp() {
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  }

  async function signIn() {
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function loadNotes() {
    if (!session) return;

    const { data, error } = await supabase
      .from("notes")
      .select("id, content")
      .order("id", { ascending: false });

    if (error) setError(error.message);
    else setNotes((data ?? []) as Note[]);
  }

  async function addNote() {
    if (!session) return;

    const { error } = await supabase.from("notes").insert({
      content,
    });

    if (error) setError(error.message);
    else {
      setContent("");
      loadNotes();
    }
  }

  useEffect(() => {
    if (session) loadNotes();
  }, [session]);

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <h1>ログイン / 新規登録</h1>

        <input
          type="email"
          placeholder="メール"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button onClick={signUp}>新規登録</button>
        <button onClick={signIn}>ログイン</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Notes</h1>
      <p>{session.user.email}</p>

      <button onClick={signOut}>ログアウト</button>

      <hr />

      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="メモを書く"
      />
      <button onClick={addNote}>追加</button>

      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            #{n.id} {n.content}
          </li>
        ))}
      </ul>
    </main>
  );
}