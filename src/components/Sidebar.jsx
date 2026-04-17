import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../utils/supabase';

const navItems = [
  { to: '/', icon: '⬡', label: 'Home' },
  { to: '/lessons', icon: '📖', label: 'Lessons' },
  { to: '/quiz', icon: '🎯', label: 'Quiz' },
  { to: '/flashcards', icon: '🃏', label: 'Flashcards' },
  { to: '/daily', icon: '🔥', label: 'Daily' },
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside style={{ width: 220, minHeight: '100vh', background: '#1A1208', display: 'flex', flexDirection: 'column', padding: '1.5rem 0', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#FAF6F0' }}>
          Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', marginTop: 2 }}>Hindi → Bhojpuri</div>
      </div>

      {/* User card */}
      <div style={{ margin: '0 1rem 1rem', background: 'rgba(250,246,240,0.06)', border: '0.5px solid rgba(250,246,240,0.1)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#FAF6F0', flexShrink: 0 }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#FAF6F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>Level 1</div>
        </div>
      </div>

      {/* Streak */}
      <div style={{ margin: '0 1rem 1.5rem', background: 'rgba(232,97,26,0.15)', border: '0.5px solid rgba(232,97,26,0.3)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🔥</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#F5C49A' }}>{profile?.streak || 0} day streak</div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>Keep it going!</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 1.5rem', textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 500 : 400, color: isActive ? '#FAF6F0' : 'rgba(250,246,240,0.5)', background: isActive ? 'rgba(232,97,26,0.18)' : 'transparent', borderRight: isActive ? '2.5px solid #E8611A' : '2.5px solid transparent', transition: 'all 0.15s' })}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Stats + logout */}
      <div style={{ padding: '1.25rem 1rem 0', borderTop: '0.5px solid rgba(250,246,240,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[[profile?.words_learned || 0, 'Words'], [profile?.streak || 0, 'Streak']].map(([num, label]) => (
            <div key={label} style={{ background: 'rgba(250,246,240,0.06)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#FAF6F0' }}>{num}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>
        <button onClick={signOut} style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(250,246,240,0.12)', borderRadius: 8, padding: '8px', fontSize: 12, color: 'rgba(250,246,240,0.4)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FAF6F0'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,240,0.4)'}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
