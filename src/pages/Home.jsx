import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyStreakFreeze } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


// ── Streak Freeze Card ────────────────────────────────────────────────────────
function FreezeCard({ freezes, totalXp, onBuy, buying }) {
  const canAfford = totalXp >= 50;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f, #1a2f4e)',
      borderRadius: 16, padding: '16px 18px', marginBottom: 16,
      border: '1px solid rgba(99,179,237,0.2)',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06, pointerEvents: 'none' }}>🧊</div>
      <div style={{ fontSize: 36, flexShrink: 0 }}>🧊</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#FAF6F0', marginBottom: 3 }}>
          Streak Freeze {freezes > 0 ? `— ${freezes} available` : '— None left!'}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.55)', lineHeight: 1.5 }}>
          {freezes > 0
            ? `You're protected! Miss 1 day and your ${freezes > 1 ? 'freeze' : 'last freeze'} auto-activates.`
            : 'Buy a freeze to protect your streak if you miss a day.'}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {freezes > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: Math.min(freezes, 3) }, (_, i) => (
                <span key={i} style={{ fontSize: 20 }}>🧊</span>
              ))}
              {freezes > 3 && <span style={{ fontSize: 11, color: 'rgba(250,246,240,0.5)', alignSelf: 'center' }}>+{freezes - 3}</span>}
            </div>
          )}
          <button onClick={onBuy} disabled={!canAfford || buying}
            style={{
              background: canAfford && !buying ? '#3B82F6' : 'rgba(250,246,240,0.08)',
              color: canAfford && !buying ? '#FAF6F0' : 'rgba(250,246,240,0.3)',
              border: 'none', borderRadius: 10, padding: '7px 12px',
              fontSize: 11, fontWeight: 700, cursor: canAfford && !buying ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}>
            {buying ? '...' : canAfford ? '+ Buy 50 XP' : `${50 - totalXp} XP needed`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Streak Banner ─────────────────────────────────────────────────────────────
function StreakBanner({ streak, lastActive, firstName, onAction, dark }) {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const doneToday = lastActive === today;
  const hour      = new Date().getHours();

  // Don't show if streak is 0 and never done anything
  if (streak === 0 && !lastActive) return null;

  let config;

  if (doneToday) {
    // Already active today — celebrate!
    config = {
      emoji: '🔥',
      bg: 'linear-gradient(135deg, #E8611A, #C8912A)',
      border: 'rgba(232,97,26,0.3)',
      title: `${streak} day streak! You're on fire!`,
      sub: 'Amazing work today. Come back tomorrow to keep it going!',
      btn: null,
    };
  } else if (lastActive === yesterday || streak === 0) {
    // Streak at risk or just starting — urgent nudge
    const timeLeft = 23 - hour;
    const urgent   = timeLeft <= 4;
    config = {
      emoji: urgent ? '⚠️' : '🔥',
      bg: urgent
        ? 'linear-gradient(135deg, #DC2626, #991B1B)'
        : 'linear-gradient(135deg, #1A1208, #2A1E0E)',
      border: urgent ? 'rgba(220,38,38,0.4)' : 'rgba(232,97,26,0.25)',
      title: streak > 0
        ? urgent
          ? `Hurry! Your ${streak} day streak ends in ~${timeLeft}h!`
          : `Don't break your ${streak} day streak!`
        : `Hey ${firstName}, start your streak today! 🌟`,
      sub: streak > 0
        ? urgent
          ? 'Quick — do one lesson or quiz before midnight!'
          : 'Complete a lesson or quiz to keep your streak alive.'
        : 'Do one lesson or quiz daily and build an unstoppable habit!',
      btn: streak > 0
        ? urgent ? '🚀 Do it now!' : '📚 Start a lesson'
        : '⚡ Take a quiz',
      btnColor: urgent ? '#DC2626' : '#E8611A',
    };
  } else {
    // Missed yesterday — streak already reset, encourage restart
    config = {
      emoji: '💪',
      bg: 'linear-gradient(135deg, #1A1208, #2A1E0E)',
      border: 'rgba(232,97,26,0.2)',
      title: `Start a new streak today, ${firstName}!`,
      sub: "Yesterday's gone — today is a fresh start. You've got this!",
      btn: '🔥 Restart streak',
      btnColor: '#E8611A',
    };
  }

  return (
    <div style={{ background: config.bg, borderRadius: 16, padding: '16px 18px', marginBottom: 16, border: `1px solid ${config.border}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.08, pointerEvents: 'none' }}>🔥</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 32, flexShrink: 0 }}>{config.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#FAF6F0', marginBottom: 3 }}>{config.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.6)', lineHeight: 1.5 }}>{config.sub}</div>
        </div>
        {config.btn && (
          <button onClick={onAction} style={{ background: config.btnColor, color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', boxShadow: `0 4px 12px ${config.btnColor}44` }}>
            {config.btn}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, profile, refreshProfile } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);

  // Give existing users 1 free freeze if column was null (created before feature)
  const freezes = profile?.streak_freezes ?? 1;

  async function handleBuyFreeze() {
    if (!user || buying) return;
    setBuying(true);
    await buyStreakFreeze(user.id);
    await refreshProfile();
    setBuying(false);
  }

  const name        = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const firstName   = name.charAt(0).toUpperCase() + name.slice(1);
  const streak      = profile?.streak        || 0;
  const today       = new Date().toISOString().split('T')[0];
  const lastActive  = profile?.last_active;
  const doneToday   = lastActive === today;
  // Show streak as "at risk" if not done today yet
  const streakAtRisk  = !doneToday && streak > 0;    // but we flag it
  const totalXp     = profile?.total_xp      || 0;
  const wordsLearned = profile?.words_learned || 0;
  const level       = Math.floor(totalXp / 20) + 1;
  const xpInLevel   = totalXp % 20;

  // Map each day of the week to its real status based on today's date
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0,Tue=1,...,Sat=5,Sun=6

  const streakStatus = WEEK_DAYS.map((_, i) => {
    if (i === todayIndex) {
      // Today: done only if user already did activity, else pending
      return doneToday ? 'done' : 'today';
    }
    if (i < todayIndex) {
      // Past days this week
      if (doneToday) {
        // Activity done today — streak includes today, so go back streak-1 days
        return i >= todayIndex - (streak - 1) ? 'done' : 'upcoming';
      } else {
        // Not done today — streak days are yesterday and before
        return i >= todayIndex - streak ? 'done' : 'upcoming';
      }
    }
    // Future days this week
    return 'upcoming';
  });

  const text   = dark ? '#FAF6F0' : '#1A1208';
  const muted  = dark ? 'rgba(250,246,240,0.5)' : '#7A6552';

  const quickActions = [
    { icon: '⚡', label: 'Quick Quiz',     sub: 'Test your knowledge',   to: '/quiz',          color: '#E8611A', light: dark ? 'rgba(232,97,26,0.15)' : '#FDF0E8' },
    { icon: '🃏', label: 'Flashcards',     sub: 'Review vocabulary',     to: '/flashcards',    color: '#0D6E6E', light: dark ? 'rgba(13,110,110,0.15)' : '#E0F2F2' },
    { icon: '🔥', label: 'Daily Practice', sub: "Today's challenge",     to: '/daily',         color: '#C8912A', light: dark ? 'rgba(200,145,42,0.15)' : '#FBF3E2' },
    { icon: '🗣️', label: 'Pronunciation',  sub: 'Practice speaking',     to: '/pronunciation', color: '#7C3AED', light: dark ? 'rgba(123,79,176,0.15)' : '#F3ECFF' },
  ];

  return (
    <div className="fade-up" style={{ paddingBottom: '2rem' }}>

      {/* ── Hero greeting ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1208 0%, #2A1E0E 100%)',
        borderRadius: 20,
        padding: '24px 24px 20px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,97,26,0.2), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,110,110,0.15), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Welcome back</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#FAF6F0', margin: 0, lineHeight: 1.2 }}>
                Pranam, {firstName}! 🙏
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(232,97,26,0.2)', border: '1px solid rgba(232,97,26,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#F5C49A', display: 'flex', alignItems: 'center', gap: 5 }}>
                🔥 {streak}{streakAtRisk ? ' ⚠️' : ''}
              </div>
              <div style={{ background: 'rgba(200,145,42,0.2)', border: '1px solid rgba(200,145,42,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#E8C76A', display: 'flex', alignItems: 'center', gap: 5 }}>
                ⚡ {totalXp} XP
              </div>
            </div>
          </div>

          {/* Level + XP bar */}
          <div style={{ background: 'rgba(250,246,240,0.06)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FAF6F0' }}>Level {level}</span>
              <span style={{ fontSize: 11, color: 'rgba(250,246,240,0.45)' }}>{xpInLevel} / 20 XP to next level</span>
            </div>
            <div style={{ height: 6, background: 'rgba(250,246,240,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${(xpInLevel / 20) * 100}%`, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Streak Banner ── */}
      <StreakBanner
        streak={streak}
        lastActive={profile?.last_active}
        firstName={firstName}
        dark={dark}
        onAction={() => navigate('/lessons')}
      />

      {/* ── Streak Freeze ── */}
      <FreezeCard
        freezes={freezes}
        totalXp={totalXp}
        onBuy={handleBuyFreeze}
        buying={buying}
      />

      {/* ── Stats row ── */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { num: wordsLearned, label: 'Words', icon: '📚', color: '#E8611A', bg: dark ? 'rgba(232,97,26,0.12)' : '#FDF0E8', border: 'rgba(232,97,26,0.2)' },
          { num: streak, label: streakAtRisk ? 'At Risk!' : 'Streak', icon: streakAtRisk ? '⚠️' : '🔥', color: streakAtRisk ? '#DC2626' : '#0D6E6E', bg: dark ? (streakAtRisk ? 'rgba(220,38,38,0.12)' : 'rgba(13,110,110,0.12)') : (streakAtRisk ? '#FEE2E2' : '#E0F2F2'), border: streakAtRisk ? 'rgba(220,38,38,0.2)' : 'rgba(13,110,110,0.2)' },
          { num: `Lv.${level}`,label: 'Level',  icon: '⭐', color: '#C8912A', bg: dark ? 'rgba(200,145,42,0.12)' : '#FBF3E2', border: 'rgba(200,145,42,0.2)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Weekly streak ── */}
      <div className="fade-up-3 bl-card" style={{ padding: '18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: muted, letterSpacing: '0.07em', textTransform: 'uppercase' }}>This week</span>
          {streak > 0 && <span style={{ fontSize: 12, color: '#E8611A', fontWeight: 600 }}>{streak} day streak 🔥</span>}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {WEEK_DAYS.map((d, i) => {
            const status = streakStatus[i];
            const isDone  = status === 'done';
            const isToday = status === 'today';
            return (
              <div key={d} className={`bl-streak-day ${status}`} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isDone || isToday ? '#FAF6F0' : muted, marginBottom: 4 }}>{d}</div>
                <div style={{ fontSize: 14, color: isDone || isToday ? '#FAF6F0' : muted }}>
                  {isDone ? '✓' : isToday ? '○' : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Continue lesson ── */}
      <div className="fade-up-4 bl-continue-card" style={{ marginBottom: 16 }} onClick={() => navigate('/lessons')}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12 }}>
          Continue where you left off
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(232,97,26,0.2)', border: '1px solid rgba(232,97,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#FAF6F0', marginBottom: 3 }}>Greetings &amp; Introductions</div>
            <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', marginBottom: 10 }}>Learn basic Bhojpuri greetings</div>
            <div style={{ height: 4, background: 'rgba(250,246,240,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: '60%' }} />
            </div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,97,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8611A', fontSize: 16, flexShrink: 0 }}>→</div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="fade-up-5" style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Quick actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {quickActions.map(item => (
            <div key={item.to} className="bl-quick-card" onClick={() => navigate(item.to)}
              style={{ background: item.light, border: `1px solid ${item.color}22` }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.color, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: muted }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Word of the day ── */}
      <div style={{ background: dark ? 'rgba(200,145,42,0.1)' : '#FBF3E2', border: `1px solid ${dark ? 'rgba(200,145,42,0.2)' : 'rgba(200,145,42,0.3)'}`, borderRadius: 16, padding: '16px 18px', marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#C8912A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>🌍 Word of the day</div>
        <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, margin: 0 }}>
          Go to{' '}
          <span onClick={() => navigate('/daily')} style={{ fontWeight: 700, color: text, cursor: 'pointer', borderBottom: `1.5px solid ${text}` }}>
            Daily Practice
          </span>{' '}
          and pick your language to see today's word! 🎯
        </p>
      </div>

    </div>
  );
}