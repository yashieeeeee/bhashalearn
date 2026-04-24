import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../utils/supabase';

const navItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/lessons', icon: '📖', label: 'Lessons' },
  { to: '/quiz', icon: '⚡', label: 'Quiz' },
  { to: '/flashcards', icon: '🃏', label: 'Cards' },
  { to: '/daily', icon: '🔥', label: 'Daily' },
  { to: '/achievements', icon: '🏆', label: 'Achievements' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/pronunciation', icon: '🗣️', label: 'Speak' },
  { to: '/path', icon: '🎯', label: 'My Path' },
];

// Bottom nav shows only main 5 items on mobile
const mobileNavItems = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/lessons', icon: '📖', label: 'Lessons' },
  { to: '/daily', icon: '🔥', label: 'Daily' },
  { to: '/achievements', icon: '🏆', label: 'Wins' },
  { to: '/path', icon: '🎯', label: 'Path' },
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const totalXp = profile?.total_xp || 0;
  const level = Math.floor(totalXp / 20) + 1;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="desktop-sidebar" style={{
        width: 220, minHeight: '100vh', background: '#1A1208',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 1.25rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#FAF6F0' }}>
            Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', marginTop: 2 }}>Hindi → 12 Languages</div>
        </div>

        {/* User card */}
        <div style={{ margin: '0 1rem 1rem', background: 'rgba(250,246,240,0.06)', border: '0.5px solid rgba(250,246,240,0.1)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#FAF6F0', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#FAF6F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: 10, color: 'rgba(250,246,240,0.4)' }}>Lv.{level} · {totalXp} XP</div>
            </div>
          </div>
          {/* XP progress bar */}
          <div style={{ height: 3, background: 'rgba(250,246,240,0.1)', borderRadius: 99 }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${((totalXp % 20) / 20) * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 1.5rem', textDecoration: 'none', fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FAF6F0' : 'rgba(250,246,240,0.5)',
                background: isActive ? 'rgba(232,97,26,0.18)' : 'transparent',
                borderRight: isActive ? '2.5px solid #E8611A' : '2.5px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom stats */}
        <div style={{ padding: '1rem 1rem 0', borderTop: '0.5px solid rgba(250,246,240,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[[profile?.streak || 0, '🔥 Streak'], [(profile?.badges || []).length, '🏅 Badges']].map(([num, label]) => (
              <div key={label} style={{ background: 'rgba(250,246,240,0.06)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#FAF6F0' }}>{num}</div>
                <div style={{ fontSize: 10, color: 'rgba(250,246,240,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>
          <button onClick={signOut}
            style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(250,246,240,0.12)', borderRadius: 8, padding: '8px', fontSize: 12, color: 'rgba(250,246,240,0.4)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAF6F0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,240,0.4)'}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: '#1A1208', padding: '12px 16px',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid rgba(250,246,240,0.08)',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#FAF6F0' }}>
          Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.6)' }}>⚡{totalXp} XP</div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#FAF6F0', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 199,
          background: '#1A1208', overflowY: 'auto',
        }}>
          <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(250,246,240,0.08)', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#FAF6F0' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#FAF6F0' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>Level {level} · {totalXp} XP · 🔥{profile?.streak || 0}</div>
            </div>
          </div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 1.5rem', textDecoration: 'none', fontSize: 15,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FAF6F0' : 'rgba(250,246,240,0.6)',
                background: isActive ? 'rgba(232,97,26,0.18)' : 'transparent',
                borderLeft: isActive ? '3px solid #E8611A' : '3px solid transparent',
              })}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div style={{ padding: '1rem', borderTop: '0.5px solid rgba(250,246,240,0.08)', marginTop: 8 }}>
            <button onClick={() => { signOut(); setMenuOpen(false); }}
              style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'rgba(250,246,240,0.5)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottomnav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#1A1208', borderTop: '0.5px solid rgba(250,246,240,0.08)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        padding: '6px 0 max(6px, env(safe-area-inset-bottom))',
      }}>
        {mobileNavItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              textDecoration: 'none', padding: '4px 8px', borderRadius: 8,
              color: isActive ? '#E8611A' : 'rgba(250,246,240,0.45)', minWidth: 48,
            })}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottomnav { display: flex !important; }
          .app-main { margin-left: 0 !important; padding: 72px 1rem 90px !important; }
        }
      `}</style>
    </>
  );
}