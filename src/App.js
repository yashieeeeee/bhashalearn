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
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: 220, minHeight: '100vh', background: '#1A1208',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
      }}
        className="desktop-sidebar">
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#FAF6F0' }}>
            Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', marginTop: 2 }}>Hindi → 12 Languages</div>
        </div>

        {/* User card */}
        <div style={{ margin: '0 1rem 1rem', background: 'rgba(250,246,240,0.06)', border: '0.5px solid rgba(250,246,240,0.1)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#FAF6F0', flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#FAF6F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>🔥 {profile?.streak || 0} day streak</div>
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

        {/* Stats + signout */}
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

      {/* ── Mobile top bar ── */}
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
          <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.6)' }}>🔥 {profile?.streak || 0}</div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#FAF6F0', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer menu ── */}
      {menuOpen && (
        <div className="mobile-drawer" style={{
          position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 199,
          background: '#1A1208', padding: '1rem 0', overflowY: 'auto',
        }}>
          <div style={{ padding: '0 1rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8611A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#FAF6F0' }}>{initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#FAF6F0' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)' }}>🔥 {profile?.streak || 0} day streak</div>
            </div>
          </div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 1.5rem', textDecoration: 'none', fontSize: 15, fontWeight: isActive ? 500 : 400, color: isActive ? '#FAF6F0' : 'rgba(250,246,240,0.6)', background: isActive ? 'rgba(232,97,26,0.18)' : 'transparent', borderLeft: isActive ? '3px solid #E8611A' : '3px solid transparent' })}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div style={{ padding: '1rem', marginTop: '1rem', borderTop: '0.5px solid rgba(250,246,240,0.08)' }}>
            <button onClick={() => { signOut(); setMenuOpen(false); }} style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'rgba(250,246,240,0.5)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottomnav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#1A1208', borderTop: '0.5px solid rgba(250,246,240,0.08)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', padding: '4px 8px', borderRadius: 8, color: isActive ? '#E8611A' : 'rgba(250,246,240,0.45)', minWidth: 48 })}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottomnav { display: flex !important; }
        }
      `}</style>
    </>
  );
}