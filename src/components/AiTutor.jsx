import { useState, useRef, useEffect } from 'react';
import { callClaude } from '../utils/claude';

export default function AiTutor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Pranam! 🙏 Main tumhara Bhojpuri tutor hoon. Kuch bhi poocho — words, grammar, pronunciation tips, ya koi bhi sawaal!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude(history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, kuch problem ho gayi. Dobara try karo!' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, width: 56, height: 56,
          background: '#E8611A', border: 'none', borderRadius: '50%',
          fontSize: 24, cursor: 'pointer', zIndex: 999,
          boxShadow: '0 4px 20px rgba(232,97,26,0.4)',
          transition: 'transform 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Ask AI Tutor"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, width: 360, height: 500,
          background: '#FAF6F0', border: '0.5px solid rgba(26,18,8,0.15)',
          borderRadius: 18, zIndex: 998, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(26,18,8,0.15)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#1A1208', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(232,97,26,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#FAF6F0' }}>AI Bhojpuri Tutor</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.45)' }}>Powered by Claude</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#1A1208' : '#fff',
                  color: m.role === 'user' ? '#FAF6F0' : '#1A1208',
                  fontSize: 13, lineHeight: 1.55,
                  border: m.role === 'assistant' ? '0.5px solid rgba(26,18,8,0.1)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 13px', background: '#fff', borderRadius: '14px 14px 14px 4px', width: 'fit-content', border: '0.5px solid rgba(26,18,8,0.1)' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8611A', animation: 'pulse 1.2s ease infinite', animationDelay: i * 0.2 + 's' }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '0.5px solid rgba(26,18,8,0.08)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Kuch bhi poocho..."
              style={{
                flex: 1, border: '0.5px solid rgba(26,18,8,0.15)', borderRadius: 10,
                padding: '9px 12px', fontSize: 13, background: '#fff',
                color: '#1A1208', outline: 'none',
              }}
            />
            <button onClick={send} disabled={!input.trim() || loading} style={{
              background: input.trim() && !loading ? '#E8611A' : '#F0E8DC',
              border: 'none', borderRadius: 10, width: 38, height: 38,
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: 16, color: input.trim() && !loading ? '#fff' : '#7A6552',
              transition: 'all 0.15s', flexShrink: 0,
            }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
