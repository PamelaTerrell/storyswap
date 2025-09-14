import { useRef, useState } from "react";
import { supabase } from "../supabase";

export default function CommentForm({ storyId, onPosted }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const hpRef = useRef(null); // honeypot

  const valid = text.trim().length >= 2 && text.trim().length <= 2000;

  async function submit(e) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);

    const hp = hpRef.current?.value || "";
    const { error } = await supabase.from("comments").insert([{
      story_id: storyId,
      display_name: name.trim() || null,
      body: text.trim(),
      hp // must be empty to pass RLS
    }]);

    setBusy(false);
    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    setText("");
    setName("");
    if (onPosted) onPosted();
  }

  return (
    <form onSubmit={submit} className="comment-form" aria-label="Add a comment">
      {/* Honeypot (keep rendered but visually hidden) */}
      <label className="hp-label" aria-hidden="true" tabIndex={-1}>
        <span style={{position:"absolute", left:"-9999px"}}>Website</span>
        <input ref={hpRef} name="website" autoComplete="off" tabIndex={-1}
               className="hp-input" style={{position:"absolute", left:"-9999px"}} />
      </label>

      <label className="comment-label">
        Name (optional)
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="How should we credit you?"
        />
      </label>

      <label className="comment-label">
        Comment
        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Be kind. Share thoughtfully…"
          required
        />
      </label>

      <div className="comment-actions">
        <button disabled={!valid || busy} type="submit">
          {busy ? "Posting…" : "Post comment"}
        </button>
        <span className="char-count">{text.length}/2000</span>
      </div>
    </form>
  );
}
