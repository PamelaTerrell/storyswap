import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

function App() {
  const [stories, setStories] = useState([])
  const [newStory, setNewStory] = useState("")

  // Fetch stories
  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    const { data, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false })
    if (!error) setStories(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newStory.trim()) return

    const { error } = await supabase.from("stories").insert([{ content: newStory }])
    if (!error) {
      setNewStory("")
      fetchStories()
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h1>📖 Share Your Story</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's something you've learned or want to share?"
          value={newStory}
          onChange={(e) => setNewStory(e.target.value)}
          style={{ width: "100%", height: "100px", marginBottom: "1rem" }}
        />
        <button type="submit">Submit</button>
      </form>

      <hr />

      <h2>Recent Stories</h2>
      <ul>
        {stories.map((story) => (
          <li key={story.id} style={{ marginBottom: "1rem" }}>
            {story.content}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
