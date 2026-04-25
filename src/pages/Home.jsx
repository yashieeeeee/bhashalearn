import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lessons, wordOfDay } from '../data/content';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function Home() {
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const firstName = name.split(' ')[0];
  const next = lessons.find(l => l.status === 'progress' || l.status === 'new');
  const streak = profile?.streak || 0;
  const streakStatus = days.map((_, i) => i < streak && streak <= 7 ? (i < streak - 1 ? 'done' : 'today') : i === Math.min(streak, 6) ? 'today' : i < streak ? 'done' : 'upcoming');

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1208', lineHeight: 1.2, marginBottom: 8 }}>
          Pranam, {firstName}! 🙏
        </div>
        <p style={{ fontSize: 15, color: '#7A6552' }}>Continue your journey to fluent Bhojpuri.</p>
      </div>

      {/* Live stats */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { num: profile?.words_learned || 0, label: 'Words learned', color: '#E8611A', bg: '#FDF0E8' },
          { num: streak, label: 'Day streak', color: '#0D6E6E', bg: '#E0F2F2' },
          { num: '—', label: 'Quiz accuracy', color: '#C8912A', bg: '#FBF3E2' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '1rem 1.25rem', border: `0.5px solid ${s.color}22` }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: s.color }}>{s.num}</div>
            <div style={{ fontSize: 12, color: '#7A6552', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly streak */}
      <div className="fade-up-3" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7A6552', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>This week</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, padding: '10px 0', borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 500, background: streakStatus[i] === 'done' ? '#E0F2F2' : streakStatus[i] === 'today' ? '#E8611A' : '#F0E8DC', color: streakStatus[i] === 'done' ? '#0D6E6E' : streakStatus[i] === 'today' ? '#FAF6F0' : '#7A6552' }}>
              <div>{d}</div>
              <div style={{ marginTop: 4 }}>{streakStatus[i] === 'done' ? '✓' : streakStatus[i] === 'today' ? '→' : '·'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue lesson */}
      {next && (
        <div className="fade-up-4" style={{ background: '#1A1208', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s' }}
          onClick={() => nav('/lessons')}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Continue where you left off</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(232,97,26,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{next.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#FAF6F0' }}>{next.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.5)', marginTop: 2 }}>{next.subtitle}</div>
              <div style={{ height: 4, background: 'rgba(250,246,240,0.1)', borderRadius: 99, marginTop: 8 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${next.progress}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
            <span style={{ color: '#E8611A', fontSize: 20 }}>→</span>
          </div>
        </div>
      )}

<div style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.25)', borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          🌍 Word of the day
        </div>
        <div style={{ fontSize: 13, color: '#7A6552' }}>
          Go to <strong>Daily Practice</strong> and select your language to see today's word! 🎯
        </div>
      </div>
    </div>
  );
}