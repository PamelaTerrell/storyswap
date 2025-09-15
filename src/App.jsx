import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabase";
import "./App.css";
import Comments from "./components/Comments";
import Footer from "./components/Footer";
import ExpandableText from "./components/ExpandableText";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [status, setStatus] = useState("");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // UI-only controls
  const [sort, setSort] = useState("new");      // 'new' | 'react'
  const [expandAll, setExpandAll] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("✨ Submitting...");

    const submission = anonymous
      ? { title, content, reactions: {} }
      : { title, content, author, reactions: {} };

    const { error } = await supabase.from("stories").insert([submission]);

    if (error) {
      console.error("Supabase Error:", error);
      setStatus("❌ Failed to submit story.");
    } else {
      setStatus("✅ Your story has been shared!");
      setTitle("");
      setContent("");
      setAuthor("");
      setAnonymous(true);
      fetchStories();
      window.gtag?.("event", "story_submit", { content_length: content.length });
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error.message);
    } else {
      setStories(
        (data || []).map((story) => ({
          ...story,
          reactions: story.reactions || {},
        }))
      );
    }
    setLoading(false);
  };

  const handleReaction = async (storyId, emoji) => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    const currentCount = story.reactions?.[emoji] || 0;

    const updatedReactions = { ...story.reactions, [emoji]: currentCount + 1 };

    const { error } = await supabase
      .from("stories")
      .update({ reactions: updatedReactions })
      .eq("id", storyId);

    if (error) {
      console.error("Failed to update reactions:", error.message);
    } else {
      setStories((prev) =>
        prev.map((s) => (s.id === storyId ? { ...s, reactions: updatedReactions } : s))
      );
      window.gtag?.("event", "story_reaction", { emoji, story_id: storyId });
    }
  };

  useEffect(() => { fetchStories(); }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  // client-side sort
  const sortedStories = useMemo(() => {
    if (sort === "react") {
      const score = (r = {}) => Object.values(r).reduce((a, b) => a + b, 0);
      return [...stories].sort((a, b) => score(b.reactions) - score(a.reactions));
    }
    return [...stories].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [stories, sort]);

  // helpers
  function copyLink(id) {
    const url = `${location.origin}/#story-${id}`;
    navigator.clipboard.writeText(url).catch(() => alert("Copy failed — please try again."));
  }

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
      role="main"
      aria-label="StorySwap app"
    >
      <header className="header">
        <h1 className="app-title">LifeStoriesNow.com</h1>
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
          aria-pressed={darkMode}
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <div
        className="book-emoji"
        aria-hidden="true"
        role="img"
        aria-label="Open book emoji"
      >
        📖
      </div>

      <p className="subtitle">Everyone has a story. Share the one that changed you.</p>

      {/* ⬇️ NEW: centered controls under the subtitle */}
      <div className="story-controls" role="group" aria-label="Story controls">
        <button
          className={`chip ${sort === "new" ? "active" : ""}`}
          onClick={() => setSort("new")}
          type="button"
        >
          Newest
        </button>
        <button
          className={`chip ${sort === "react" ? "active" : ""}`}
          onClick={() => setSort("react")}
          type="button"
        >
          Most reactions
        </button>
        <button
          className={`chip ${expandAll ? "active" : ""}`}
          onClick={() => setExpandAll((v) => !v)}
          type="button"
          aria-pressed={expandAll}
          aria-label={expandAll ? "Collapse all stories" : "Expand all stories"}
        >
          {expandAll ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <p className="form-note">
        ✨ You can submit anonymously — just check the box below. No names, no logins, just your story.
      </p>

      <form onSubmit={handleSubmit} aria-label="Submit your story" className="story-form">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="What’s your story called?"
        />

        <div className="checkbox-row">
          <label className="checkbox-label">
            Submit anonymously
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => {
                setAnonymous(e.target.checked);
                if (e.target.checked) setAuthor("");
              }}
            />
          </label>
        </div>

        <label htmlFor="author">Name or Email</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name or email (optional)"
          disabled={anonymous}
          required={!anonymous}
        />

        <label htmlFor="content">Your Story</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Tell us something meaningful or beautiful..."
          rows={5}
        ></textarea>

        <button type="submit" className="submit-btn">📤 Share My Story</button>
        <p className="status-message" aria-live="polite">{status}</p>
      </form>

      <h2 className="shared-stories-heading">🌠 Shared Stories ({sortedStories.length})</h2>

      {loading ? (
        <p className="loading">Loading stories...</p>
      ) : sortedStories.length > 0 ? (
        <ul className="stories-list">
          {sortedStories.map((story) => (
            <li id={`story-${story.id}`} key={story.id} className="story-item fade-in">
              <h3 className="story-title">{story.title}</h3>

              <ExpandableText
                text={story.content}
                lines={8}
                forceExpanded={expandAll}
                onToggle={(isExpanded) => {
                  if (isExpanded) window.gtag?.("event", "read_more", { story_id: story.id });
                }}
              />

              {story.author && <p className="story-author">— {story.author}</p>}
              <p className="story-time">🕒 {new Date(story.created_at).toLocaleString()}</p>

              <div className="card-actions">
                <div className="reaction-buttons">
                  {["👍", "❤️", "😂", "😢", "😮"].map((emoji) => (
                    <button
                      key={emoji}
                      className="reaction-button"
                      onClick={() => handleReaction(story.id, emoji)}
                      aria-label={`React with ${emoji}`}
                      type="button"
                    >
                      {emoji} {story.reactions?.[emoji] || 0}
                    </button>
                  ))}
                </div>

                <button
                  className="chip"
                  type="button"
                  onClick={() => copyLink(story.id)}
                  aria-label="Copy link to this story"
                  title="Copy link"
                >
                  🔗 Copy link
                </button>
              </div>

              <Comments storyId={story.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-stories">No stories yet. Be the first to share something ✨</p>
      )}

      <Footer />
    </div>
  );
}
