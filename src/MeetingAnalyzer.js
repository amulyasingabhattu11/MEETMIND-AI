import { useState } from "react";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_KEY;

const SAMPLE = `John: Alright everyone, let's get started. We need to finalize the Q3 marketing budget.
Sarah: I've reviewed the numbers. I think we should allocate 40% to digital ads.
John: Agreed. Sarah can you send the final breakdown to the team by Friday?
Mike: I'll handle the social media campaign setup by next Wednesday.
Sarah: Also we decided to drop the print campaign entirely.
John: Good call. Mike, can you also prepare a performance report from last quarter before our next meeting?
Mike: Sure, I'll have that ready by Monday.
John: Great. Next meeting is scheduled for July 15th. We'll review campaign progress then.`;

export default function MeetingAnalyzer() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `You are an expert meeting analyst. Analyze this meeting transcript and return ONLY valid JSON, no markdown, no backticks, no explanation, just raw JSON:
{
  "summary": "2-3 sentence summary",
  "sentiment": "Positive",
  "action_items": [
    {"task": "task description", "assignee": "person name", "due": "due date or TBD", "priority": "High"}
  ],
  "key_decisions": ["decision 1"],
  "next_meeting_topics": ["topic 1"],
  "participants": ["name1", "name2"]
}

Transcript:
${transcript}`;

    if (!GEMINI_API_KEY) {
      setError("Missing API key. Add REACT_APP_GEMINI_KEY to .env and restart the app.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const message = data.error?.message || JSON.stringify(data);
        throw new Error(message);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!text.trim()) {
        throw new Error("API returned no text. Check the response payload in the browser console.");
      }
      const clean = text.replace(/```json|```/g, "").trim();
      if (!clean) {
        throw new Error("Response text is empty after cleanup.");
      }
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      console.error("ERROR:", e);
      setError("Failed: " + e.message);
    }
    setLoading(false);
  };

  const priorityColor = (p) =>
    p === "High" ? "#dc3545" : p === "Medium" ? "#fd7e14" : "#28a745";

  return (
    <div>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>📝 Meeting Transcript</h2>
          <button onClick={() => setTranscript(SAMPLE)} style={ghostBtn}>Load Sample</button>
        </div>
        <textarea
          rows={10}
          style={textarea}
          placeholder="Paste your meeting transcript here..."
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
        />
        <button
          onClick={analyze}
          disabled={loading || !transcript.trim()}
          style={{ ...primaryBtn, opacity: loading || !transcript.trim() ? 0.6 : 1 }}
        >
          {loading ? "⏳ Analyzing..." : "✨ Analyze Meeting"}
        </button>
        {error && <p style={{ color: "#dc3545", marginTop: 8 }}>{error}</p>}
      </div>

      {result && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            <StatCard icon="👥" label="Participants" value={result.participants?.length || "?"} />
            <StatCard icon="✅" label="Action Items" value={result.action_items?.length || 0} />
            <StatCard icon="😊" label="Sentiment" value={result.sentiment || "Neutral"} />
          </div>
          <div style={card}>
            <h3 style={sectionTitle}>📋 Summary</h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#444" }}>{result.summary}</p>
          </div>
          <div style={card}>
            <h3 style={sectionTitle}>✅ Action Items</h3>
            {result.action_items?.map((item, i) => (
              <div key={i} style={{ padding: "12px 16px", marginBottom: 10, borderRadius: 8, background: "#f8f9fa", borderLeft: `4px solid ${priorityColor(item.priority)}` }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.task}</div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  👤 <strong>{item.assignee}</strong> &nbsp;|&nbsp; 📅 {item.due} &nbsp;|&nbsp;
                  <span style={{ color: priorityColor(item.priority), fontWeight: 600 }}>{item.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={card}>
              <h3 style={sectionTitle}>🎯 Key Decisions</h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {result.key_decisions?.map((d, i) => <li key={i} style={{ marginBottom: 6, color: "#444" }}>{d}</li>)}
              </ul>
            </div>
            <div style={card}>
              <h3 style={sectionTitle}>📅 Next Meeting Topics</h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {result.next_meeting_topics?.map((t, i) => <li key={i} style={{ marginBottom: 6, color: "#444" }}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#0078d4" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
    </div>
  );
}

const card = { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" };
const sectionTitle = { margin: "0 0 16px 0", fontSize: 16, color: "#0078d4", borderBottom: "2px solid #e8f4fd", paddingBottom: 8 };
const textarea = { width: "100%", padding: 12, fontSize: 14, borderRadius: 8, border: "1px solid #ddd", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box", marginBottom: 12 };
const primaryBtn = { padding: "12px 32px", background: "#0078d4", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer", fontWeight: 600 };
const ghostBtn = { padding: "6px 16px", background: "transparent", color: "#0078d4", border: "1px solid #0078d4", borderRadius: 6, fontSize: 13, cursor: "pointer" };