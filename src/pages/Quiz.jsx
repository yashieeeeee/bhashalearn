import { useState } from 'react';
import { LESSONS_DATA } from '../data/content';
import { useAuth } from '../context/AuthContext';
import { saveQuizScore, getQuizScores, supabase, recordActivity } from '../utils/supabase';
import StreakPopup from '../components/StreakPopup';
import { generateQuiz } from '../utils/claude';
import { soundCorrect, soundWrong, soundComplete, soundLevelUp, soundTap } from '../utils/sounds';

// ── TTS for quiz options ──────────────────────────────────────────────────────
// speakOption(scriptText, romanText, langCode)
// If the browser has no voice for that language, reads roman text in English
// so the user always hears SOMETHING instead of silence.
const QUIZ_LANG_MAP = {
  bhojpuri:'hi-IN', tamil:'ta-IN', telugu:'te-IN', marathi:'mr-IN',
  bengali:'bn-IN', gujarati:'gu-IN', punjabi:'pa-IN', kannada:'kn-IN',
  malayalam:'ml-IN', urdu:'ur-IN', odia:'or-IN', assamese:'bn-IN',
};
function speakOption(scriptText, romanText, langCode) {
  window.speechSynthesis.cancel();
  const lang   = QUIZ_LANG_MAP[langCode] || 'hi-IN';
  const voices = window.speechSynthesis.getVoices();
  const hasVoice = voices.some(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));

  // If no voice available, fall back to roman in English
  const textToSpeak = hasVoice ? scriptText : (romanText || scriptText);
  const langToUse   = hasVoice ? lang : 'en-IN';

  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.lang  = langToUse;
  u.rate  = 0.75;

  u.onerror = () => {
    const f = new SpeechSynthesisUtterance(romanText || scriptText);
    f.lang = 'en-IN'; f.rate = 0.75;
    window.speechSynthesis.speak(f);
  };

  const trySpeak = () => {
    const v    = window.speechSynthesis.getVoices();
    const best = v.find(x => x.lang === langToUse)
               || v.find(x => x.lang.startsWith(langToUse.split('-')[0]))
               || v.find(x => x.lang.includes('IN'))
               || v[0];
    if (best) u.voice = best;
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; trySpeak(); }; }
}

const LANGS = ['bhojpuri','tamil','telugu','marathi','bengali','gujarati','kannada','malayalam','punjabi','odia','urdu','assamese'];
const LANG_EMOJI = { bhojpuri:'🌾', tamil:'🌴', telugu:'🌺', marathi:'🦁', bengali:'🎨', gujarati:'🪔', kannada:'🌿', malayalam:'🌊', punjabi:'🌻', odia:'🪷', urdu:'🌙', assamese:'🦋' };
const OPTION_LETTERS = ['A','B','C','D'];

function getS(key, def) {
  try { const v = sessionStorage.getItem('quiz_' + key); return v !== null ? JSON.parse(v) : def; } catch { return def; }
}
function setS(key, val) {
  try { sessionStorage.setItem('quiz_' + key, JSON.stringify(val)); } catch {}
}
function clearS() {
  ['lang','questions','qIndex','score','selected','done','saved','mode'].forEach(k => sessionStorage.removeItem('quiz_' + k));
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildMCQ(words, aiQuestions) {
  if (aiQuestions?.length) return aiQuestions.map(q => ({ ...q, type: 'mcq' }));
  return words.slice(0, 5).map(w => {
    const wrong = shuffle(words.filter(x => x.hindi !== w.hindi)).slice(0, 3).map(x => x.target);
    const opts  = shuffle([w.target, ...wrong]);
    return { type: 'mcq', hindi: w.hindi, roman: w.roman, meaning: w.meaning, options: opts, correct: opts.indexOf(w.target) };
  });
}

function buildJumble(words) {
  return shuffle(words).slice(0, 5).map(w => {
    const answer  = w.roman.toLowerCase().replace(/\s+/g, '');
    const letters = shuffle(answer.split(''));
    const decoys  = shuffle('bcdfghjklmnpqrstvwxyz'.split('')).slice(0, 3);
    const tiles   = shuffle([...letters, ...decoys]);
    return { type: 'jumble', hindi: w.hindi, meaning: w.meaning, answer, tiles };
  });
}

function buildSentence(words) {
  const templates = [
    w => ({ hindi: `yah ___ hai`, answer: [w.target, 'aahe'], english: `This is ${w.meaning}` }),
    w => ({ hindi: `mujhe ___ chahiye`, answer: [w.target, 'chahibo'], english: `I want ${w.meaning}` }),
    w => ({ hindi: `___ accha hai`, answer: [w.target, 'badhiya', 'ba'], english: `${w.meaning} is good` }),
  ];
  return shuffle(words).slice(0, 5).map((w, i) => {
    const tmpl   = templates[i % templates.length](w);
    const decoys = shuffle(words.filter(x => x.hindi !== w.hindi)).slice(0, 3).map(x => x.target);
    // tiles are strings; roman is same as the tile text for regional words (already romanized)
    const tiles  = shuffle([...tmpl.answer, ...decoys]);
    return { type: 'sentence', hindi: w.hindi, roman: w.roman, english: tmpl.english, answer: tmpl.answer, tiles };
  });
}

function JumbleQuestion({ q, langCode, onCorrect, onWrong }) {
  const [picked, setPicked] = useState([]);
  const [used, setUsed]     = useState([]);
  const [status, setStatus] = useState(null);

  function tapTile(letter, idx) {
    if (used.includes(idx) || status) return;
    const newPicked = [...picked, { letter, idx }];
    setPicked(newPicked);
    setUsed(u => [...u, idx]);
    if (newPicked.length === q.answer.length) {
      const attempt = newPicked.map(x => x.letter).join('');
      if (attempt === q.answer) {
        setStatus('correct');
        setTimeout(() => onCorrect(), 900);
      } else {
        setStatus('wrong');
        setTimeout(() => { setPicked([]); setUsed([]); setStatus(null); onWrong(); }, 1100);
      }
    }
  }

  function removeLast() {
    if (!picked.length || status) return;
    const last = picked[picked.length - 1];
    setPicked(p => p.slice(0, -1));
    setUsed(u => u.filter(i => i !== last.idx));
  }

  return (
    <div>
      <div className="bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Spell the word!</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.15 }}>{q.hindi}</div>
          <button onClick={() => speakOption(q.hindi, q.answer, langCode)} style={{ background: 'rgba(250,246,240,0.1)', border: '1px solid rgba(250,246,240,0.2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🔊</button>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)' }}>{q.meaning}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap', minHeight: 52 }}>
        {q.answer.split('').map((_, i) => {
          const filled = picked[i];
          return (
            <div key={i} style={{ width: 44, height: 52, borderRadius: 10, border: `2px solid ${status === 'correct' ? '#0D6E6E' : status === 'wrong' ? '#DC2626' : filled ? '#E8611A' : 'rgba(26,18,8,0.15)'}`, background: status === 'correct' ? '#E0F2F2' : status === 'wrong' ? '#FEE2E2' : filled ? '#FDF0E8' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: status === 'correct' ? '#0D6E6E' : status === 'wrong' ? '#DC2626' : '#E8611A', transition: 'all 0.15s' }}>
              {filled?.letter || ''}
            </div>
          );
        })}
        {picked.length > 0 && !status && (
          <button onClick={removeLast} style={{ width: 44, height: 52, borderRadius: 10, border: '2px solid rgba(26,18,8,0.1)', background: 'var(--bl-surface, #fff)', fontSize: 18, cursor: 'pointer', color: 'var(--bl-muted, #7A6552)' }}>⌫</button>
        )}
      </div>

      {status && (
        <div className={`bl-feedback-bar ${status}`} style={{ marginBottom: 16, justifyContent: 'center' }}>
          <span style={{ fontSize: 18 }}>{status === 'correct' ? '🎉' : '💡'}</span>
          <span style={{ fontWeight: 700 }}>{status === 'correct' ? 'Bilkul sahi!' : `Galat! Sahi: "${q.answer}"`}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {q.tiles.map((letter, idx) => {
          const isUsed = used.includes(idx);
          return (
            <button key={idx} onClick={() => tapTile(letter, idx)} disabled={isUsed || !!status}
              style={{ width: 48, height: 52, borderRadius: 12, border: '2px solid rgba(26,18,8,0.12)', background: isUsed ? 'rgba(26,18,8,0.04)' : '#fff', fontSize: 20, fontWeight: 700, color: isUsed ? 'transparent' : '#1A1208', cursor: isUsed ? 'default' : 'pointer', boxShadow: isUsed ? 'none' : '0 2px 6px rgba(26,18,8,0.08)', transition: 'all 0.15s' }}>
              {isUsed ? '' : letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SentenceBuilderQuestion({ q, langCode, onCorrect, onWrong }) {
  const [picked, setPicked]   = useState([]);
  const [used, setUsed]       = useState([]);
  const [status, setStatus]   = useState(null);
  const [checked, setChecked] = useState(false);

  function tapWord(word, idx) {
    if (used.includes(idx) || checked) return;
    setPicked(p => [...p, { word, idx }]);
    setUsed(u => [...u, idx]);
  }

  function removeWord(pickIdx) {
    if (checked) return;
    const removed = picked[pickIdx];
    setPicked(p => p.filter((_, i) => i !== pickIdx));
    setUsed(u => u.filter(i => i !== removed.idx));
  }

  function check() {
    if (!picked.length) return;
    const attempt = picked.map(x => x.word);
    const correct = JSON.stringify(attempt) === JSON.stringify(q.answer);
    setStatus(correct ? 'correct' : 'wrong');
    setChecked(true);
    if (correct) setTimeout(() => onCorrect(), 900);
    else setTimeout(() => { setPicked([]); setUsed([]); setStatus(null); setChecked(false); onWrong(); }, 1200);
  }

  return (
    <div>
      <div className="bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Arrange the words</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 32, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.4, marginBottom: 8 }}>{q.hindi}</div>
        <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)' }}>{q.english}</div>
      </div>

      <div style={{ minHeight: 64, background: 'var(--bl-surface, #fff)', border: `2px dashed ${status === 'correct' ? '#0D6E6E' : status === 'wrong' ? '#DC2626' : 'rgba(26,18,8,0.15)'}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {picked.length === 0 && <span style={{ color: '#D0C4B8', fontSize: 14 }}>Tap words below to build the sentence...</span>}
        {picked.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => removeWord(i)}
              style={{ padding: '8px 14px', background: status === 'correct' ? '#E0F2F2' : status === 'wrong' ? '#FEE2E2' : '#FDF0E8', border: `1.5px solid ${status === 'correct' ? '#0D6E6E' : status === 'wrong' ? '#DC2626' : '#E8611A'}`, borderRadius: 10, fontSize: 15, fontWeight: 600, color: status === 'correct' ? '#0D6E6E' : status === 'wrong' ? '#DC2626' : '#E8611A', cursor: 'pointer' }}>
              {p.word}
            </button>
            <button onClick={e => { e.stopPropagation(); speakOption(p.word, p.word, langCode); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: 0.6 }}
              title="Hear pronunciation">🔊</button>
          </div>
        ))}
      </div>

      {status && (
        <div className={`bl-feedback-bar ${status}`} style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>{status === 'correct' ? '🎉' : '💡'}</span>
          <span style={{ fontWeight: 700 }}>{status === 'correct' ? 'Bilkul sahi!' : `Sahi order: "${q.answer.join(' ')}"`}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {q.tiles.map((word, idx) => {
          const isUsed = used.includes(idx);
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => tapWord(word, idx)} disabled={isUsed || checked}
                style={{ padding: '10px 14px', background: isUsed ? 'rgba(26,18,8,0.04)' : '#fff', border: '2px solid rgba(26,18,8,0.12)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: isUsed ? 'transparent' : '#1A1208', cursor: isUsed ? 'default' : 'pointer', boxShadow: isUsed ? 'none' : '0 2px 8px rgba(26,18,8,0.08)', transition: 'all 0.15s' }}>
                {isUsed ? '\u00a0\u00a0\u00a0\u00a0' : word}
              </button>
              {!isUsed && (
                <button onClick={e => { e.stopPropagation(); speakOption(word, word, langCode); }}
                  style={{ background: 'rgba(26,18,8,0.05)', border: '1px solid rgba(26,18,8,0.1)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  title="Hear pronunciation">🔊</button>
              )}
            </div>
          );
        })}
      </div>

      {!checked && picked.length > 0 && (
        <button onClick={check} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Check →
        </button>
      )}
    </div>
  );
}

export default function Quiz() {
  const { user, profile }               = useAuth();
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
  const [quizMode, setQuizMode]         = useState(() => getS('mode', null));
  const [lives, setLives]               = useState(3);
  const [streakData, setStreakData]       = useState(null); // { streak } when popup should show

  async function startQuiz(lang, mode) {
    if (loading) return;
    setLoading(true);
    setSelectedLang(lang); setS('lang', lang);
    setQuizMode(mode);     setS('mode', mode);
    const words = (LESSONS_DATA[lang] || []).flatMap(l => l.words);
    try {
      let qs;
      if (mode === 'mcq') {
        const data = await generateQuiz(words.slice(0, 12));
        qs = buildMCQ(words, data.questions);
      } else if (mode === 'jumble') {
        qs = buildJumble(words);
      } else {
        qs = buildSentence(words);
      }
      setQuestions(qs);   setS('questions', qs);
      setQIndex(0);        setS('qIndex', 0);
      setScore(0);         setS('score', 0);
      setSelected(null);   setS('selected', null);
      setDone(false);      setS('done', false);
      setSaved(false);     setS('saved', false);
      setLives(3);
    } catch (e) { alert('Quiz error: ' + e.message); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null || !questions) return;
    setSelected(i); setS('selected', i);
    if (questions[qIndex].correct === i) {
      soundCorrect();
      setScore(s => { const n = s + 1; setS('score', n); return n; });
    } else {
      soundWrong();
      setLives(l => Math.max(0, l - 1));
    }
  }

  async function next() {
    if (!questions) return;
    const nextIdx = qIndex + 1;
    if (nextIdx >= questions.length || lives === 0) {
      setDone(true); setS('done', true);
      soundComplete();
      if (user && !saved) {
        await saveQuizScore(user.id, score, questions.length, selectedLang);
        const newXp = (profile?.total_xp || 0) + score;
        const oldLevel = Math.floor((profile?.total_xp || 0) / 20);
        const newLevel = Math.floor(newXp / 20);
        if (newLevel > oldLevel) soundLevelUp();
        const { newStreak, streakIncreased } = await recordActivity(user.id);
        if (streakIncreased) setStreakData({ streak: newStreak });
        await supabase.from('profiles').update({
          total_xp: newXp,
          perfect_quizzes: score === questions.length ? (profile?.perfect_quizzes || 0) + 1 : (profile?.perfect_quizzes || 0),
        }).eq('id', user.id);
        setSaved(true); setS('saved', true);
      }
      return;
    }
    setQIndex(nextIdx); setS('qIndex', nextIdx);
    setSelected(null);  setS('selected', null);
  }

  function handleCorrect() {
    soundCorrect();
    setScore(s => { const n = s + 1; setS('score', n); return n; });
    const nextIdx = qIndex + 1;
    if (nextIdx >= questions.length) {
      setDone(true); setS('done', true);
      soundComplete();
      if (user && !saved) {
        saveQuizScore(user.id, score + 1, questions.length, selectedLang);
        supabase.from('profiles').update({ total_xp: (profile?.total_xp || 0) + score + 1 }).eq('id', user.id);
        setSaved(true); setS('saved', true);
      }
    } else { setQIndex(nextIdx); setS('qIndex', nextIdx); }
  }

  function handleWrong() {
    soundWrong();
    setLives(l => {
      const nl = Math.max(0, l - 1);
      if (nl === 0) { setDone(true); setS('done', true); }
      return nl;
    });
    const nextIdx = qIndex + 1;
    if (nextIdx < questions.length && lives > 1) { setQIndex(nextIdx); setS('qIndex', nextIdx); }
  }

  async function loadHistory() {
    if (!user) return;
    const data = await getQuizScores(user.id);
    setHistory(data); setShowHistory(true);
  }

  function reset() {
    setQuestions(null); setDone(false); setSaved(false);
    setShowHistory(false); setSelected(null); setQuizMode(null); setLives(3);
    clearS();
  }

  if (showHistory) return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted, #7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>
      <h2 className="bl-page-title">Quiz History</h2>
      <p className="bl-page-sub">Your last 10 scores</p>
      {!history?.length && <p style={{ color: 'var(--bl-muted, #7A6552)', textAlign: 'center', padding: '2rem 0' }}>No scores yet! ⚡</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history?.map((s, i) => {
          const pct = Math.round((s.score / s.total) * 100);
          const good = pct >= 70;
          return (
            <div key={i} className="bl-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: good ? '#E0F2F2' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{LANG_EMOJI[s.topic] || '⚡'}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--bl-text, #1A1208)', textTransform: 'capitalize' }}>{s.topic}</div>
                  <div style={{ fontSize: 11, color: 'var(--bl-muted, #7A6552)', marginTop: 2 }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: good ? '#0D6E6E' : '#E8611A' }}>{s.score}/{s.total}</div>
                <div style={{ fontSize: 11, color: 'var(--bl-muted, #7A6552)' }}>{pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!questions && !loading) return (
    <div style={{ maxWidth: 640 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 className="bl-page-title">Quiz ⚡</h1>
        <p className="bl-page-sub">Pick a mode then a language!</p>
      </div>

      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.75rem' }}>
        {[
          { mode: 'mcq',      icon: '🎯', label: 'Multiple Choice', desc: 'Pick the right answer',      color: '#E8611A', bg: '#FDF0E8', border: 'rgba(232,97,26,0.2)' },
          { mode: 'jumble',   icon: '🔤', label: 'Word Jumble',     desc: 'Tap letters to spell it',   color: '#0D6E6E', bg: '#E0F2F2', border: 'rgba(13,110,110,0.2)' },
          { mode: 'sentence', icon: '💬', label: 'Sentence Build',  desc: 'Arrange words in order',    color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(124,58,237,0.2)' },
        ].map(m => (
          <div key={m.mode} onClick={() => { soundTap(); setQuizMode(quizMode === m.mode ? null : m.mode); }}
            style={{ padding: '18px 14px', borderRadius: 16, background: quizMode === m.mode ? m.bg : '#fff', border: `2px solid ${quizMode === m.mode ? m.color : 'rgba(26,18,8,0.08)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', boxShadow: quizMode === m.mode ? `0 4px 16px ${m.border}` : 'none' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: quizMode === m.mode ? m.color : '#1A1208', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--bl-muted, #7A6552)', lineHeight: 1.4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {quizMode && (
        <div className="fade-up-3">
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--bl-muted, #7A6552)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Now pick a language</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.75rem' }}>
            {LANGS.map(lang => (
              <button key={lang} onClick={() => startQuiz(lang, quizMode)} className="bl-lang-pill" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span>{LANG_EMOJI[lang]}</span>
                <span style={{ textTransform: 'capitalize' }}>{lang}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={loadHistory} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FBF3E2', color: '#C8912A', border: '1.5px solid rgba(200,145,42,0.3)', borderRadius: 12, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        📊 View past scores
      </button>
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem 0' }} className="fade-up">
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: 'var(--bl-text, #1A1208)', marginBottom: 8, textTransform: 'capitalize' }}>
        {quizMode === 'mcq' ? 'AI generating questions...' : `Building ${quizMode} quiz...`}
      </div>
      <div className="bl-shimmer" style={{ width: 200, height: 8, margin: '20px auto 0', borderRadius: 99 }} />
    </div>
  );

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const perfect = score === questions.length;
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }} className="fade-up">
        <div style={{ fontSize: 72, marginBottom: 8 }}>{perfect ? '🏆' : pct >= 60 ? '🌟' : '💪'}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: 'var(--bl-text, #1A1208)', marginBottom: 8 }}>
          {perfect ? 'Ekdum Perfect!' : pct >= 60 ? 'Bahut Badhiya!' : 'Keep Practicing!'}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--bl-muted, #7A6552)', marginBottom: 6 }}>
          You scored <strong style={{ color: 'var(--bl-text, #1A1208)' }}>{score}</strong> out of <strong style={{ color: 'var(--bl-text, #1A1208)' }}>{questions.length}</strong>
        </p>
        {saved && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0F2F2', color: '#0D6E6E', borderRadius: 99, padding: '6px 14px', fontSize: 13, fontWeight: 600, marginBottom: '1.5rem' }}>
            ✓ Score saved! +{score} XP earned!
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.75rem' }}>
          {[
            { val: score, label: 'Correct', color: '#0D6E6E', bg: '#E0F2F2' },
            { val: questions.length - score, label: 'Wrong', color: '#DC2626', bg: '#FEE2E2' },
            { val: `${pct}%`, label: 'Score', color: '#C8912A', bg: '#FBF3E2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 8px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--bl-muted, #7A6552)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {streakData && <StreakPopup streak={streakData.streak} onClose={() => setStreakData(null)} />}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => startQuiz(selectedLang, quizMode)} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try Again 🔄</button>
          <button onClick={reset} style={{ background: '#FDF0E8', color: '#E8611A', border: '1.5px solid rgba(232,97,26,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Change Mode</button>
          <button onClick={loadHistory} style={{ background: '#FBF3E2', color: '#C8912A', border: '1.5px solid rgba(200,145,42,0.3)', borderRadius: 12, padding: '13px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>History 📊</button>
        </div>
      </div>
    );
  }

  // Render streak popup when earned
  const streakPopupEl = streakData ? <StreakPopup streak={streakData.streak} onClose={() => { setStreakData(null); }} /> : null;

  const q        = questions[qIndex];
  const progress = (qIndex / questions.length) * 100;

  return (
    <div style={{ maxWidth: 580 }}>
      {streakPopupEl}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <button onClick={reset} style={{ background: 'rgba(26,18,8,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bl-muted, #7A6552)', flexShrink: 0 }}>✕</button>
        <div style={{ flex: 1, height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} style={{ fontSize: 16, opacity: i < lives ? 1 : 0.2 }}>❤️</span>
          ))}
        </div>
        <div className="bl-score-badge">{score} pts</div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600, color: 'var(--bl-text, #1A1208)' }}>Question {qIndex + 1}</span>
        <span>of {questions.length}</span>
        <span>·</span>
        <span style={{ textTransform: 'capitalize' }}>{selectedLang} {LANG_EMOJI[selectedLang]}</span>
        <span>·</span>
        <span style={{ color: '#7C3AED' }}>{quizMode === 'mcq' ? '🎯 MCQ' : quizMode === 'jumble' ? '🔤 Jumble' : '💬 Sentence'}</span>
      </div>

      {q.type === 'mcq' && (
        <>
          <div className="fade-up-2 bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>What is this in {selectedLang}?</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.15 }}>{q.hindi}</div>
              <button onClick={() => speakOption(q.hindi, q.roman, 'hindi')} style={{ background: 'rgba(250,246,240,0.1)', border: '1px solid rgba(250,246,240,0.2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Hear Hindi pronunciation">🔊</button>
            </div>
            {q.roman && (
              <div style={{ display: 'inline-flex', gap: 8, background: 'rgba(250,246,240,0.08)', borderRadius: 99, padding: '5px 14px', fontSize: 13, color: 'rgba(250,246,240,0.55)' }}>
                <span>{q.roman}</span>{q.meaning && <><span>·</span><span>{q.meaning}</span></>}
              </div>
            )}
          </div>
          <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {q.options.map((opt, i) => {
              const answered = selected !== null;
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let cls = '';
              if (answered && isCorrect) cls = 'correct';
              else if (answered && isSelected) cls = 'wrong';
              return (
                <button key={i} onClick={() => pick(i)} disabled={answered} className={`bl-option-btn ${cls}`} style={{ justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="bl-option-letter">{answered && isCorrect ? '✓' : answered && isSelected ? '✕' : OPTION_LETTERS[i]}</span>
                    {opt}
                  </span>
                  <span
                    onClick={e => { e.stopPropagation(); speakOption(opt, opt, selectedLang); }}
                    style={{ fontSize: 16, opacity: 0.55, cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                    title="Hear pronunciation"
                  >🔊</span>
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="slide-up">
              <div className={`bl-feedback-bar ${selected === q.correct ? 'correct' : 'wrong'}`} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{selected === q.correct ? '🎉' : '💡'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{selected === q.correct ? 'Sahi ba! Bahut badhiya!' : 'Galat jawab!'}</div>
                  {selected !== q.correct && <div style={{ fontSize: 13, opacity: 0.8 }}>Sahi jawab: <strong>{q.options[q.correct]}</strong></div>}
                </div>
              </div>
              <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                {qIndex + 1 >= questions.length ? 'See results →' : 'Next question →'}
              </button>
            </div>
          )}
        </>
      )}

      {q.type === 'jumble' && (
        <JumbleQuestion key={`j-${qIndex}`} q={q} langCode={selectedLang} onCorrect={handleCorrect} onWrong={handleWrong} />
      )}

      {q.type === 'sentence' && (
        <SentenceBuilderQuestion key={`s-${qIndex}`} q={q} langCode={selectedLang} onCorrect={handleCorrect} onWrong={handleWrong} />
      )}
    </div>
  );
}