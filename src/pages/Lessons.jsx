import { useState, useEffect } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';
import { generateLesson, generateQuiz, chatWithTutor } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: 'Words', icon: '🔤', desc: 'Learn individual words', color: '#0D6E6E', bg: '#E0F2F2', xpNeeded: 0 },
  { id: 2, name: 'Sentences', icon: '💬', desc: 'Build simple sentences', color: '#E8611A', bg: '#FDF0E8', xpNeeded: 3 },
  { id: 3, name: 'Paragraphs', icon: '📖', desc: 'Read & translate full passages', color: '#7C3AED', bg: '#F5F3FF', xpNeeded: 6 },
];

// ─── Paragraph practice component ────────────────────────────────────────────
function ParagraphMode({ lang, onBack }) {
  const [paragraph, setParagraph] = useState('');
  const [translation, setTranslation] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');

  async function generateParagraph() {
    if (!topic.trim()) return;
    setGenerating(true); setFeedback(''); setUserAnswer(''); setTranslation('');
    try {
      const text = await chatWithTutor(
        `Write a short 3-4 sentence paragraph in Hindi about "${topic}" that a beginner can practice translating to ${lang.name}. 
        Then provide the ${lang.name} translation.
        Format your response EXACTLY like this:
        HINDI: [paragraph in Hindi]
        TRANSLATION: [${lang.name} translation]`,
        lang.name
      );
      const hindiMatch = text.match(/HINDI:\s*([\s\S]*?)(?=TRANSLATION:|$)/i);
      const transMatch = text.match(/TRANSLATION:\s*([\s\S]*?)$/i);
      if (hindiMatch) setParagraph(hindiMatch[1].trim());
      if (transMatch) setTranslation(transMatch[1].trim());
    } catch (e) {
      setParagraph('Could not generate paragraph. Please try again.');
    }
    setGenerating(false);
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const result = await chatWithTutor(
        `A student is translating this Hindi paragraph to ${lang.name}:
        Hindi: "${paragraph}"
        Correct ${lang.name} translation: "${translation}"
        Student's attempt: "${userAnswer}"
        
        Give encouraging feedback in 3-4 sentences. Point out what they got right and gently correct mistakes. 
        If they got it mostly right, start with "Bahut badhiya!"`,
        lang.name
      );
      setFeedback(result);
    } catch (e) {
      setFeedback('Could not check. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="fade-up" style={{ maxWidth: 640 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back to levels</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, background: '#F5F3FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📖</div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A1208', margin: 0 }}>Paragraph Practice — {lang?.name}</h2>
          <p style={{ fontSize: 13, color: '#7A6552', margin: 0 }}>Read Hindi, translate to {lang?.name}</p>
        </div>
      </div>

      {/* Topic generator */}
      <div style={{ background: '#1A1208', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>✨ Generate a paragraph</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateParagraph()}
            placeholder="Topic: My family, Morning routine, Indian food..."
            style={{ flex: 1, background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '10px 13px', fontSize: 14, color: '#FAF6F0', outline: 'none' }} />
          <button onClick={generateParagraph} disabled={!topic.trim() || generating}
            style={{ background: topic.trim() && !generating ? '#7C3AED' : 'rgba(250,246,240,0.1)', color: topic.trim() && !generating ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: topic.trim() && !generating ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
            {generating ? 'Generating...' : 'Generate →'}
          </button>
        </div>
      </div>

      {/* Paragraph display */}
      {paragraph && (
        <>
          <div style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7A6552', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Hindi Paragraph — Translate this</div>
            <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, color: '#1A1208', lineHeight: 1.8, margin: 0 }}>{paragraph}</p>
          </div>

          <div style={{ background: '#1A1208', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Your {lang?.name} translation</div>
            <textarea value={userAnswer} onChange={e => { setUserAnswer(e.target.value); setFeedback(''); }}
              placeholder={`Write your ${lang?.name} translation here...`}
              style={{ width: '100%', background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#FAF6F0', resize: 'none', minHeight: 100, outline: 'none', marginBottom: 10, fontFamily: "'Noto Sans Devanagari','DM Sans',sans-serif", boxSizing: 'border-box' }} />
            <button onClick={checkAnswer} disabled={!userAnswer.trim() || loading}
              style={{ width: '100%', background: userAnswer.trim() && !loading ? '#7C3AED' : 'rgba(250,246,240,0.1)', color: userAnswer.trim() && !loading ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 500, cursor: userAnswer.trim() && !loading ? 'pointer' : 'not-allowed' }}>
              {loading ? '✨ AI is checking...' : 'Check my translation →'}
            </button>
          </div>

          {feedback && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: feedback.startsWith('Bahut') ? '#E0F2F2' : '#FDF0E8', color: feedback.startsWith('Bahut') ? '#0D6E6E' : '#E8611A', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
              {feedback}
            </div>
          )}

          {/* Show translation hint */}
          {translation && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: '#7A6552', padding: '8px 0' }}>Show correct translation 👁️</summary>
              <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '1rem', marginTop: 8, fontSize: 14, color: '#7C3AED', lineHeight: 1.7 }}>{translation}</div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sentence builder component ───────────────────────────────────────────────
function SentenceMode({ lesson, lang, onBack, onComplete }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState(null);

useEffect(() => {
    generateSentences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateSentences() {
  setLoading(true);
  try {
    // Build sentences locally from lesson words — no API needed!
    const templates = [
      (w) => ({ hindi: `यह ${w.hindi} है`, target: `यह ${w.target} है`, options: shuffle([w.target, ...getWrongOptions(w)]) }),
      (w) => ({ hindi: `मुझे ${w.hindi} चाहिए`, target: `मुझे ${w.target} चाहिए`, options: shuffle([w.target, ...getWrongOptions(w)]) }),
      (w) => ({ hindi: `${w.hindi} अच्छा है`, target: `${w.target} अच्छा है`, options: shuffle([w.target, ...getWrongOptions(w)]) }),
      (w) => ({ hindi: `यह मेरा ${w.hindi} है`, target: `यह मेरा ${w.target} है`, options: shuffle([w.target, ...getWrongOptions(w)]) }),
      (w) => ({ hindi: `क्या यह ${w.hindi} है?`, target: `क्या यह ${w.target} है?`, options: shuffle([w.target, ...getWrongOptions(w)]) }),
    ];

    function getWrongOptions(word) {
      return lesson.words
        .filter(w => w.hindi !== word.hindi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.target);
    }

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

    const picked = lesson.words.sort(() => Math.random() - 0.5).slice(0, 5);
    const built = picked.map((word, i) => {
      const s = templates[i % templates.length](word);
      return {
        hindi: s.hindi,
        target: s.target,
        options: s.options,
        correct: s.options.indexOf(word.target),
      };
    });

    setSentences(built);
  } catch (e) {
    setSentences(null);
  }
  setLoading(false);
}

  function pick(i) {
    if (selected !== null) return;
    setSelected(i);
    if (sentences[step].correct === i) setScore(s => s + 1);
  }

  function next() {
    if (step + 1 >= sentences.length) { setDone(true); onComplete && onComplete(score + (selected === sentences[step].correct ? 1 : 0)); return; }
    setStep(s => s + 1); setSelected(null);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>💬</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208' }}>Building sentence exercises...</div>
    </div>
  );

  if (!sentences) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>😔</div>
      <p style={{ color: '#E8611A' }}>Could not generate sentences.</p>
      <button onClick={generateSentences} style={{ background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', marginTop: 12 }}>Try again</button>
    </div>
  );

  if (done) return (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }} className="fade-up">
      <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= 4 ? '🏆' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#1A1208', marginBottom: 8 }}>
        {score >= 4 ? 'Bahut Badhiya!' : 'Keep Going!'}
      </h2>
      <p style={{ color: '#7A6552', marginBottom: '1.5rem' }}>You got {score} out of {sentences.length} sentences right!</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => { setStep(0); setScore(0); setSelected(null); setDone(false); generateSentences(); }}
          style={{ background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Try again</button>
        <button onClick={onBack}
          style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Back to levels</button>
      </div>
    </div>
  );

  const s = sentences[step];
  return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, color: '#7A6552' }}>Sentence {step + 1} of {sentences.length}</div>
        <div style={{ background: '#FDF0E8', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 500, color: '#E8611A' }}>Score: {score}</div>
      </div>

      <div style={{ height: 5, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
        <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${(step / sentences.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>

      <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Translate to {lang?.name}</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#FAF6F0', lineHeight: 1.4 }}>{s.hindi}</div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
        {s.options.map((opt, i) => {
          let bg = '#fff', border = 'rgba(26,18,8,0.12)', color = '#1A1208';
          if (selected !== null) {
            if (i === s.correct) { bg = '#E0F2F2'; border = '#0D6E6E'; color = '#0D6E6E'; }
            else if (i === selected) { bg = '#FDF0E8'; border = '#E8611A'; color = '#E8611A'; }
          }
          return (
            <button key={i} onClick={() => pick(i)}
              style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '13px 16px', fontSize: 14, fontWeight: 500, color, cursor: selected !== null ? 'default' : 'pointer', transition: 'all 0.18s', textAlign: 'left' }}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <div style={{ padding: '11px 14px', borderRadius: 10, background: selected === s.correct ? '#E0F2F2' : '#FDF0E8', color: selected === s.correct ? '#0D6E6E' : '#E8611A', fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
            {selected === s.correct ? '✓ Sahi! Bahut badhiya!' : `✗ Sahi jawab: ${s.options[s.correct]}`}
          </div>
          <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            {step + 1 >= sentences.length ? 'See results →' : 'Next sentence →'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Word Quiz (Level 1) ──────────────────────────────────────────────────────
function WordQuiz({ lesson, lang, onBack, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadQuiz(); }, []);

  async function loadQuiz() {
    setLoading(true);
    try {
      const data = await generateQuiz(lesson.words);
      setQuiz(data.questions);
    } catch { setQuiz(null); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null || !quiz) return;
    setSelected(i);
    if (quiz[qIndex].correct === i) setScore(s => s + 1);
  }

  function next() {
    if (qIndex + 1 >= quiz.length) {
      setDone(true);
      onComplete && onComplete(score + (selected === quiz[qIndex].correct ? 1 : 0));
      return;
    }
    setQIndex(i => i + 1); setSelected(null);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><div style={{ fontSize: 36 }}>⚡</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginTop: 16 }}>Generating word quiz...</div></div>;
  if (!quiz) return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#E8611A' }}>Could not load quiz. <button onClick={loadQuiz} style={{ background: 'none', border: 'none', color: '#E8611A', textDecoration: 'underline', cursor: 'pointer' }}>Try again</button></div>;

  if (done) return (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }} className="fade-up">
      <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= 4 ? '🏆' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#1A1208', marginBottom: 8 }}>{score >= 4 ? 'Bahut Badhiya!' : 'Keep Practicing!'}</h2>
      <p style={{ color: '#7A6552', marginBottom: '1.5rem' }}>You scored {score} out of {quiz.length}!</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => { setQIndex(0); setScore(0); setSelected(null); setDone(false); loadQuiz(); }}
          style={{ background: '#0D6E6E', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Retry</button>
        <button onClick={onBack}
          style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Back</button>
      </div>
    </div>
  );

  const q = quiz[qIndex];
  return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, color: '#7A6552' }}>Question {qIndex + 1} of {quiz.length}</div>
        <div style={{ background: '#E0F2F2', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 500, color: '#0D6E6E' }}>Score: {score}</div>
      </div>
      <div style={{ height: 5, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
        <div style={{ height: '100%', borderRadius: 99, background: '#0D6E6E', width: `${(qIndex / quiz.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>
      <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.45)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What is this in {lang?.name}?</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 44, fontWeight: 500, color: '#FAF6F0' }}>{q.hindi}</div>
        {q.roman && <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.5)', marginTop: 6 }}>{q.roman}</div>}
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
            {selected === q.correct ? '✓ Sahi! Bahut badhiya!' : `✗ Sahi jawab: ${q.options[q.correct]}`}
          </div>
          <button onClick={next} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            {qIndex + 1 >= quiz.length ? 'See results →' : 'Next →'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Lesson detail (word viewer) ──────────────────────────────────────────────
function LessonDetail({ lesson, lang, onBack, onStartQuiz, onStartSentences }) {
  const [activeWord, setActiveWord] = useState(null);

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6552', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem', padding: 0 }}>← Back to lessons</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ width: 52, height: 52, background: '#FDF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{lesson.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1A1208', margin: 0 }}>{lesson.title} — {lang?.name}</h2>
          <p style={{ fontSize: 13, color: '#7A6552', marginTop: 2 }}>{lesson.words.length} words · tap any word to expand</p>
        </div>
      </div>

      {/* Practice buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
        <button onClick={onStartQuiz}
          style={{ flex: 1, background: '#E0F2F2', color: '#0D6E6E', border: '1.5px solid #0D6E6E44', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          🔤 Word Quiz
        </button>
        <button onClick={onStartSentences}
          style={{ flex: 1, background: '#FDF0E8', color: '#E8611A', border: '1.5px solid #E8611A44', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          💬 Sentence Builder
        </button>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {lesson.words.map((word, i) => (
          <div key={i} onClick={() => setActiveWord(activeWord === i ? null : i)}
            style={{ background: activeWord === i ? '#1A1208' : '#fff', border: activeWord === i ? '0.5px solid #1A1208' : '0.5px solid rgba(26,18,8,0.1)', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: 1 }}>
                <div style={{ minWidth: 80 }}>
                  <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 500, color: activeWord === i ? '#FAF6F0' : '#1A1208' }}>{word.hindi}</div>
                  <div style={{ fontSize: 11, color: activeWord === i ? 'rgba(250,246,240,0.5)' : '#7A6552', marginTop: 2 }}>Hindi</div>
                </div>
                <span style={{ color: '#E8611A', fontSize: 18, flexShrink: 0 }}>→</span>
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

// ─── Main Lessons page ────────────────────────────────────────────────────────
export default function Lessons() {
  const { user, profile } = useAuth();
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [activeLevel, setActiveLevel] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [mode, setMode] = useState('list'); // list | words | wordquiz | sentences | paragraphs
  const [xpMap, setXpMap] = useState({});
  const xp = xpMap[selectedLang] || 0;
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [, setAiLesson] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
  if (profile?.xp_map) setXpMap(profile.xp_map);
}, [profile]);

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);
  const lessons = LESSONS_DATA[selectedLang] || [];

  const unlockedLevel = xp >= 6 ? 3 : xp >= 3 ? 2 : 1;

  function changeLang(code) {
    setSelectedLang(code);
    setSelectedLesson(null);
    setMode('list');
    setAiLesson(null);
    setCustomTopic('');
    setError('');
  }

 async function handleComplete(score) {
  if (score >= 3 && user) {
    const newXp = Math.min((xpMap[selectedLang] || 0) + 2, 10);
    const newMap = { ...xpMap, [selectedLang]: newXp };
    setXpMap(newMap);
    await supabase.from('profiles').update({
      xp_map: newMap,
      total_xp: (profile?.total_xp || 0) + 2,
      lessons_completed: (profile?.lessons_completed || 0) + 1,
    }).eq('id', user.id);
  }
}

  async function generate() {
    if (!customTopic.trim()) return;
    setGenerating(true); setError('');
    try {
      const data = await generateLesson(`${customTopic.trim()} in ${currentLang?.name}`);
      const lesson = { ...data, id: 99, icon: '✨', progress: 0, status: 'new' };
      setAiLesson(lesson);
      setSelectedLesson(lesson);
      setMode('words');
    } catch { setError('Could not generate lesson. Please try again.'); }
    setGenerating(false);
  }

  // Render modes
  if (mode === 'wordquiz' && selectedLesson) return <WordQuiz lesson={selectedLesson} lang={currentLang} onBack={() => setMode('words')} onComplete={handleComplete} />;
  if (mode === 'sentences' && selectedLesson) return <SentenceMode lesson={selectedLesson} lang={currentLang} onBack={() => setMode('words')} onComplete={handleComplete} />;
  if (mode === 'paragraphs') return <ParagraphMode lang={currentLang} onBack={() => setMode('list')} />;
  if (mode === 'words' && selectedLesson) return (
    <LessonDetail
      lesson={selectedLesson}
      lang={currentLang}
      onBack={() => { setMode('list'); setSelectedLesson(null); }}
      onStartQuiz={() => setMode('wordquiz')}
      onStartSentences={() => setMode('sentences')}
    />
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Lessons</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Level up from words → sentences → full paragraphs!</p>
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

      {/* XP bar */}
      <div className="fade-up-2" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1208' }}>Your Progress</span>
          <span style={{ fontSize: 12, color: '#7A6552' }}>{xp} / 10 XP</span>
        </div>
        <div style={{ height: 8, background: '#F0E8DC', borderRadius: 99 }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #0D6E6E, #E8611A, #7C3AED)', width: `${(xp / 10) * 100}%`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#0D6E6E' }}>🔤 Words</span>
          <span style={{ fontSize: 11, color: xp >= 3 ? '#E8611A' : '#D0C4B8' }}>💬 Sentences {xp < 3 ? `(${3 - xp} XP)` : '✓'}</span>
          <span style={{ fontSize: 11, color: xp >= 6 ? '#7C3AED' : '#D0C4B8' }}>📖 Paragraphs {xp < 6 ? `(${6 - xp} XP)` : '✓'}</span>
        </div>
      </div>

      {/* Level tabs */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
        {LEVELS.map(level => {
          const locked = level.id > unlockedLevel;
          return (
            <button key={level.id} onClick={() => !locked && setActiveLevel(level.id)}
              disabled={locked}
              style={{
                padding: '1rem', borderRadius: 14, border: activeLevel === level.id ? `2px solid ${level.color}` : '0.5px solid rgba(26,18,8,0.1)',
                background: locked ? '#F0E8DC' : activeLevel === level.id ? level.bg : '#fff',
                cursor: locked ? 'not-allowed' : 'pointer', transition: 'all 0.15s', textAlign: 'center', opacity: locked ? 0.6 : 1,
              }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{locked ? '🔒' : level.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: locked ? '#7A6552' : level.color }}>{level.name}</div>
              <div style={{ fontSize: 11, color: '#7A6552', marginTop: 2 }}>{locked ? `${level.xpNeeded} XP to unlock` : level.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Paragraph mode - no lesson needed */}
      {activeLevel === 3 && unlockedLevel >= 3 && (
        <div className="fade-up" style={{ background: '#F5F3FF', border: '1.5px solid #7C3AED44', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📖</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: '#1A1208', marginBottom: 6 }}>Paragraph Practice</h3>
          <p style={{ fontSize: 13, color: '#7A6552', marginBottom: '1rem' }}>AI generates a Hindi paragraph on any topic. You translate it to {currentLang?.name}!</p>
          <button onClick={() => setMode('paragraphs')}
            style={{ background: '#7C3AED', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Start Paragraph Practice →
          </button>
        </div>
      )}

      {/* AI lesson generator */}
      {activeLevel <= 2 && (
        <div className="fade-up-3" style={{ background: '#1A1208', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>✨ AI Lesson Generator — {currentLang?.name}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="e.g. Colors, Animals, Weather, Body parts..."
              style={{ flex: 1, background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '10px 13px', fontSize: 14, color: '#FAF6F0', outline: 'none' }} />
            <button onClick={generate} disabled={!customTopic.trim() || generating}
              style={{ background: customTopic.trim() && !generating ? '#E8611A' : 'rgba(250,246,240,0.1)', color: customTopic.trim() && !generating ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: customTopic.trim() && !generating ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
              {generating ? 'Generating...' : 'Generate →'}
            </button>
          </div>
          {error && <div style={{ marginTop: 8, fontSize: 13, color: '#F5C49A' }}>{error}</div>}
        </div>
      )}

      {/* Lesson list */}
      {activeLevel <= 2 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className={`fade-up-${Math.min(i + 3, 5)}`}
              onClick={() => { setSelectedLesson(lesson); setMode('words'); }}
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
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, background: '#E0F2F2', color: '#0D6E6E', padding: '3px 8px', borderRadius: 99 }}>🔤 Words</span>
                {unlockedLevel >= 2 && <span style={{ fontSize: 11, background: '#FDF0E8', color: '#E8611A', padding: '3px 8px', borderRadius: 99 }}>💬 Sentences</span>}
                <span style={{ fontSize: 12, color: '#7A6552' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}