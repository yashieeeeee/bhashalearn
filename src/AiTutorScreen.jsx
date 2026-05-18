import React, { useState, useRef, useEffect } from 'react';
import './AiTutorScreen.css';

// ─── Real Gemini API — using your existing chatWithTutor from utils/claude.js ──
// This replaces the random-string stub that was here before.
// chatWithTutor(userMessage, language) calls Gemini 2.5 Flash and returns a string.
import { chatWithTutor } from './utils/claude';
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'How do I say "thank you"?',
  'Teach me a common greeting',
  'What are numbers 1–5?',
  'Give me a quiz question',
];

export default function AiTutorScreen({ language = 'Bhojpuri' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Namaste! 🙏 Main aapka ${language} tutor hoon. Aap mujhse kuch bhi pooch sakte hain — words, grammar, or even a quiz!`,
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setError(null);
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Calls your real Gemini 2.5 Flash API via utils/claude.js
      const reply = await chatWithTutor(userMsg, language);
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      // Show a friendly error — rate limit is the most common case
      const isRateLimit = err?.message === 'RATE_LIMIT';
      const errorText = isRateLimit
        ? 'Thoda ruko! 🙏 Too many requests. Try again in a moment.'
        : 'Sorry, kuch problem aayi. Phir try karein!';
      setMessages(m => [...m, { role: 'assistant', text: errorText }]);
      setError(isRateLimit ? 'rate_limit' : 'generic');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="bl-tutor">
      {/* ── Header ── */}
      <div className="bl-tutor-header">
        <div className="bl-tutor-avatar">✨</div>
        <div>
          <p className="bl-tutor-name">Gemini AI Tutor</p>
          <p className="bl-tutor-status">
            <span className="bl-status-dot" /> Teaching {language}
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="bl-tutor-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`bl-msg bl-msg--${msg.role}`}>
            {msg.role === 'assistant' && <div className="bl-msg-avatar">✨</div>}
            <div className="bl-msg-bubble">{msg.text}</div>
          </div>
        ))}

        {/* Typing indicator while waiting for Gemini */}
        {loading && (
          <div className="bl-msg bl-msg--assistant">
            <div className="bl-msg-avatar">✨</div>
            <div className="bl-msg-bubble bl-msg-bubble--loading">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Suggested prompts — only on the opening screen */}
        {messages.length === 1 && !loading && (
          <div className="bl-suggestions">
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} className="bl-suggestion-chip" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="bl-tutor-input-wrap">
        <textarea
          className="bl-tutor-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask anything about ${language}...`}
          rows={1}
          disabled={loading}
        />
        <button
          className="bl-tutor-send"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          →
        </button>
      </div>
    </div>
  );
}