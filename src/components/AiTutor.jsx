import { useState } from "react";
import { chatWithTutor } from "../utils/claude";

export default function AiTutor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्ते! 👋 I'm your language tutor. Ask me anything in Hindi or English — grammar, words, pronunciation, anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithTutor(userText, "Indian languages");
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      console.error("AI Tutor error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err.message}. Please check your API key in Vercel environment variables.` },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: open ? "#1A1208" : "linear-gradient(135deg, #E8611A, #C8912A)",
          color: "white",
          fontSize: "24px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(232,97,26,0.4)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
        title="AI Tutor"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "156px",
            right: "24px",
            width: "340px",
            height: "460px",
            background: "#FAF6F0",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(26,18,8,0.18)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            border: "0.5px solid rgba(26,18,8,0.12)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#1A1208",
              color: "#FAF6F0",
              padding: "14px 16px",
              fontWeight: "600",
              fontSize: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🤖 AI Tutor</span>
            <span style={{ fontSize: "12px", color: "rgba(250,246,240,0.5)" }}>Ask anything</span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#E8611A" : "#fff",
                  color: msg.role === "user" ? "white" : "#1A1208",
                  padding: "10px 13px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  maxWidth: "85%",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 8px rgba(26,18,8,0.06)",
                  border: msg.role === "assistant" ? "0.5px solid rgba(26,18,8,0.08)" : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#fff",
                  padding: "10px 13px",
                  borderRadius: "16px 16px 16px 4px",
                  fontSize: "13px",
                  color: "#7A6552",
                  border: "0.5px solid rgba(26,18,8,0.08)",
                }}
              >
                Thinking... ✨
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "0.5px solid rgba(26,18,8,0.1)",
              display: "flex",
              gap: "8px",
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about any language..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "0.5px solid rgba(26,18,8,0.15)",
                outline: "none",
                fontSize: "13px",
                background: "#FAF6F0",
                color: "#1A1208",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? "#E8611A" : "#F0E8DC",
                color: input.trim() && !loading ? "white" : "#7A6552",
                border: "none",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                cursor: input.trim() && !loading ? "pointer" : "default",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
