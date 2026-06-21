import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../utils/supabase';
import { useTheme } from '../context/ThemeContext';
import { BADGES } from '../pages/Achievements';

const navItems = [
  { to: '/',              icon: '🏠', label: 'Home'          },
  { to: '/lessons',       icon: '📚', label: 'Lessons'       },
  { to: '/quiz',          icon: '⚡', label: 'Quiz'          },
  { to: '/daily',         icon: '🔥', label: 'Daily'         },
  { to: '/flashcards',    icon: '🃏', label: 'Flashcards'    },
  { to: '/pronunciation', icon: '🎙️', label: 'Pronunciation' },
  { to: '/path', icon: '🗺️', label: 'Learning Path' },
  { to: '/achievements',  icon: '🏆', label: 'Achievements'  },
  { to: '/analytics',     icon: '📊', label: 'Analytics'     },
  { to: '/bookmarks',     icon: '🔖', label: 'Bookmarks'     },
];

const mobileNavItems = [
  { to: '/',           icon: '🏠', label: 'Home'    },
  { to: '/lessons',    icon: '📚', label: 'Lessons' },
  { to: '/quiz',       icon: '⚡', label: 'Quiz'    },
  { to: '/daily',      icon: '🔥', label: 'Daily'   },
  { to: '/achievements', icon: '🏆', label: 'Wins'  },
  { to: '/path', icon: '🗺️', label: 'Learning Path' },
];

export default function Sidebar({ children }) {
  const { user, profile } = useAuth();
  const { dark, toggle }  = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const name      = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const initials  = name.slice(0, 2).toUpperCase();
  const totalXp   = profile?.total_xp || 0;
  const level     = Math.floor(totalXp / 20) + 1;
  const xpInLevel = totalXp % 20;
  const today     = new Date().toISOString().split('T')[0];
  const streakAtRisk = profile?.streak > 0 && profile?.last_active !== today;

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="desktop-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
        background: '#1A1208',
        borderRight: '1px solid rgba(250,246,240,0.06)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(250,246,240,0.06)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#FAF6F0', letterSpacing: '-0.01em' }}>
            Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.3)', marginTop: 2, letterSpacing: '0.05em' }}>
            Learn Indian languages
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(250,246,240,0.06)', margin: '0 8px', marginTop: 8 }}>
          <div style={{ background: 'rgba(250,246,240,0.05)', borderRadius: 12, padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #E8611A, #C8912A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#FAF6F0', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FAF6F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ fontSize: 10, color: 'rgba(250,246,240,0.4)', marginTop: 1 }}>Level {level} · {totalXp} XP</div>
              </div>
            </div>
            {/* Mini XP bar */}
            <div style={{ height: 4, background: 'rgba(250,246,240,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${(xpInLevel / 20) * 100}%`, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 10, color: 'rgba(250,246,240,0.3)', marginTop: 4, textAlign: 'right' }}>{xpInLevel}/20 to lv.{level + 1}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `bl-nav-item${isActive ? ' active' : ''}`}>
              <span className="bl-nav-icon" style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(250,246,240,0.06)' }}>
          {/* Streak + Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              [(profile?.streak || 0), streakAtRisk ? '⚠️' : '🔥', streakAtRisk ? 'At Risk!' : 'Streak'],
              [BADGES.filter(b => b.condition(profile)).length, '🏅', 'Badges'],
            ].map(([num, icon, label]) => (
              <div key={label} style={{ background: 'rgba(250,246,240,0.05)', border: '1px solid rgba(250,246,240,0.06)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, marginBottom: 2 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FAF6F0', lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 9, color: 'rgba(250,246,240,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button onClick={toggle} style={{
            width: '100%', background: 'rgba(250,246,240,0.05)',
            border: '1px solid rgba(250,246,240,0.08)', borderRadius: 10,
            padding: '8px', fontSize: 12, color: 'rgba(250,246,240,0.55)',
            cursor: 'pointer', marginBottom: 8, transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#FAF6F0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,246,240,0.55)'}>
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* Sign out */}
          <button onClick={signOut} style={{
            width: '100%', background: 'transparent',
            border: '1px solid rgba(250,246,240,0.08)', borderRadius: 10,
            padding: '8px', fontSize: 12, color: 'rgba(250,246,240,0.35)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FAF6F0'; e.currentTarget.style.borderColor = 'rgba(250,246,240,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(250,246,240,0.35)'; e.currentTarget.style.borderColor = 'rgba(250,246,240,0.08)'; }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MOBILE TOP BAR
      ══════════════════════════════════════════ */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: '#1A1208',
        borderBottom: '1px solid rgba(250,246,240,0.07)',
        padding: '12px 16px',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#FAF6F0' }}>
          Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'rgba(232,97,26,0.18)', borderRadius: 99, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#F5C49A' }}>
            ⚡ {totalXp} XP
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: menuOpen ? 'rgba(250,246,240,0.1)' : 'none', border: 'none', color: '#FAF6F0', fontSize: 20, cursor: 'pointer', lineHeight: 1, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 52, left: 0, right: 0, bottom: 0, zIndex: 199,
          background: '#1A1208', overflowY: 'auto',
        }}
          onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}>

          {/* User row */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(250,246,240,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #E8611A, #C8912A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#FAF6F0', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#FAF6F0' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', marginTop: 1 }}>Level {level} · {totalXp} XP · 🔥 {profile?.streak || 0}</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ padding: '8px 0' }}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 20px', textDecoration: 'none', fontSize: 15,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FAF6F0' : 'rgba(250,246,240,0.55)',
                  background: isActive ? 'rgba(232,97,26,0.15)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#E8611A' : 'transparent'}`,
                  transition: 'all 0.12s',
                })}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Bottom actions */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(250,246,240,0.07)' }}>
            <button onClick={toggle} style={{ width: '100%', background: 'rgba(250,246,240,0.05)', border: '1px solid rgba(250,246,240,0.1)', borderRadius: 10, padding: '11px', fontSize: 13, color: 'rgba(250,246,240,0.6)', cursor: 'pointer', marginBottom: 8 }}>
              {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button onClick={() => { signOut(); setMenuOpen(false); }}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(250,246,240,0.1)', borderRadius: 10, padding: '11px', fontSize: 13, color: 'rgba(250,246,240,0.45)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════════ */}
      <nav className="mobile-bottomnav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#1A1208',
        borderTop: '1px solid rgba(250,246,240,0.07)',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        padding: '6px 0 max(6px, env(safe-area-inset-bottom))',
      }}>
        {mobileNavItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              textDecoration: 'none', padding: '5px 10px', borderRadius: 10,
              color: isActive ? '#E8611A' : 'rgba(250,246,240,0.4)',
              minWidth: 52, transition: 'color 0.15s',
            })}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar  { display: none !important; }
          .mobile-topbar    { display: flex !important; }
          .mobile-bottomnav { display: flex !important; }
          .app-main { margin-left: 0 !important; padding: 72px 1rem 90px !important; }
        }
      `}</style>
    </>
  );
}