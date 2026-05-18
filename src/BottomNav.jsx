import React from 'react';
import './BottomNav.css';

const TABS = [
  { id: 'home',     label: 'Home',     icon: '🏠' },
  { id: 'learn',    label: 'Learn',    icon: '📖' },
  { id: 'tutor',    label: 'AI Tutor', icon: '✨' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'profile',  label: 'Profile',  icon: '👤' },
];

/**
 * BottomNav
 * Props:
 *   active   — string id of the current tab
 *   onChange — (tabId: string) => void
 */
export default function BottomNav({ active = 'home', onChange }) {
  return (
    <nav className="bl-bottom-nav" aria-label="Main navigation">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bl-nav-item ${active === tab.id ? 'bl-nav-item--active' : ''}`}
          onClick={() => onChange?.(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="bl-nav-icon">{tab.icon}</span>
          <span className="bl-nav-label">{tab.label}</span>
          {active === tab.id && <span className="bl-nav-dot" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}
