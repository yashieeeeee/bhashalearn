import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_lesson', icon: '📚', name: 'First Step', desc: 'Complete your first lesson', xpRequired: 0, condition: (p) => (p?.lessons_completed || 0) >= 1 },
  { id: 'quiz_master', icon: '⚡', name: 'Quiz Master', desc: 'Score 5/5 on a quiz', xpRequired: 0, condition: (p) => (p?.perfect_quizzes || 0) >= 1 },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: '3 day streak', xpRequired: 0, condition: (p) => (p?.streak || 0) >= 3 },
  { id: 'streak_7', icon: '🌟', name: 'Week Warrior', desc: '7 day streak', xpRequired: 0, condition: (p) => (p?.streak || 0) >= 7 },
  { id: 'streak_30', icon: '👑', name: 'Legend', desc: '30 day streak', xpRequired: 0, condition: (p) => (p?.streak || 0) >= 30 },
  { id: 'xp_50', icon: '🎯', name: 'XP Hunter', desc: 'Earn 50 total XP', xpRequired: 0, condition: (p) => (p?.total_xp || 0) >= 50 },
  { id: 'xp_200', icon: '💎', name: 'Diamond Learner', desc: 'Earn 200 total XP', xpRequired: 0, condition: (p) => (p?.total_xp || 0) >= 200 },
  { id: 'multi_lang', icon: '🌍', name: 'Polyglot', desc: 'Learn 3 different languages', xpRequired: 0, condition: (p) => Object.keys(p?.xp_map || {}).length >= 3 },
  { id: 'daily_5', icon: '📅', name: 'Daily Devotee', desc: 'Complete 5 daily challenges', xpRequired: 0, condition: (p) => (p?.daily_completed || 0) >= 5 },
  { id: 'sentences', icon: '💬', name: 'Sentence Builder', desc: 'Complete sentence level', xpRequired: 0, condition: (p) => Object.values(p?.xp_map || {}).some(x => x >= 4) },
  { id: 'paragraph', icon: '📖', name: 'Story Teller', desc: 'Reach paragraph level', xpRequired: 0, condition: (p) => Object.values(p?.xp_map || {}).some(x => x >= 8) },
  { id: 'words_100', icon: '🧠', name: 'Word Wizard', desc: 'Learn 100 words', xpRequired: 0, condition: (p) => (p?.words_learned || 0) >= 100 },
];

// ─── Confetti animation ───────────────────────────────────────────────────────
function Confetti() {
  const colors = ['#E8611A', '#0D6E6E', '#C8912A', '#7C3AED', '#DC2626'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: '-10px',
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `fall ${1.5 + Math.random() * 2}s linear ${Math.random() * 1}s forwards`,
        }} />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Badge card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, earned, newBadge }) {
  return (
    <div style={{
      background: earned ? '#fff' : '#F5F5F5',
      border: newBadge ? '2px solid #E8611A' : earned ? '0.5px solid rgba(26,18,8,0.15)' : '0.5px solid rgba(26,18,8,0.06)',
      borderRadius: 16, padding: '1.25rem', textAlign: 'center',
      opacity: earned ? 1 : 0.5, transition: 'all 0.3s',
      position: 'relative',
      transform: newBadge ? 'scale(1.05)' : 'scale(1)',
    }}>
      {newBadge && (
        <div style={{ position: 'absolute', top: -10, right: -10, background: '#E8611A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>NEW!</div>
      )}
      <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', marginBottom: 4 }}>{badge.name}</div>
      <div style={{ fontSize: 11, color: '#7A6552', lineHeight: 1.4 }}>{badge.desc}</div>
      {earned && <div style={{ marginTop: 8, fontSize: 10, color: '#0D6E6E', fontWeight: 600 }}>✓ EARNED</div>}
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, total_xp, streak, badges')
        .order('total_xp', { ascending: false })
        .limit(20);
      setLeaders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#1A1208', marginBottom: '1rem' }}>🏆 Leaderboard</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7A6552' }}>Loading...</div>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7A6552' }}>Be the first on the leaderboard! Start learning! 🚀</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leaders.map((leader, i) => (
            <div key={leader.id} style={{
              background: leader.id === user?.id ? '#FDF0E8' : '#fff',
              border: leader.id === user?.id ? '1.5px solid #E8611A' : '0.5px solid rgba(26,18,8,0.1)',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: i < 3 ? 24 : 14, fontWeight: 600, color: '#7A6552', minWidth: 32, textAlign: 'center' }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {(leader.name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1208' }}>
                  {leader.name || 'Anonymous'} {leader.id === user?.id ? '(You)' : ''}
                </div>
                <div style={{ fontSize: 12, color: '#7A6552' }}>🔥 {leader.streak || 0} streak · {(leader.badges || []).length} badges</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#E8611A' }}>{leader.total_xp || 0}</div>
                <div style={{ fontSize: 11, color: '#7A6552' }}>XP</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Achievements page ───────────────────────────────────────────────────
export default function Achievements() {
  const { profile, user } = useAuth();
  const [tab, setTab] = useState('badges');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  const earnedBadgeIds = profile?.badges || [];
  const totalXp = profile?.total_xp || 0;

  // Check for newly earned badges
 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!profile) return;
    const justEarned = BADGES
      .filter(b => b.condition(profile) && !earnedBadgeIds.includes(b.id))
      .map(b => b.id);

    if (justEarned.length > 0) {
      setNewBadges(justEarned);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Save new badges to Supabase
      const allBadges = [...new Set([...earnedBadgeIds, ...justEarned])];
      supabase.from('profiles').update({ badges: allBadges }).eq('id', user.id);
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // XP level calculation
  const level = Math.floor(totalXp / 20) + 1;
  const xpInLevel = totalXp % 20;
  const xpToNext = 20;

  return (
    <div style={{ maxWidth: 680 }}>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Achievements 🏆</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Earn badges, climb the leaderboard, level up!</p>
      </div>

      {/* XP + Level card */}
      <div className="fade-up-2" style={{ background: '#1A1208', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Your Level</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#E8611A' }}>Level {level}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total XP</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: '#FAF6F0' }}>{totalXp}</div>
          </div>
        </div>
        <div style={{ height: 8, background: 'rgba(250,246,240,0.1)', borderRadius: 99 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${(xpInLevel / xpToNext) * 100}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>{xpInLevel} / {xpToNext} XP to Level {level + 1}</span>
          <span style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>{earnedBadgeIds.length} / {BADGES.length} badges</span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: '1rem' }}>
          {[
            { num: profile?.streak || 0, label: 'Day Streak', icon: '🔥' },
            { num: profile?.lessons_completed || 0, label: 'Lessons Done', icon: '📚' },
            { num: profile?.perfect_quizzes || 0, label: 'Perfect Quizzes', icon: '⚡' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(250,246,240,0.06)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#FAF6F0', marginTop: 2 }}>{s.num}</div>
              <div style={{ fontSize: 10, color: 'rgba(250,246,240,0.4)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {[['badges', '🏅 Badges'], ['leaderboard', '🏆 Leaderboard']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
            background: tab === t ? '#1A1208' : '#fff',
            color: tab === t ? '#FAF6F0' : '#1A1208',
            boxShadow: tab === t ? 'none' : '0 1px 4px rgba(26,18,8,0.08)',
          }}>{label}</button>
        ))}
      </div>

      {/* Badges grid */}
      {tab === 'badges' && (
        <div className="fade-up">
          {newBadges.length > 0 && (
            <div style={{ background: '#FDF0E8', border: '1.5px solid #E8611A', borderRadius: 12, padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🎉</div>
              <div style={{ fontWeight: 600, color: '#E8611A' }}>New badge{newBadges.length > 1 ? 's' : ''} earned!</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {BADGES.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.includes(badge.id) || badge.condition(profile)}
                newBadge={newBadges.includes(badge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="fade-up">
          <Leaderboard />
        </div>
      )}
    </div>
  );
}