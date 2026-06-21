import { useEffect } from 'react';
import { soundComplete, soundLevelUp } from '../utils/sounds';

// ── Duolingo-style streak popup ───────────────────────────────────────────────
// Usage: <StreakPopup streak={5} onClose={() => setShowStreak(false)} />
export default function StreakPopup({ streak, onClose }) {
  useEffect(() => {
    // Play level-up sound for milestones, complete sound otherwise
    if ([3, 7, 14, 30].includes(streak)) soundLevelUp();
    else soundComplete();

    // Auto-close after 4s
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [streak, onClose]);

  const milestone = streak === 3  ? 'On Fire! 🔥'
    : streak === 7  ? 'Week Warrior! 🌟'
    : streak === 14 ? 'Two Weeks Strong! 💪'
    : streak === 30 ? 'Legendary! 👑'
    : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1A1208, #2A1E0E)',
        border: '1px solid rgba(232,97,26,0.3)',
        borderRadius: 24, padding: '40px 36px',
        textAlign: 'center', maxWidth: 340, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Background glow */}
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,97,26,0.2), transparent 70%)', pointerEvents: 'none' }} />

        {/* Flame */}
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
          🔥
        </div>

        {/* Streak count */}
        <div style={{ fontSize: 56, fontWeight: 900, color: '#E8611A', lineHeight: 1, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
          {streak}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#FAF6F0', marginBottom: 6 }}>
          Day Streak!
        </div>

        {/* Milestone badge */}
        {milestone && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,97,26,0.2)', border: '1px solid rgba(232,97,26,0.4)', borderRadius: 99, padding: '6px 16px', fontSize: 14, fontWeight: 700, color: '#F5C49A', marginBottom: 12 }}>
            {milestone}
          </div>
        )}

        <p style={{ fontSize: 14, color: 'rgba(250,246,240,0.6)', lineHeight: 1.6, marginBottom: 24, marginTop: milestone ? 0 : 12 }}>
          {streak === 1
            ? "You started your streak! Come back tomorrow to keep it going 💪"
            : streak < 7
            ? `${streak} days in a row! You're building a great habit!`
            : streak < 30
            ? `${streak} days! You're absolutely crushing it! 🚀`
            : "30 days! You are a true language legend! 👑"}
        </p>

        {/* Dots progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[1,3,7,14,30].map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: n === streak ? 12 : 8, height: n === streak ? 12 : 8, borderRadius: '50%', background: streak >= n ? '#E8611A' : 'rgba(250,246,240,0.15)', transition: 'all 0.3s', boxShadow: n === streak ? '0 0 8px #E8611A' : 'none' }} />
              <div style={{ fontSize: 9, color: streak >= n ? '#E8611A' : 'rgba(250,246,240,0.25)' }}>{n}d</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: '#E8611A', color: '#FAF6F0',
          border: 'none', borderRadius: 14, padding: '14px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(232,97,26,0.4)',
        }}>
          Keep it up! 💪
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  );
}