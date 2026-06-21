/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';
import { UNITS, LESSON_ORDER, getLessonWords } from '../data/curriculum';
import { generateQuiz } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
import { supabase, recordActivity } from '../utils/supabase';
import { soundCorrect, soundWrong, soundComplete, soundLevelUp, soundTap } from '../utils/sounds';
import StreakPopup from '../components/StreakPopup';

// ── TTS ──────────────────────────────────────────────────────────────────────
const LANG_CONFIG = {
  hindi:'hi-IN', bhojpuri:'hi-IN', tamil:'ta-IN', telugu:'te-IN',
  marathi:'mr-IN', bengali:'bn-IN', gujarati:'gu-IN', punjabi:'pa-IN',
  kannada:'kn-IN', malayalam:'ml-IN', urdu:'ur-IN', odia:'or-IN', assamese:'bn-IN',
};
function speak(scriptText, romanText, langCode) {
  window.speechSynthesis.cancel();
  const lang = LANG_CONFIG[langCode] || 'hi-IN';
  const voices = window.speechSynthesis.getVoices();
  const hasVoice = voices.some(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
  const text = hasVoice ? scriptText : (romanText || scriptText);
  const useLang = hasVoice ? lang : 'en-IN';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = useLang; u.rate = 0.75;
  u.onerror = () => {
    const f = new SpeechSynthesisUtterance(romanText || scriptText);
    f.lang = 'en-IN'; f.rate = 0.75;
    window.speechSynthesis.speak(f);
  };
  const trySpeak = () => {
    const v = window.speechSynthesis.getVoices();
    const best = v.find(x => x.lang === useLang) || v.find(x => x.lang.startsWith(useLang.split('-')[0])) || v[0];
    if (best) u.voice = best;
    window.speechSynthesis.speak(u);
  };
  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; trySpeak(); }; }
}

// ── Quiz inside lesson ────────────────────────────────────────────────────────
function LessonQuiz({ words, langCode, lessonId, onComplete, onBack }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [done, setDone]           = useState(false);

  useEffect(() => { loadQuiz(); }, []);

  async function loadQuiz() {
    setLoading(true);
    try {
      // For lessons with real script words use AI, else build from words directly
      const hasScript = words.some(w => w.target && w.target !== w.meaning);
      let qs;
      if (hasScript && words.length >= 4) {
        const data = await generateQuiz(words);
        qs = data.questions.map(q => ({ ...q, type: 'mcq' }));
      } else {
        // Build MCQ from meaning-based words
        qs = words.map(w => {
          const wrong = words.filter(x => x.hindi !== w.hindi).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.meaning);
          const opts  = [w.meaning, ...wrong].sort(() => Math.random() - 0.5);
          return { type: 'mcq', hindi: w.hindi, roman: w.roman, meaning: w.meaning, options: opts, correct: opts.indexOf(w.meaning) };
        }).slice(0, 5);
      }
      setQuestions(qs);
    } catch { onBack(); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null || !questions) return;
    setSelected(i);
    if (questions[qIndex].correct === i) { soundCorrect(); setScore(s => s + 1); }
    else { soundWrong(); setLives(l => Math.max(0, l - 1)); }
  }

  function next() {
    if (!questions) return;
    if ((qIndex + 1 >= questions.length) || (lives <= (selected !== questions[qIndex].correct ? 1 : 0) && lives === 1)) {
      soundComplete();
      setDone(true);
      onComplete(score, questions.length); // score already updated by pick()
      return;
    }
    setQIndex(i => i + 1);
    setSelected(null);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--bl-text,#1A1208)' }}>Preparing lesson...</div>
      <div className="bl-shimmer" style={{ width: 160, height: 8, margin: '16px auto 0' }} />
    </div>
  );

  if (done) return null; // handled by parent

  const q        = questions?.[qIndex];
  const progress = questions ? (qIndex / questions.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={onBack} style={{ background: 'rgba(26,18,8,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: 'var(--bl-muted,#7A6552)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ flex: 1, height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#E8611A,#C8912A)', width: `${progress}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2].map(i => <span key={i} style={{ fontSize: 14, opacity: i < lives ? 1 : 0.2 }}>❤️</span>)}
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--bl-muted,#7A6552)', marginBottom: '1.25rem' }}>
        Question <strong style={{ color: 'var(--bl-text,#1A1208)' }}>{qIndex + 1}</strong> of {questions?.length}
      </div>

      {q && (
        <>
          <div className="bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>What does this mean?</div>
            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 42, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.2, marginBottom: 10 }}>{q.hindi}</div>
            {q.roman && (
              <div style={{ display: 'inline-flex', gap: 8, background: 'rgba(250,246,240,0.08)', borderRadius: 99, padding: '5px 14px', fontSize: 13, color: 'rgba(250,246,240,0.55)', alignItems: 'center' }}>
                <span>{q.roman}</span>
                <button onClick={() => speak(q.hindi, q.roman, langCode)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.7 }}>🔊</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {q.options.map((opt, i) => {
              const answered = selected !== null;
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let cls = '';
              if (answered && isCorrect) cls = 'correct';
              else if (answered && isSelected) cls = 'wrong';
              return (
                <button key={i} onClick={() => pick(i)} disabled={answered} className={`bl-option-btn ${cls}`}>
                  <span className="bl-option-letter">{answered && isCorrect ? '✓' : answered && isSelected ? '✕' : ['A','B','C','D'][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="slide-up">
              <div className={`bl-feedback-bar ${selected === q.correct ? 'correct' : 'wrong'}`} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>{selected === q.correct ? '🎉' : '💡'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{selected === q.correct ? 'Bilkul sahi!' : 'Galat jawab!'}</div>
                  {selected !== q.correct && <div style={{ fontSize: 13, opacity: 0.8 }}>Sahi jawab: <strong>{q.options[q.correct]}</strong></div>}
                </div>
              </div>
              <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                {qIndex + 1 >= questions.length ? 'Finish →' : 'Next →'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Vocabulary view (before quiz) ─────────────────────────────────────────────
function VocabView({ lesson, words, langCode, onStartQuiz, onBack }) {
  const [flipped, setFlipped] = useState(null);

  return (
    <div style={{ maxWidth: 580 }} className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted,#7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ width: 56, height: 56, background: '#FDF0E8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '1px solid rgba(232,97,26,0.15)' }}>{lesson.icon}</div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--bl-text,#1A1208)', margin: 0 }}>{lesson.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--bl-muted,#7A6552)', margin: '3px 0 0' }}>{lesson.desc} · {words.length} words</p>
        </div>
      </div>

      {/* Word cards */}
      <div style={{ display: 'grid', gap: 10, marginBottom: '1.5rem' }}>
        {words.map((word, i) => (
          <div key={i} onClick={() => setFlipped(flipped === i ? null : i)}
            style={{ background: flipped === i ? '#1A1208' : 'var(--bl-surface,#fff)', border: `1.5px solid ${flipped === i ? '#1A1208' : 'rgba(26,18,8,0.08)'}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                <div>
                  <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 600, color: flipped === i ? '#FAF6F0' : 'var(--bl-text,#1A1208)' }}>{word.hindi}</div>
                  <div style={{ fontSize: 11, color: flipped === i ? 'rgba(250,246,240,0.45)' : 'var(--bl-muted,#7A6552)', marginTop: 2 }}>Hindi</div>
                </div>
                <span style={{ color: '#E8611A', fontSize: 16 }}>→</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: flipped === i ? '#F5C49A' : '#E8611A' }}>{word.target}</div>
                  <div style={{ fontSize: 11, color: flipped === i ? 'rgba(250,246,240,0.45)' : 'var(--bl-muted,#7A6552)', marginTop: 2 }}>{word.roman}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={e => { e.stopPropagation(); speak(word.target || word.hindi, word.roman, langCode); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.7 }}>🔊</button>
                <span style={{ fontSize: 11, color: flipped === i ? 'rgba(250,246,240,0.4)' : 'var(--bl-muted,#7A6552)' }}>{flipped === i ? '▲' : '▼'}</span>
              </div>
            </div>
            {flipped === i && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(250,246,240,0.12)', fontSize: 14, color: 'rgba(250,246,240,0.7)' }}>
                Meaning: <strong style={{ color: '#FAF6F0' }}>{word.meaning}</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={onStartQuiz} style={{ width: '100%', background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,97,26,0.35)' }}>
        Start Quiz ⚡
      </button>
    </div>
  );
}

// ── Lesson Result ─────────────────────────────────────────────────────────────
function LessonResult({ lesson, score, total, stars, xpEarned, onContinue, onRetry }) {
  const pct = Math.round((score / total) * 100);
  return (
    <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }} className="fade-up">
      <div style={{ fontSize: 72, marginBottom: 8 }}>{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: 'var(--bl-text,#1A1208)', marginBottom: 6 }}>
        {stars === 3 ? 'Ekdum Perfect!' : stars >= 2 ? 'Bahut Badhiya!' : 'Keep Practicing!'}
      </h2>
      <p style={{ color: 'var(--bl-muted,#7A6552)', marginBottom: '1rem' }}>{score} of {total} correct · {pct}%</p>

      {/* Stars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '1rem' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ fontSize: 36, filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'all 0.3s' }}>⭐</div>
        ))}
      </div>

      {xpEarned > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2F2', color: '#0D6E6E', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: '1.5rem' }}>
          ✓ +{xpEarned} XP earned!
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {stars < 3 && (
          <button onClick={onRetry} style={{ background: '#FDF0E8', color: '#E8611A', border: '1.5px solid rgba(232,97,26,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Try again 🔄
          </button>
        )}
        <button onClick={onContinue} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {stars === 3 ? 'Next lesson →' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Unit Header ───────────────────────────────────────────────────────────────
function UnitHeader({ unit }) {
  return (
    <div style={{ background: unit.color, borderRadius: 16, padding: '16px 20px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 28 }}>{unit.icon}</div>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{unit.title}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{unit.subtitle}</div>
      </div>
    </div>
  );
}

// ── Lesson Node ───────────────────────────────────────────────────────────────
function LessonNode({ lesson, status, stars, xp, unitColor, onClick, index }) {
  const isLocked    = status === 'locked';
  const isCompleted = status === 'completed';
  const isCurrent   = status === 'current';

  // Zigzag pattern
  const offsets = [0, 60, 100, 60];
  const marginLeft = offsets[index % offsets.length];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, marginLeft, transition: 'margin 0.3s' }}>
      <div onClick={!isLocked ? onClick : undefined}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: isLocked ? '#E8E0D8' : isCompleted ? unitColor : isCurrent ? unitColor : '#fff',
          border: `4px solid ${isLocked ? '#D0C4B8' : isCompleted ? unitColor : isCurrent ? '#fff' : unitColor}`,
          boxShadow: isCurrent ? `0 0 0 6px ${unitColor}33, 0 8px 24px ${unitColor}44` : isCompleted ? `0 4px 16px ${unitColor}33` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, cursor: isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', position: 'relative',
          transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
        }}>
        {isLocked ? '🔒' : lesson.icon}
        {/* Stars badge */}
        {isCompleted && stars > 0 && (
          <div style={{ position: 'absolute', bottom: -6, right: -6, background: '#C8912A', borderRadius: 99, padding: '2px 6px', fontSize: 10, color: '#fff', fontWeight: 700, border: '2px solid #fff' }}>
            {'⭐'.repeat(stars)}
          </div>
        )}
        {/* Pulsing ring for current */}
        {isCurrent && (
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `3px solid ${unitColor}`, animation: 'pulse 2s infinite', opacity: 0.5 }} />
        )}
      </div>

      {/* Info */}
      <div style={{ opacity: isLocked ? 0.45 : 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bl-text,#1A1208)' }}>{lesson.title}</div>
        <div style={{ fontSize: 12, color: 'var(--bl-muted,#7A6552)', marginTop: 2 }}>{lesson.desc}</div>
        <div style={{ fontSize: 11, color: isCompleted ? '#0D6E6E' : 'var(--bl-muted,#7A6552)', marginTop: 3, fontWeight: 600 }}>
          {isCompleted ? `✓ Completed · ${xp} XP` : isCurrent ? `${lesson.xp} XP · Start now!` : `🔒 ${lesson.xp} XP`}
        </div>
      </div>
    </div>
  );
}

// ── Main Lessons Page ─────────────────────────────────────────────────────────
export default function Lessons() {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedLang, setSelectedLang]   = useState('bhojpuri');
  const [allProgress, setAllProgress]     = useState({}); // { langCode: { lessonId: {...} } }
  const [activeLesson, setActiveLesson]   = useState(null);
  const [view, setView]                   = useState('path');
  const [quizResult, setQuizResult]       = useState(null);
  const [streakData, setStreakData]       = useState(null);

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  // Load all progress from Supabase — keyed by language
  useEffect(() => {
    const saved = profile?.lesson_progress || {};
    setAllProgress(saved);
  }, [profile]);

  // Scope progress to current language
  const progress = allProgress[selectedLang] || {};

  function getLessonStatus(lessonId) {
    const idx = LESSON_ORDER.indexOf(lessonId);
    if (progress[lessonId]?.completed) return 'completed';
    if (idx === 0) return 'current'; // first lesson always unlocked
    const prevId = LESSON_ORDER[idx - 1];
    if (progress[prevId]?.completed) return 'current';
    return 'locked';
  }

  function getStars(score, total) {
    const pct = (score / total) * 100;
    if (pct === 100) return 3;
    if (pct >= 60)  return 2;
    return 1;
  }

  async function handleQuizComplete(score, total) {
    if (!activeLesson) return;
    const stars    = getStars(score, total);
    const xpEarned = stars === 3 ? activeLesson.xp : stars === 2 ? Math.floor(activeLesson.xp * 0.6) : Math.floor(activeLesson.xp * 0.3);
    const existing = progress[activeLesson.id];
    const bestStars = Math.max(stars, existing?.stars || 0);
    const completed = stars >= 2; // need 60%+ to unlock next

    const newLangProgress = {
      ...progress,
      [activeLesson.id]: { stars: bestStars, xp: xpEarned, completed: completed || existing?.completed },
    };
    const newAllProgress = { ...allProgress, [selectedLang]: newLangProgress };
    setAllProgress(newAllProgress);
    setQuizResult({ score, total, stars, xpEarned });
    setView('result');

    if (user) {
      const newTotalXp = (profile?.total_xp || 0) + xpEarned;
      const oldLevel   = Math.floor((profile?.total_xp || 0) / 20);
      const newLevel   = Math.floor(newTotalXp / 20);
      if (newLevel > oldLevel) soundLevelUp();

      await supabase.from('profiles').update({
        lesson_progress: newAllProgress,
        total_xp: newTotalXp,
        lessons_completed: (profile?.lessons_completed || 0) + 1,
      }).eq('id', user.id);

      if (completed) {
        const { newStreak, streakIncreased } = await recordActivity(user.id);
        if (streakIncreased) setStreakData({ streak: newStreak });
      }

      await refreshProfile();
    }
  }

  function openLesson(lesson) {
    soundTap();
    setActiveLesson(lesson);
    setView('vocab');
  }

  function getLessonWords_(lesson) {
    return getLessonWords(lesson, selectedLang, LESSONS_DATA);
  }

  // ── Views ──────────────────────────────────────────────────────────────────
  if (view === 'vocab' && activeLesson) {
    const words = getLessonWords_(activeLesson);
    return (
      <VocabView
        lesson={activeLesson}
        words={words}
        langCode={selectedLang}
        onStartQuiz={() => setView('quiz')}
        onBack={() => { setActiveLesson(null); setView('path'); }}
      />
    );
  }

  if (view === 'quiz' && activeLesson) {
    const words = getLessonWords_(activeLesson);
    return (
      <LessonQuiz
        words={words}
        langCode={selectedLang}
        lessonId={activeLesson.id}
        onComplete={handleQuizComplete}
        onBack={() => setView('vocab')}
      />
    );
  }

  if (view === 'result' && quizResult) {
    return (
      <>
        {streakData && <StreakPopup streak={streakData.streak} onClose={() => setStreakData(null)} />}
        <LessonResult
          lesson={activeLesson}
          score={quizResult.score}
          total={quizResult.total}
          stars={quizResult.stars}
          xpEarned={quizResult.xpEarned}
          onContinue={() => { setView('path'); setActiveLesson(null); setQuizResult(null); }}
          onRetry={() => setView('quiz')}
        />
      </>
    );
  }

  // ── Path Map ───────────────────────────────────────────────────────────────
  const totalLessons    = LESSON_ORDER.length;
  const completedCount  = Object.values(progress).filter(p => p?.completed).length;
  const totalXp         = Object.values(progress).reduce((sum, p) => sum + (p?.xp || 0), 0);
  // ^ progress is already scoped to selectedLang so stats are per-language

  return (
    <div style={{ maxWidth: 600, paddingBottom: '3rem' }}>
      {streakData && <StreakPopup streak={streakData.streak} onClose={() => setStreakData(null)} />}

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
        <h1 className="bl-page-title">Lessons 📚</h1>
        <p className="bl-page-sub">Complete lessons to unlock the next one!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code}
            onClick={() => { soundTap(); setSelectedLang(lang.code); setActiveLesson(null); setView('path'); }}
            className={`bl-lang-pill ${selectedLang === lang.code ? 'active' : ''}`}>
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="fade-up-2 bl-card" style={{ padding: '14px 18px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--bl-text,#1A1208)' }}>{currentLang?.name} Progress</span>
          <span style={{ fontSize: 12, color: 'var(--bl-muted,#7A6552)' }}>{completedCount}/{totalLessons} lessons · {totalXp} XP</span>
        </div>
        <div style={{ height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#E8611A,#C8912A)', width: `${(completedCount / totalLessons) * 100}%`, transition: 'width 0.6s' }} />
        </div>
      </div>

      {/* Unit + Lesson path */}
      {UNITS.map((unit, ui) => (
        <div key={unit.id} className={`fade-up-${Math.min(ui + 2, 5)}`} style={{ marginBottom: '2rem' }}>
          <UnitHeader unit={unit} />
          <div style={{ paddingTop: 16 }}>
            {unit.lessons.map((lesson, li) => {
              const status = getLessonStatus(lesson.id);
              const prog   = progress[lesson.id];
              return (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  status={status}
                  stars={prog?.stars || 0}
                  xp={prog?.xp || 0}
                  unitColor={unit.color}
                  index={li}
                  onClick={() => openLesson(lesson)}
                />
              );
            })}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.1); } }
      `}</style>
    </div>
  );
}