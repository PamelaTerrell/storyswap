import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import CommentForm from "./CommentForm";

export default function Comments({ storyId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("id, display_name, body, created_at")
      .eq("story_id", storyId)
      .eq("status", "published")
      .order("created_at", { ascending: true });
    if (!error) setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // (Optional) realtime:
    // const channel = supabase.channel(`comments:${storyId}`).on(
    //   'postgres_changes',
    //   { event: 'INSERT', schema: 'public', table: 'comments', filter: `story_id=eq.${storyId}` },
    //   payload => setRows(prev => [...prev, payload.new])
    // ).subscribe();
    // return () => supabase.removeChannel(channel);
  }, [storyId]);

  return (
    <section className="comments">
      <h4 className="comments-title">Comments ({rows.length})</h4>

      {loading ? (
        <p>Loading comments…</p>
      ) : rows.length ? (
        <ul className="comment-list">
          {rows.map(c => (
            <li key={c.id} className="comment-item">
              <div className="comment-meta">
                <span className="comment-author">
                  {c.display_name || "Anonymous"}
                </span>
                <time dateTime={c.created_at}>
                  {new Date(c.created_at).toLocaleString()}
                </time>
              </div>
              <p className="comment-body">{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet — be first.</p>
      )}

      <CommentForm storyId={storyId} onPosted={load} />
    </section>
  );
}
