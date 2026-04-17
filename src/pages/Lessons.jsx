import { useState } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';
import { generateLesson, generateQuiz } from '../utils/claude';

function LessonDetail({ lesson, lang, onBack }) {
  const [activeWord, setActiveWord] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  async function startQuiz() {
    setQuizLoading(true); setQuizMode(true);
    try {
      const data = await generateQuiz(lesson.words);
      setQuiz(data.questions);
    } catch { setQuiz(null); }
    setQuizLoading(false);
  }

  function pick(i) {
    if (selected !== null) return;
    setSelected(i);
    if (quiz[qIndex].correct === i) setScore(s => s + 1);
  }

  function next() {
    if (qIndex + 1 >= quiz.length) { setQuizDone(true); return; }
    setQIndex(q => q + 1); setSelected(null);
  }

  if (quizMode) {
    if (quizLoading) return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208' }}>Generating your quiz...</div>
      </div>
    );
    if (!quiz) return <div style={{ color: '#E8611A', padding: '2rem' }}>Could not generate quiz. <button onClick={() => setQuizMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8611A', textDecoration: 'underline' }}>Go back</button></div>;
    if (quizDone) return (
      <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }} className="fade-up">
        <div style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : '💪'}</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#1A1208', marginBottom: 8 }}>{score >= 4 ? 'Bahut Badhiya!' : 'Keep Practicing!'}</h2>
        <p style={{ color: '#7A6552', marginBottom: '1.5rem' }}>You scored {score} out of {quiz.length}</p>
        <button onClick={() => { setQuizMode(false); setQuiz(null); setQIndex(0); setScore(0); setSelected(null); setQuizDone(false); }} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Back to lesson</button>
      </div>
    );
    const q = quiz[qIndex];
    return (
      <div style={{ maxWidth: 520 }} className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 13, color: '#7A6552' }}>Question {qIndex + 1} of {quiz.length}</div>
          <div style={{ background: '#FBF3E2', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 500, color: '#C8912A' }}>Score: {score}</div>
        </div>
        <div style={{ height: 5, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
          <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${(qIndex / quiz.length) * 100}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What is this in {lang?.name}?</div>
          <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 44, fontWeight: 500, color: '#FAF6F0' }}>{q.hindi}</div>
          {q.roman && <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.5)', marginTop: 6 }}>{q.roman} · {q.meaning}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {q.options.map((opt, i) => {
            let bg = '#fff', border = 'rgba(26,18,8,0.12)', color = '#1A1208';
            if (selected !== null) {
              if (i === q.correct) { bg = '#E0F2F2'; border = '#0D6E6E'; color = '#0D6E6E'; }
              else if (i === selected) { bg = '#FDF0E8'; border = '#E8611A'; color = '#E8611A'; }
            }
            return <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '13px 10px', fontSize: 14, fontWeight: 500, color, cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.18s' }}>{opt}</button>;
          })}
        </div>
        {selected !== null && (
          <>
            <div style={{ padding: '11px 14px', borderRadius: 10, background: selected === q.correct ? '#E0F2F2' : '#FDF0E8', color: selected === q.correct ? '#0D6E6E' : '#E8611A', fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
              {selected === q.correct ? '✓ Sahi ba! Bahut badhiya!' : `✗ Galat! Sahi jawab: ${q.options[q.correct]}`}
            </div>
            <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              {qIndex + 1 >= quiz.length ? 'See results →' : 'Next →'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem', padding: 0 }}>← Back to lessons</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ width: 52, height: 52, background: '#FDF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{lesson.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A1208' }}>{lesson.title} — {lang?.name}</h2>
          <p style={{ fontSize: 13, color: '#7A6552', marginTop: 2 }}>{lesson.words.length} words · tap any word to expand</p>
        </div>
        <button onClick={startQuiz} style={{ background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>⚡ AI Quiz</button>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {lesson.words.map((word, i) => (
          <div key={i} onClick={() => setActiveWord(activeWord === i ? null : i)}
            style={{ background: activeWord === i ? '#1A1208' : '#fff', border: activeWord === i ? '0.5px solid #1A1208' : '0.5px solid rgba(26,18,8,0.1)', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                {/* Hindi word */}
                <div style={{ minWidth: 80 }}>
                  <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 500, color: activeWord === i ? '#FAF6F0' : '#1A1208' }}>{word.hindi}</div>
                  <div style={{ fontSize: 11, color: activeWord === i ? 'rgba(250,246,240,0.5)' : '#7A6552', marginTop: 2 }}>Hindi</div>
                </div>
                <span style={{ color: '#E8611A', fontSize: 18, flexShrink: 0 }}>→</span>
                {/* Target word — always clearly visible */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: activeWord === i ? '#F5C49A' : '#E8611A' }}>{word.target}</div>
                  <div style={{ fontSize: 11, color: activeWord === i ? 'rgba(250,246,240,0.5)' : '#7A6552', marginTop: 2 }}>{word.roman}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: activeWord === i ? 'rgba(250,246,240,0.5)' : '#7A6552', marginLeft: 8 }}>{activeWord === i ? '▲' : '▼'}</span>
            </div>
            {activeWord === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(250,246,240,0.15)', fontSize: 14, color: 'rgba(250,246,240,0.75)' }}>
                Meaning: <strong style={{ color: '#FAF6F0' }}>{word.meaning}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Lessons() {
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [selected, setSelected] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiLesson, setAiLesson] = useState(null);
  const [error, setError] = useState('');

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);
  const lessons = LESSONS_DATA[selectedLang] || [];

  function changeLang(code) {
    setSelectedLang(code);
    setSelected(null);
    setAiLesson(null);
    setCustomTopic('');
    setError('');
  }

  async function generate() {
    if (!customTopic.trim()) return;
    setGenerating(true); setError('');
    try {
      const data = await generateLesson(`${customTopic.trim()} in ${currentLang?.name}`);
      const lesson = { ...data, id: 99, icon: '✨', progress: 0, status: 'new' };
      setAiLesson(lesson);
      setSelected(lesson);
    } catch { setError('Could not generate lesson. Please try again.'); }
    setGenerating(false);
  }

  if (selected) return <LessonDetail lesson={selected} lang={currentLang} onBack={() => setSelected(null)} />;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Lessons</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Choose a language and learn word by word.</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
            padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            background: selectedLang === lang.code ? '#1A1208' : '#fff',
            color: selectedLang === lang.code ? '#FAF6F0' : '#1A1208',
            border: selectedLang === lang.code ? '0.5px solid #1A1208' : '0.5px solid rgba(26,18,8,0.15)',
          }}>
            {lang.flag} {lang.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{lang.script}</span>
          </button>
        ))}
      </div>

      {/* AI lesson generator */}
      <div className="fade-up-3" style={{ background: '#1A1208', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>✨ AI Lesson Generator — {currentLang?.name}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder={`e.g. Colors, Animals, Weather, Body parts...`}
            style={{ flex: 1, background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '10px 13px', fontSize: 14, color: '#FAF6F0', outline: 'none' }} />
          <button onClick={generate} disabled={!customTopic.trim() || generating} style={{ background: customTopic.trim() && !generating ? '#E8611A' : 'rgba(250,246,240,0.1)', color: customTopic.trim() && !generating ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: customTopic.trim() && !generating ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
            {generating ? 'Generating...' : 'Generate →'}
          </button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 13, color: '#F5C49A' }}>{error}</div>}
        {aiLesson && !selected && (
          <div onClick={() => setSelected(aiLesson)} style={{ marginTop: 12, background: 'rgba(232,97,26,0.15)', border: '0.5px solid rgba(232,97,26,0.3)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#F5C49A' }}>✨ {aiLesson.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', marginTop: 2 }}>{aiLesson.words?.length} words generated</div>
            </div>
            <span style={{ color: '#E8611A' }}>→</span>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div style={{ display: 'grid', gap: 12 }}>
        {lessons.map((lesson, i) => (
          <div key={lesson.id} className={`fade-up-${Math.min(i + 3, 5)}`}
            onClick={() => setSelected(lesson)}
            style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
            <div style={{ width: 46, height: 46, background: '#FDF0E8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{lesson.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1208' }}>{lesson.title}</div>
              <div style={{ fontSize: 12, color: '#7A6552', marginTop: 2 }}>
                {lesson.words.slice(0, 3).map(w => w.roman).join(', ')}...
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#7A6552' }}>{lesson.words.length} words →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
