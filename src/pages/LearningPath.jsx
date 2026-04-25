import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../data/content';
import { useNavigate } from 'react-router-dom';

const GOALS = [
  { id: 'travel', icon: '✈️', label: 'Travel to India', desc: 'Learn phrases for travel' },
  { id: 'family', icon: '👨‍👩‍👧', label: 'Talk to Family', desc: 'Connect with relatives' },
  { id: 'culture', icon: '🎭', label: 'Explore Culture', desc: 'Movies, music, food' },
  { id: 'career', icon: '💼', label: 'Career Growth', desc: 'Professional language skills' },
  { id: 'fun', icon: '🎮', label: 'Just for Fun', desc: 'Casual learning' },
];

const PACES = [
  { id: 'casual', icon: '🌿', label: 'Casual', desc: '5 min/day', lessons: 1 },
  { id: 'regular', icon: '⚡', label: 'Regular', desc: '15 min/day', lessons: 2 },
  { id: 'intense', icon: '🔥', label: 'Intense', desc: '30 min/day', lessons: 4 },
];

function RoadmapStep({ step, index, done, current }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          background: done ? '#0D6E6E' : current ? '#E8611A' : '#F0E8DC',
          color: done || current ? '#FAF6F0' : '#7A6552',
          border: current ? '3px solid #E8611A' : 'none',
          flexShrink: 0,
        }}>
          {done ? '✓' : step.icon}
        </div>
        {index < 6 && <div style={{ width: 2, height: 32, background: done ? '#0D6E6E' : '#F0E8DC', marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: done ? '#0D6E6E' : current ? '#E8611A' : '#1A1208' }}>{step.title}</div>
        <div style={{ fontSize: 12, color: '#7A6552', marginTop: 2 }}>{step.desc}</div>
        {current && (
          <div style={{ marginTop: 8, background: '#FDF0E8', border: '1px solid #E8611A44', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#E8611A', fontWeight: 500, display: 'inline-block' }}>
            👉 Start here!
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearningPath() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedPace, setSelectedPace] = useState('regular');
  const [pathGenerated, setPathGenerated] = useState(false);

  const xpMap = profile?.xp_map || {};
  const totalXp = profile?.total_xp || 0;
  const currentLevel = Math.floor(totalXp / 20) + 1;

  // Generate roadmap based on choices
  function generateRoadmap() {
    // eslint-disable-next-line no-unused-vars
const pace = PACES.find(p => p.id === selectedPace);
    const langXp = xpMap[selectedLang] || 0;
    const langLevel = langXp >= 8 ? 3 : langXp >= 4 ? 2 : 1;

    const steps = [
      { icon: '🔤', title: `${selectedLang ? LANGUAGES.find(l=>l.code===selectedLang)?.name : 'Your language'} — Word Basics`, desc: 'Learn 24 essential words across 4 topics', done: langLevel >= 1 && langXp >= 2 },
      { icon: '⚡', title: 'Word Quiz Mastery', desc: 'Score 4/5 on word quizzes consistently', done: (profile?.perfect_quizzes || 0) >= 2 },
      { icon: '💬', title: 'Sentence Building', desc: 'Construct simple sentences from learned words', done: langLevel >= 2 },
      { icon: '📅', title: '7-Day Streak', desc: 'Practice daily for a full week', done: (profile?.streak || 0) >= 7 },
      { icon: '🗣️', title: 'Pronunciation Practice', desc: 'Speak 20 words with 70%+ accuracy', done: false },
      { icon: '📖', title: 'Paragraph Translation', desc: 'Translate full paragraphs with AI feedback', done: langLevel >= 3 },
      { icon: '🏆', title: 'Language Mastery', desc: 'Earn all badges for this language!', done: false },
    ];

    return steps;
  }

  const roadmap = pathGenerated ? generateRoadmap() : null;
  const currentStepIndex = roadmap?.findIndex(s => !s.done) ?? 0;

  // Weekly schedule based on pace
  // eslint-disable-next-line no-unused-vars
const pace = PACES.find(p => p.id === selectedPace);
  const schedule = [
    { day: 'Mon', activity: '📖 New lesson + flashcards' },
    { day: 'Tue', activity: '⚡ Quiz practice' },
    { day: 'Wed', activity: '🗣️ Pronunciation' },
    { day: 'Thu', activity: '📖 New lesson' },
    { day: 'Fri', activity: '⚡ Quiz + daily challenge' },
    { day: 'Sat', activity: '💬 Sentence builder' },
    { day: 'Sun', activity: '📊 Review progress' },
  ];

  if (pathGenerated && roadmap) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setPathGenerated(false)} style={{ background: 'none', border: 'none', color: '#7A6552', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Regenerate path</button>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Your Learning Path 🎯</h1>
          <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>
            {GOALS.find(g=>g.id===selectedGoal)?.icon} {GOALS.find(g=>g.id===selectedGoal)?.label} · {LANGUAGES.find(l=>l.code===selectedLang)?.name} · {pace?.desc}
          </p>
        </div>

        {/* Progress summary */}
        <div className="fade-up-2" style={{ background: '#1A1208', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { num: roadmap.filter(s=>s.done).length, total: roadmap.length, label: 'Steps done' },
            { num: currentLevel, total: null, label: 'Current level' },
            { num: profile?.streak || 0, total: null, label: '🔥 Streak' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#E8611A' }}>{s.num}{s.total ? `/${s.total}` : ''}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <div className="fade-up-3" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: '1.25rem' }}>Your Roadmap</div>
          {roadmap.map((s, i) => (
            <RoadmapStep key={i} step={s} index={i} done={s.done} current={i === currentStepIndex} />
          ))}
        </div>

        {/* Weekly schedule */}
        <div className="fade-up-4" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: '1rem' }}>Weekly Schedule ({pace?.desc})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schedule.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, background: i === new Date().getDay() - 1 ? '#FDF0E8' : '#FAFAF9', border: i === new Date().getDay() - 1 ? '1px solid #E8611A44' : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#7A6552', minWidth: 32 }}>{s.day}</div>
                <div style={{ fontSize: 13, color: '#1A1208' }}>{s.activity}</div>
                {i === new Date().getDay() - 1 && <div style={{ marginLeft: 'auto', fontSize: 11, color: '#E8611A', fontWeight: 600 }}>TODAY</div>}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button onClick={() => nav('/lessons')} className="fade-up"
          style={{ width: '100%', background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Start Today's Lesson →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Learning Path 🎯</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Answer 3 quick questions — we'll build your personal roadmap!</p>
      </div>

      {/* Step indicator */}
      <div className="fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= s ? '#E8611A' : '#F0E8DC', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step 1 — Goal */}
      {step === 1 && (
        <div className="fade-up">
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginBottom: '1rem' }}>What's your goal? 🎯</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: selectedGoal === g.id ? '2px solid #E8611A' : '0.5px solid rgba(26,18,8,0.12)', background: selectedGoal === g.id ? '#FDF0E8' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 24 }}>{g.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1208' }}>{g.label}</div>
                  <div style={{ fontSize: 12, color: '#7A6552' }}>{g.desc}</div>
                </div>
                {selectedGoal === g.id && <span style={{ marginLeft: 'auto', color: '#E8611A' }}>✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => selectedGoal && setStep(2)} disabled={!selectedGoal}
            style={{ width: '100%', background: selectedGoal ? '#1A1208' : '#F0E8DC', color: selectedGoal ? '#FAF6F0' : '#7A6552', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 500, cursor: selectedGoal ? 'pointer' : 'not-allowed' }}>
            Next →
          </button>
        </div>
      )}

      {/* Step 2 — Language */}
      {step === 2 && (
        <div className="fade-up">
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginBottom: '1rem' }}>Which language? 🌍</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.5rem' }}>
            {LANGUAGES.map(lang => {
              const xp = xpMap[lang.code] || 0;
              return (
                <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
                  style={{ padding: '10px 16px', borderRadius: 12, border: selectedLang === lang.code ? '2px solid #E8611A' : '0.5px solid rgba(26,18,8,0.12)', background: selectedLang === lang.code ? '#FDF0E8' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}>
                  {lang.flag} {lang.name}
                  {xp > 0 && <span style={{ marginLeft: 6, fontSize: 10, color: '#E8611A', background: '#FDF0E8', padding: '1px 6px', borderRadius: 99 }}>{xp} XP</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: '#F0E8DC', color: '#1A1208', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, cursor: 'pointer' }}>← Back</button>
            <button onClick={() => selectedLang && setStep(3)} disabled={!selectedLang}
              style={{ flex: 2, background: selectedLang ? '#1A1208' : '#F0E8DC', color: selectedLang ? '#FAF6F0' : '#7A6552', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 500, cursor: selectedLang ? 'pointer' : 'not-allowed' }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Pace */}
      {step === 3 && (
        <div className="fade-up">
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginBottom: '1rem' }}>Your learning pace? ⚡</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
            {PACES.map(p => (
              <button key={p.id} onClick={() => setSelectedPace(p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: selectedPace === p.id ? '2px solid #E8611A' : '0.5px solid rgba(26,18,8,0.12)', background: selectedPace === p.id ? '#FDF0E8' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 28 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1208' }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#7A6552' }}>{p.desc} · {p.lessons} lesson{p.lessons > 1 ? 's' : ''}/day</div>
                </div>
                {selectedPace === p.id && <span style={{ marginLeft: 'auto', color: '#E8611A', fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: '#F0E8DC', color: '#1A1208', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, cursor: 'pointer' }}>← Back</button>
            <button onClick={() => setPathGenerated(true)}
              style={{ flex: 2, background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Generate My Path 🎯
            </button>
          </div>
        </div>
      )}
    </div>
  );
}