import React, { useState } from 'react';
import './HomeScreen.css';
import { useAuth } from './context/AuthContext';

// ─── Language data ────────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    id: 'bhojpuri',
    name: 'Bhojpuri',
    nativeName: 'भोजपुरी',
    emoji: '🌾',
    level: 4,
    progress: 62,
    color: 'saffron',
    nextLesson: { title: 'Greetings & family', type: 'Vocabulary', questions: 8, minutes: 5, stars: 3 },
  },
  {
    id: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    emoji: '🌴',
    level: 1,
    progress: 18,
    color: 'green',
    nextLesson: { title: 'Numbers 1–10', type: 'Basics', questions: 6, minutes: 4, stars: 1 },
  },
  {
    id: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    emoji: '🎨',
    level: 2,
    progress: 35,
    color: 'sky',
    nextLesson: { title: 'Colors & objects', type: 'Vocabulary', questions: 10, minutes: 6, stars: 2 },
  },
];

const AI_GREETINGS = {
  bhojpuri: 'Ka haal ba? Aaj 3 naya shabd seekhein? 🙏',
  tamil:    'Vanakkam! Inru oru padam kalappoma? 🌟',
  bengali:  'Kemon acho? Aaj ektu bangla shikhi? 🎉',
};
// ─────────────────────────────────────────────────────────────────────────────

const colorMap = {
  saffron: { accent: 'var(--bl-saffron)', light: 'var(--bl-saffron-light)', dark: 'var(--bl-saffron-dark)' },
  green:   { accent: 'var(--bl-green)',   light: 'var(--bl-green-light)',   dark: 'var(--bl-green-dark)'   },
  sky:     { accent: 'var(--bl-sky)',     light: 'var(--bl-sky-light)',     dark: 'var(--bl-sky)'          },
};

function StreakFlame({ streak }) {
  return (
    <div className="bl-streak-pill">
      <span className="bl-flame-icon">🔥</span>
      <span className="bl-streak-count">{streak}</span>
    </div>
  );
}

function XpBadge({ xp }) {
  return (
    <div className="bl-xp-badge">
      <span>⚡</span>
      <span>{xp} XP</span>
    </div>
  );
}

function AiTutorCard({ lang }) {
  return (
    <div className="bl-ai-card">
      <div className="bl-ai-avatar">✨</div>
      <div className="bl-ai-content">
        <p className="bl-ai-label">Gemini AI Tutor</p>
        <p className="bl-ai-message">"{AI_GREETINGS[lang?.id] || 'Namaste! Aaj kya seekhna hai?'}"</p>
      </div>
    </div>
  );
}

function LangCard({ lang, isActive, onClick }) {
  const c = colorMap[lang.color];
  return (
    <button
      className={`bl-lang-card ${isActive ? 'bl-lang-card--active' : ''}`}
      style={isActive ? { '--card-accent': c.accent, '--card-light': c.light, borderColor: c.accent } : {}}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="bl-lang-flag" style={{ background: c.light }}>{lang.emoji}</div>
      <div className="bl-lang-info">
        <div className="bl-lang-names">
          <span className="bl-lang-name">{lang.name}</span>
          <span className="bl-lang-native">{lang.nativeName}</span>
        </div>
        <div className="bl-lang-bar-wrap">
          <div
            className="bl-lang-bar-fill"
            style={{ width: `${lang.progress}%`, background: c.accent }}
          />
        </div>
      </div>
      <div className="bl-lang-meta">
        <span className="bl-lang-level" style={{ color: c.accent }}>Level {lang.level}</span>
        <span className="bl-lang-pct">{lang.progress}%</span>
      </div>
    </button>
  );
}

function LessonCard({ lesson, color, onStart }) {
  const c = colorMap[color];
  const stars = Array.from({ length: 5 }, (_, i) => i < lesson.stars ? '★' : '☆');
  return (
    <div className="bl-lesson-card">
      <div className="bl-lesson-top" style={{ background: c.accent }}>
        <div>
          <p className="bl-lesson-type">{lesson.type}</p>
          <p className="bl-lesson-title">{lesson.title}</p>
        </div>
        <div className="bl-lesson-stars">{stars.join('')}</div>
      </div>
      <div className="bl-lesson-bottom">
        <span className="bl-lesson-meta">
          {lesson.questions} questions · ~{lesson.minutes} min
        </span>
        <button className="bl-start-btn" style={{ background: c.accent }} onClick={onStart}>
          Start →
        </button>
      </div>
    </div>
  );
}

export default function HomeScreen({ onStartLesson, onNavigate }) {
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);

  // Pull real user data from your existing Supabase auth context
  const { user, profile } = useAuth();
  const name   = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';
  const streak = profile?.streak       || 0;
  const xp     = profile?.total_xp     || 0;

  return (
    <div className="bl-home">
      {/* ── Header ── */}
      <header className="bl-home-header" style={{ background: colorMap[activeLang.color].accent }}>
        <div className="bl-home-header-top">
          <StreakFlame streak={streak} />
          <XpBadge xp={xp} />
        </div>
        <p className="bl-home-greeting">Namaste, {name}! 🙏</p>
        <p className="bl-home-sub">Continue your {activeLang.name} journey</p>
      </header>

      <div className="bl-home-body">
        {/* ── AI Tutor ── */}
        <AiTutorCard lang={activeLang} />

        {/* ── Language Switcher ── */}
        <h2 className="bl-section-title">Your languages</h2>
        <div className="bl-lang-list">
          {LANGUAGES.map(lang => (
            <LangCard
              key={lang.id}
              lang={lang}
              isActive={lang.id === activeLang.id}
              onClick={() => setActiveLang(lang)}
            />
          ))}
          <button className="bl-add-lang-btn">
            <span className="bl-add-icon">＋</span> Add a language
          </button>
        </div>

        {/* ── Next Lesson ── */}
        <h2 className="bl-section-title">Next lesson</h2>
        <LessonCard
          lesson={activeLang.nextLesson}
          color={activeLang.color}
          onStart={() => onStartLesson?.(activeLang)}
        />

        {/* ── Daily Goal ── */}
        <div className="bl-daily-goal">
          <div className="bl-daily-goal-info">
            <span className="bl-daily-goal-label">Daily goal</span>
            <span className="bl-daily-goal-val">3 / 5 lessons</span>
          </div>
          <div className="bl-daily-goal-bar-wrap">
            <div className="bl-daily-goal-bar-fill" style={{ width: '60%', background: colorMap[activeLang.color].accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}