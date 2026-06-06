import React from "react";
import MeetingAnalyzer from "./MeetingAnalyzer";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
      padding: "24px 16px"
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 36, margin: 0 }}>🧠 MeetMind AI</h1>
          <p style={{ color: "#e0f0ff", fontSize: 16, marginTop: 8 }}>
            Transform meeting transcripts into clear summaries, action items & decisions — instantly
          </p>
        </div>
        <MeetingAnalyzer />
      </div>
    </div>
  );
}