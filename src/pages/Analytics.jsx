import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { LANGUAGES } from '../data/content';

function StatCard({ icon, label, value, color, bg, sub }) {
  return (
    <div style={{ background: bg || '#fff', border: `0.5px solid ${color}22`, borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || '#1A1208', fontFamily: "'Playfair Display',serif" }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#7A6552', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: color || '#E8611A', borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 80}px`, minHeight: d.value > 0 ? 4 : 0, transition: 'height 0.5s' }} />
          <div style={{ fontSize: 9, color: '#7A6552' }}>{d.label}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#1A1208' }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { profile, user } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('quiz_scores').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      setQuizHistory(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const totalXp = profile?.total_xp || 0;
  const level = Math.floor(totalXp / 20) + 1;
  const xpMap = profile?.xp_map || {};
  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / quizHistory.length)
    : 0;

  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
    const dateStr = d.toLocaleDateString('en-CA');
    return { label, value: quizHistory.filter(q => q.created_at?.startsWith(dateStr)).length };
  });

  const langData = LANGUAGES.slice(0, 6).map(lang => ({
    label: lang.name.slice(0, 3),
    value: quizHistory.filter(q => q.topic === lang.code).length,
  }));

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Analytics 📊</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Your learning progress at a glance</p>
      </div>

      {/* Level banner */}
      <div className="fade-up-2" style={{ background: '#1A1208', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Current Level</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#E8611A' }}>Level {level}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', marginBottom: 4 }}>Total XP</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: '#FAF6F0' }}>{totalXp}</div>
          </div>
        </div>
        <div style={{ height: 8, background: 'rgba(250,246,240,0.1)', borderRadius: 99 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#E8611A,#C8912A)', width: `${((totalXp % 20) / 20) * 100}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', marginTop: 6 }}>{totalXp % 20} / 20 XP to Level {level + 1}</div>
      </div>

      {/* Stats grid */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard icon="🔥" label="Day Streak" value={profile?.streak || 0} color="#E8611A" bg="#FDF0E8" />
        <StatCard icon="📚" label="Lessons Done" value={profile?.lessons_completed || 0} color="#0D6E6E" bg="#E0F2F2" />
        <StatCard icon="⚡" label="Perfect Quizzes" value={profile?.perfect_quizzes || 0} color="#C8912A" bg="#FBF3E2" />
        <StatCard icon="📅" label="Daily Done" value={profile?.daily_completed || 0} color="#7C3AED" bg="#F5F3FF" />
        <StatCard icon="🏅" label="Badges" value={(profile?.badges || []).length} color="#DC2626" bg="#FEF2F2" sub="of 12 total" />
        <StatCard icon="🌍" label="Languages" value={Object.keys(xpMap).filter(k => xpMap[k] > 0).length} color="#059669" bg="#ECFDF5" sub="started" />
      </div>

      {/* Charts */}
      {quizHistory.length > 0 && (
        <div className="fade-up-4" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208' }}>Quiz Performance</div>
            <div style={{ background: avgScore >= 70 ? '#E0F2F2' : '#FDF0E8', color: avgScore >= 70 ? '#0D6E6E' : '#E8611A', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>{avgScore}% avg</div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 12, color: '#7A6552', marginBottom: 8 }}>Quizzes this week</div>
            <BarChart data={weekData} color="#E8611A" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7A6552', marginBottom: 8 }}>By language</div>
            <BarChart data={langData} color="#0D6E6E" />
          </div>
        </div>
      )}

      {/* Language XP progress */}
      <div className="fade-up-5" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: '1rem' }}>Language Progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {LANGUAGES.map(lang => {
            const xp = (xpMap[lang.code] || 0);
            const levelName = xp >= 8 ? '📖 Para' : xp >= 4 ? '💬 Sent' : '🔤 Words';
            return (
              <div key={lang.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1208' }}>{lang.name}</span>
                    <span style={{ fontSize: 10, color: '#7A6552' }}>{levelName} · {xp} XP</span>
                  </div>
                  <div style={{ height: 5, background: '#F0E8DC', borderRadius: 99 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: xp > 0 ? '#E8611A' : 'transparent', width: `${(xp / 10) * 100}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent quizzes */}
      {quizHistory.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: '1rem' }}>Recent Quizzes</div>
          {quizHistory.slice(0, 6).map((q, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '0.5px solid #F0E8DC' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208', textTransform: 'capitalize' }}>{q.topic || 'Quiz'}</div>
                <div style={{ fontSize: 11, color: '#7A6552' }}>{new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
              </div>
              <div style={{ background: (q.score / q.total) >= 0.7 ? '#E0F2F2' : '#FDF0E8', color: (q.score / q.total) >= 0.7 ? '#0D6E6E' : '#E8611A', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                {q.score}/{q.total} · {Math.round((q.score / q.total) * 100)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && quizHistory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7A6552', background: '#fff', borderRadius: 14, border: '0.5px solid rgba(26,18,8,0.1)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
          <div style={{ fontWeight: 500, color: '#1A1208', marginBottom: 4 }}>No data yet!</div>
          <div style={{ fontSize: 13 }}>Complete quizzes and lessons to see analytics here.</div>
        </div>
      )}
    </div>
  );
}