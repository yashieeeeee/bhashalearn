import { useState } from 'react';
import { LESSONS_DATA } from '../data/content';
import { useAuth } from '../context/AuthContext';
import { saveQuizScore, getQuizScores } from '../utils/supabase';
import { generateQuiz } from '../utils/claude';

export default function Quiz() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const LANGS = ['bhojpuri','tamil','telugu','marathi','bengali','gujarati','kannada','malayalam','punjabi','odia','urdu','assamese'];

async function startQuiz(lang) {
  if (loading) return;
  setLoading(true); setSelectedLang(lang);
  const allWords = (LESSONS_DATA[lang] || []).flatMap(l => l.words).slice(0, 12);
  try {
    const data = await generateQuiz(allWords);
    setQuestions(data.questions);
    setQIndex(0); setScore(0); setSelected(null); setDone(false); setSaved(false);
  } catch (e) {
    alert('Quiz error: ' + e.message);
  }
  setLoading(false);
}
  function pick(i) {
    if (selected !== null || !questions) return;
    setSelected(i);
    if (questions[qIndex].correct === i) setScore(s => s + 1);
  }

  async function next() {
    if (!questions) return;
    if (qIndex + 1 >= questions.length) {
      setDone(true);
      const finalScore = score + (selected === questions[qIndex].correct ? 1 : 0);
      if (user && !saved) {
        await saveQuizScore(user.id, finalScore, questions.length, selectedLang);
        setSaved(true);
      }
      return;
    }
    setQIndex(i => i + 1); setSelected(null);
  }

  async function loadHistory() {
    if (!user) return;
    const data = await getQuizScores(user.id);
    setHistory(data); setShowHistory(true);
  }

  function reset() { setQuestions(null); setDone(false); setSaved(false); setShowHistory(false); setSelected(null); }

  if (showHistory) return (
    <div style={{ maxWidth: 480 }} className="fade-up">
      <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: '#1A1208', marginBottom: '1.25rem' }}>Quiz history</h2>
      {history?.length === 0 && <p style={{ color: '#7A6552' }}>No scores yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history?.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1208', textTransform: 'capitalize' }}>{s.topic}</div>
              <div style={{ fontSize: 12, color: '#7A6552', marginTop: 2 }}>{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: s.score >= s.total * 0.7 ? '#0D6E6E' : '#E8611A' }}>{s.score}/{s.total}</div>
              <div style={{ fontSize: 11, color: '#7A6552' }}>{Math.round((s.score / s.total) * 100)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Language picker
  if (!questions && !loading) return (
    <div style={{ maxWidth: 600 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Quiz</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Pick a language — Claude will generate 5 questions for you!</p>
      </div>
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.5rem' }}>
        {LANGS.map(lang => (
          <button key={lang} onClick={() => startQuiz(lang)} style={{ padding: '10px 18px', borderRadius: 10, border: '0.5px solid rgba(26,18,8,0.12)', background: '#fff', color: '#1A1208', fontSize: 14, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1A1208'; e.currentTarget.style.color = '#FAF6F0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1A1208'; }}>
            {lang}
          </button>
        ))}
      </div>
      <button onClick={loadHistory} style={{ background: '#FBF3E2', color: '#C8912A', border: '0.5px solid #C8912A44', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>View past scores</button>
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }} className="fade-up">
      <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', textTransform: 'capitalize' }}>Generating {selectedLang} quiz...</div>
      <div style={{ fontSize: 14, color: '#7A6552', marginTop: 8 }}>Claude is writing your questions</div>
    </div>
  );

  if (done) return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }} className="fade-up">
      <div style={{ fontSize: 56, marginBottom: '1rem' }}>{score >= 4 ? '🏆' : score >= 2 ? '👍' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>{score >= 4 ? 'Bahut Badhiya!' : score >= 2 ? 'Neeek Rahe!' : 'Keep Practicing!'}</h2>
      <p style={{ fontSize: 15, color: '#7A6552', marginBottom: '0.5rem' }}>You scored {score} out of {questions.length}</p>
      {saved && <p style={{ fontSize: 13, color: '#0D6E6E', marginBottom: '1.5rem' }}>✓ Score saved!</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => startQuiz(selectedLang)} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Try Again</button>
        <button onClick={reset} style={{ background: '#FDF0E8', color: '#E8611A', border: '0.5px solid #E8611A44', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Change Language</button>
        <button onClick={loadHistory} style={{ background: '#FBF3E2', color: '#C8912A', border: '0.5px solid #C8912A44', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>History</button>
      </div>
    </div>
  );

  const q = questions[qIndex];
  return (
    <div style={{ maxWidth: 560 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, color: '#7A6552' }}>Question {qIndex + 1} of {questions.length} · <span style={{ textTransform: 'capitalize' }}>{selectedLang}</span></div>
        <div style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.25)', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 500, color: '#C8912A' }}>Score: {score}</div>
      </div>
      <div className="fade-up" style={{ height: 5, background: '#F0E8DC', borderRadius: 99, marginBottom: '2rem' }}>
        <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${(qIndex / questions.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>
      <div className="fade-up-2" style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What is this in {selectedLang}?</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 44, fontWeight: 500, color: '#FAF6F0', lineHeight: 1.2 }}>{q.hindi}</div>
        {q.roman && <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)', marginTop: 8 }}>{q.roman} · {q.meaning}</div>}
      </div>
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
        {q.options.map((opt, i) => {
          let bg = '#fff', border = 'rgba(26,18,8,0.12)', color = '#1A1208';
          if (selected !== null) {
            if (i === q.correct) { bg = '#E0F2F2'; border = '#0D6E6E'; color = '#0D6E6E'; }
            else if (i === selected && i !== q.correct) { bg = '#FDF0E8'; border = '#E8611A'; color = '#E8611A'; }
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '14px 10px', fontSize: 14, fontWeight: 500, color, cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.18s', fontFamily: "'Noto Sans Devanagari','DM Sans',sans-serif" }}
              onMouseEnter={e => selected === null && (e.currentTarget.style.borderColor = '#E8611A')}
              onMouseLeave={e => selected === null && (e.currentTarget.style.borderColor = 'rgba(26,18,8,0.12)')}>{opt}</button>
          );
        })}
      </div>
      {selected !== null && (
        <>
          <div className="fade-up" style={{ marginBottom: '1rem', padding: '12px 16px', borderRadius: 10, background: selected === q.correct ? '#E0F2F2' : '#FDF0E8', color: selected === q.correct ? '#0D6E6E' : '#E8611A', fontSize: 14, fontWeight: 500 }}>
            {selected === q.correct ? '✓ Sahi ba! Bahut badhiya!' : `✗ Galat! Sahi jawab: ${q.options[q.correct]}`}
          </div>
          <button className="fade-up" onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            {qIndex + 1 >= questions.length ? 'See results →' : 'Next question →'}
          </button>
        </>
      )}
    </div>
  );
}
