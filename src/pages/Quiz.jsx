import { useState } from 'react';
import { LESSONS_DATA } from '../data/content';
import { useAuth } from '../context/AuthContext';
import { saveQuizScore, getQuizScores, supabase } from '../utils/supabase';
import { generateQuiz } from '../utils/claude';

const LANGS = ['bhojpuri','tamil','telugu','marathi','bengali','gujarati','kannada','malayalam','punjabi','odia','urdu','assamese'];
const LANG_EMOJI = { bhojpuri:'🌾', tamil:'🌴', telugu:'🌺', marathi:'🦁', bengali:'🎨', gujarati:'🪔', kannada:'🌿', malayalam:'🌊', punjabi:'🌻', odia:'🪷', urdu:'🌙', assamese:'🦋' };
const OPTION_LETTERS = ['A','B','C','D'];

// Persist quiz state across tab switches
function getS(key, def) {
  try {
    const v = sessionStorage.getItem('quiz_' + key);
    return v !== null ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

function setS(key, val) {
  try {
    sessionStorage.setItem('quiz_' + key, JSON.stringify(val));
  } catch {}
}

export default function Quiz() {
  const [selectedLang, setSelectedLang] = useState(() => getS('lang', 'bhojpuri'));
const [questions, setQuestions]       = useState(() => getS('questions', null));
const [loading, setLoading]           = useState(false);
const [qIndex, setQIndex]             = useState(() => getS('qIndex', 0));
const [score, setScore]               = useState(() => getS('score', 0));
const [selected, setSelected]         = useState(() => getS('selected', null));
const [done, setDone]                 = useState(() => getS('done', false));
const [saved, setSaved]               = useState(() => getS('saved', false));
const [history, setHistory]           = useState(null);
const [showHistory, setShowHistory]   = useState(false);
const { user, profile } = useAuth();  
  /* ── All logic unchanged ── */
  async function startQuiz(lang) {
    if (loading) return;
    setLoading(true);
    setSelectedLang(lang);
    setS('lang', lang);
    const allWords = (LESSONS_DATA[lang] || []).flatMap(l => l.words).slice(0, 12);
    try {
      const data = await generateQuiz(allWords);
      setQuestions(data.questions);
setS('questions', data.questions);

setQIndex(0);
setS('qIndex', 0);

setScore(0);
setS('score', 0);

setSelected(null);
setS('selected', null);

setDone(false);
setS('done', false);

setSaved(false);
setS('saved', false);
    } catch (e) { alert('Quiz error: ' + e.message); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null || !questions) return;
    setSelected(i);setS('selected', i);
    if (questions[qIndex].correct === i) {
  setScore(s => {
    setS('score', s + 1);
    return s + 1;
  });
}
  }

  async function next() {
    if (!questions) return;
    if (qIndex + 1 >= questions.length) {
      setDone(true);setS('done', true);
      const finalScore = score;
      if (user && !saved) {
        await saveQuizScore(user.id, finalScore, questions.length, selectedLang);
        await supabase.from('profiles').update({
          total_xp: (profile?.total_xp || 0) + finalScore,
          perfect_quizzes: finalScore === questions.length
            ? (profile?.perfect_quizzes || 0) + 1
            : (profile?.perfect_quizzes || 0),
        }).eq('id', user.id);
        setSaved(true);setS('saved', true);
      }
      return;
    }
    const nextIndex = qIndex + 1;

setQIndex(nextIndex);
setS('qIndex', nextIndex);

setSelected(null);
setS('selected', null);
  }

  async function loadHistory() {
    if (!user) return;
    const data = await getQuizScores(user.id);
    setHistory(data); setShowHistory(true);
  }

  function reset() {
  setQuestions(null);
  setDone(false);
  setSaved(false);
  setShowHistory(false);
  setSelected(null);

  [
    'lang',
    'questions',
    'qIndex',
    'score',
    'selected',
    'done',
    'saved'
  ].forEach(k => sessionStorage.removeItem('quiz_' + k));
}

  /* ── History screen ── */
  if (showHistory) return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back
      </button>
      <h2 className="bl-page-title">Quiz History</h2>
      <p className="bl-page-sub">Your last 10 scores</p>
      {!history?.length && <p style={{ color: '#7A6552', textAlign: 'center', padding: '2rem 0' }}>No scores yet. Take a quiz first! ⚡</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history?.map((s, i) => {
          const pct = Math.round((s.score / s.total) * 100);
          const good = pct >= 70;
          return (
            <div key={i} className="bl-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: good ? '#E0F2F2' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {LANG_EMOJI[s.topic] || '⚡'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1208', textTransform: 'capitalize' }}>{s.topic}</div>
                  <div style={{ fontSize: 11, color: '#7A6552', marginTop: 2 }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: good ? '#0D6E6E' : '#E8611A' }}>{s.score}/{s.total}</div>
                <div style={{ fontSize: 11, color: '#7A6552' }}>{pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── Language picker ── */
  if (!questions && !loading) return (
    <div style={{ maxWidth: 620 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 className="bl-page-title">Quiz ⚡</h1>
        <p className="bl-page-sub">Pick a language — AI generates 5 questions just for you!</p>
      </div>

      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.75rem' }}>
        {LANGS.map(lang => (
          <button key={lang} onClick={() => startQuiz(lang)} className="bl-lang-pill" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span>{LANG_EMOJI[lang]}</span>
            <span style={{ textTransform: 'capitalize' }}>{lang}</span>
          </button>
        ))}
      </div>

      <button onClick={loadHistory} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FBF3E2', color: '#C8912A', border: '1.5px solid rgba(200,145,42,0.3)', borderRadius: 12, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        📊 View past scores
      </button>
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem 0' }} className="fade-up">
      <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1s infinite' }}>⚡</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#1A1208', marginBottom: 8, textTransform: 'capitalize' }}>
        Generating {selectedLang} quiz...
      </div>
      <div style={{ fontSize: 14, color: '#7A6552' }}>AI is crafting your questions 🧠</div>
      <div className="bl-shimmer" style={{ width: 200, height: 8, margin: '20px auto 0', borderRadius: 99 }} />
    </div>
  );

  /* ── Done / Results ── */
  if (done) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    const perfect = finalScore === questions.length;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }} className="fade-up">
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {perfect ? '🏆' : pct >= 60 ? '🌟' : '💪'}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>
          {perfect ? 'Ekdum Perfect!' : pct >= 60 ? 'Bahut Badhiya!' : 'Keep Practicing!'}
        </h2>
        <p style={{ fontSize: 15, color: '#7A6552', marginBottom: 6 }}>
          You scored <strong style={{ color: '#1A1208' }}>{finalScore}</strong> out of <strong style={{ color: '#1A1208' }}>{questions.length}</strong>
        </p>
        {saved && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2F2', color: '#0D6E6E', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, marginBottom: '1.5rem' }}>
            ✓ Score saved! +{finalScore} XP earned!
          </div>
        )}

        {/* Score breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.75rem' }}>
          {[
            { val: finalScore, label: 'Correct',    color: '#0D6E6E', bg: '#E0F2F2' },
            { val: questions.length - finalScore, label: 'Wrong', color: '#DC2626', bg: '#FEE2E2' },
            { val: `${pct}%`, label: 'Score',       color: '#C8912A', bg: '#FBF3E2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 8px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#7A6552', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => startQuiz(selectedLang)} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Try Again 🔄
          </button>
          <button onClick={reset} style={{ background: '#FDF0E8', color: '#E8611A', border: '1.5px solid rgba(232,97,26,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Change Language
          </button>
          <button onClick={loadHistory} style={{ background: '#FBF3E2', color: '#C8912A', border: '1.5px solid rgba(200,145,42,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            History 📊
          </button>
        </div>
      </div>
    );
  }

  /* ── Active quiz ── */
  const q        = questions[qIndex];
  const progress = (qIndex / questions.length) * 100;

  return (
    <div style={{ maxWidth: 580 }}>
      {/* Top bar */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={reset} style={{ background: 'rgba(26,18,8,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A6552', flexShrink: 0 }}>✕</button>
        <div style={{ flex: 1, height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
        <div className="bl-score-badge">{score} pts</div>
      </div>

      {/* Counter */}
      <div style={{ fontSize: 13, color: '#7A6552', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600, color: '#1A1208' }}>Question {qIndex + 1}</span>
        <span>of {questions.length}</span>
        <span>·</span>
        <span style={{ textTransform: 'capitalize' }}>{selectedLang} {LANG_EMOJI[selectedLang]}</span>
      </div>

      {/* Question card */}
      <div className="fade-up-2 bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          What is this in {selectedLang}?
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.15, marginBottom: 10 }}>
          {q.hindi}
        </div>
        {q.roman && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(250,246,240,0.08)', borderRadius: 99, padding: '5px 14px', fontSize: 13, color: 'rgba(250,246,240,0.55)' }}>
            <span>{q.roman}</span>
            {q.meaning && <><span>·</span><span>{q.meaning}</span></>}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          const answered = selected !== null;
          let extraClass = '';
          if (answered && isCorrect) extraClass = 'correct';
          else if (answered && isSelected) extraClass = 'wrong';
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className={`bl-option-btn ${extraClass}`}>
              <span className="bl-option-letter">
                {answered && isCorrect ? '✓' : answered && isSelected ? '✕' : OPTION_LETTERS[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {selected !== null && (
        <div className="slide-up">
          <div className={`bl-feedback-bar ${selected === q.correct ? 'correct' : 'wrong'}`} style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{selected === q.correct ? '🎉' : '💡'}</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {selected === q.correct ? 'Sahi ba! Bahut badhiya!' : 'Galat jawab!'}
              </div>
              {selected !== q.correct && (
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  Sahi jawab: <strong>{q.options[q.correct]}</strong>
                </div>
              )}
            </div>
          </div>
          <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {qIndex + 1 >= questions.length ? 'See results →' : 'Next question →'}
          </button>
        </div>
      )}
    </div>
  );
}