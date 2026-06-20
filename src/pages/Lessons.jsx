import { useState, useEffect } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';
import { generateLesson, generateQuiz, chatWithTutor } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

// Same TTS logic as Pronunciation.jsx — speaks roman text as fallback if no voice found
const LANG_CONFIG = {
  hindi:     { lang: 'hi-IN', useScript: true  },
  bhojpuri:  { lang: 'hi-IN', useScript: true  },
  tamil:     { lang: 'ta-IN', useScript: true  },
  telugu:    { lang: 'te-IN', useScript: true  },
  marathi:   { lang: 'mr-IN', useScript: true  },
  bengali:   { lang: 'bn-IN', useScript: true  },
  gujarati:  { lang: 'gu-IN', useScript: true  },
  punjabi:   { lang: 'pa-IN', useScript: true  },
  kannada:   { lang: 'kn-IN', useScript: true  },
  malayalam: { lang: 'ml-IN', useScript: true  },
  urdu:      { lang: 'ur-IN', useScript: true  },
  odia:      { lang: 'or-IN', useScript: false },
  assamese:  { lang: 'bn-IN', useScript: true  },
};

// speak(scriptText, romanText, langCode)
// If no voice installed for that language, reads roman text in English accent
// so the user always hears SOMETHING instead of silence.
function speak(scriptText, romanText, langCode) {
  window.speechSynthesis.cancel();

  const config = LANG_CONFIG[langCode] || { lang: 'hi-IN', useScript: true };
  const voices = window.speechSynthesis.getVoices();
  const hasVoice = voices.some(v =>
    v.lang === config.lang || v.lang.startsWith(config.lang.split('-')[0])
  );

  const textToSpeak = (config.useScript && hasVoice) ? scriptText : (romanText || scriptText);
  const langToUse   = hasVoice ? config.lang : 'en-IN';

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang   = langToUse;
  utterance.rate   = 0.75;
  utterance.pitch  = 1;
  utterance.volume = 1;

  utterance.onerror = () => {
    // Last resort: speak roman in English
    const fallback = new SpeechSynthesisUtterance(romanText || scriptText);
    fallback.lang = 'en-IN';
    fallback.rate = 0.75;
    window.speechSynthesis.speak(fallback);
  };

  const trySpeak = () => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      const best =
        v.find(x => x.lang === langToUse) ||
        v.find(x => x.lang.startsWith(langToUse.split('-')[0])) ||
        v.find(x => x.lang.includes('IN') || x.lang.includes('PK')) ||
        v[0];
      if (best) utterance.voice = best;
    }
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      trySpeak();
    };
  }
}

const LEVELS = [
  { id: 1, name: 'Words',      icon: '🔤', desc: 'Learn individual words',         color: '#0D6E6E', bg: '#E0F2F2', xpNeeded: 0 },
  { id: 2, name: 'Sentences',  icon: '💬', desc: 'Build simple sentences',         color: '#E8611A', bg: '#FDF0E8', xpNeeded: 3 },
  { id: 3, name: 'Paragraphs', icon: '📖', desc: 'Read & translate full passages', color: '#7C3AED', bg: '#F5F3FF', xpNeeded: 6 },
];


/* ─── Paragraph Mode ──────────────────────────────────────────────────────── */
function ParagraphMode({ lang, onBack }) {
  const [paragraph, setParagraph]   = useState('');
  const [translation, setTranslation] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic]           = useState('');

  async function generateParagraph() {
    if (!topic.trim()) return;
    setGenerating(true); setFeedback(''); setUserAnswer(''); setTranslation('');
    try {
      const text = await chatWithTutor(
        `Write a short 3-4 sentence paragraph in Hindi about "${topic}" that a beginner can practice translating to ${lang.name}. Then provide the ${lang.name} translation. Format EXACTLY:\nHINDI: [paragraph]\nTRANSLATION: [translation]`,
        lang.name
      );
      const hindiMatch = text.match(/HINDI:\s*([\s\S]*?)(?=TRANSLATION:|$)/i);
      const transMatch = text.match(/TRANSLATION:\s*([\s\S]*?)$/i);
      if (hindiMatch) setParagraph(hindiMatch[1].trim());
      if (transMatch) setTranslation(transMatch[1].trim());
    } catch { setParagraph('Could not generate paragraph. Please try again.'); }
    setGenerating(false);
  }

  async function checkAnswer() {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const result = await chatWithTutor(
        `A student is translating this Hindi paragraph to ${lang.name}:\nHindi: "${paragraph}"\nCorrect ${lang.name} translation: "${translation}"\nStudent's attempt: "${userAnswer}"\nGive encouraging feedback in 3-4 sentences. If mostly right, start with "Bahut badhiya!"`,
        lang.name
      );
      setFeedback(result);
    } catch { setFeedback('Could not check. Please try again.'); }
    setLoading(false);
  }

  return (
    <div className="fade-up" style={{ maxWidth: 640 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted, #7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back to levels</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ width: 52, height: 52, background: '#F5F3FF', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📖</div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--bl-text, #1A1208)', margin: 0 }}>Paragraph Practice — {lang?.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)', margin: '2px 0 0' }}>Read Hindi, translate to {lang?.name}</p>
        </div>
      </div>

      <div className="bl-card-dark" style={{ padding: '20px', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>✨ Generate a paragraph</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateParagraph()}
            placeholder="Topic: My family, Morning routine, Indian food..."
            style={{ flex: 1, background: 'rgba(250,246,240,0.08)', border: '1px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#FAF6F0', outline: 'none' }} />
          <button onClick={generateParagraph} disabled={!topic.trim() || generating}
            style={{ background: topic.trim() && !generating ? '#7C3AED' : 'rgba(250,246,240,0.1)', color: topic.trim() && !generating ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {generating ? 'Generating...' : 'Generate →'}
          </button>
        </div>
      </div>

      {paragraph && (
        <>
          <div className="bl-card" style={{ padding: '20px', marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--bl-muted, #7A6552)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Hindi Paragraph — Translate this</div>
            <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 18, color: 'var(--bl-text, #1A1208)', lineHeight: 1.8, margin: 0 }}>{paragraph}</p>
          </div>
          <div className="bl-card-dark" style={{ padding: '20px', marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Your {lang?.name} translation</div>
            <textarea value={userAnswer} onChange={e => { setUserAnswer(e.target.value); setFeedback(''); }}
              placeholder={`Write your ${lang?.name} translation here...`}
              style={{ width: '100%', background: 'rgba(250,246,240,0.08)', border: '1px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#FAF6F0', resize: 'none', minHeight: 100, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
            <button onClick={checkAnswer} disabled={!userAnswer.trim() || loading}
              style={{ width: '100%', background: userAnswer.trim() && !loading ? '#7C3AED' : 'rgba(250,246,240,0.1)', color: userAnswer.trim() && !loading ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {loading ? '✨ AI is checking...' : 'Check my translation →'}
            </button>
          </div>
          {feedback && (
            <div style={{ padding: '14px 18px', borderRadius: 14, background: feedback.startsWith('Bahut') ? '#E0F2F2' : '#FEE2E2', color: feedback.startsWith('Bahut') ? '#065F46' : '#991B1B', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
              {feedback.startsWith('Bahut') ? '🎉 ' : '💡 '}{feedback}
            </div>
          )}
          {translation && (
            <details style={{ marginTop: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--bl-muted, #7A6552)', padding: '8px 0' }}>Show correct translation 👁️</summary>
              <div style={{ background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '14px 16px', marginTop: 8, fontSize: 14, color: '#7C3AED', lineHeight: 1.7 }}>{translation}</div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Sentence Mode ───────────────────────────────────────────────────────── */
function SentenceMode({ lesson, lang, onBack, onComplete }) {
  const [step, setStep]         = useState(0);
  const [score, setScore]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [sentences, setSentences] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generateSentences(); }, []);

  async function generateSentences() {
    setLoading(true);
    try {
      function getWrongOptions(word) {
        return lesson.words.filter(w => w.hindi !== word.hindi).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.target);
      }
      function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
      // Key word is replaced with ___ so the user must know the Bhojpuri word,
      // not just match what they can read directly from the Hindi sentence.
      const templates = [
        (w) => ({ hindi: `यह ___ है`,       hint: w.meaning, options: shuffle([w.target, ...getWrongOptions(w)]) }),
        (w) => ({ hindi: `मुझे ___ चाहिए`,  hint: w.meaning, options: shuffle([w.target, ...getWrongOptions(w)]) }),
        (w) => ({ hindi: `___ अच्छा है`,    hint: w.meaning, options: shuffle([w.target, ...getWrongOptions(w)]) }),
        (w) => ({ hindi: `यह मेरा ___ है`,  hint: w.meaning, options: shuffle([w.target, ...getWrongOptions(w)]) }),
        (w) => ({ hindi: `क्या यह ___ है?`, hint: w.meaning, options: shuffle([w.target, ...getWrongOptions(w)]) }),
      ];
      const picked = [...lesson.words].sort(() => Math.random() - 0.5).slice(0, 5);
      const built = picked.map((word, i) => {
        const s = templates[i % templates.length](word);
        return { hindi: s.hindi, hint: s.hint, options: s.options, correct: s.options.indexOf(word.target) };
      });
      setSentences(built);
    } catch { setSentences(null); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null) return;
    setSelected(i);
    if (sentences[step].correct === i) setScore(s => s + 1);
  }

  function nextStep() {
    if (step + 1 >= sentences.length) { setDone(true); onComplete && onComplete(score + (selected === sentences[step].correct ? 1 : 0)); return; }
    setStep(s => s + 1); setSelected(null);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--bl-text, #1A1208)' }}>Building sentences...</div>
      <div className="bl-shimmer" style={{ width: 180, height: 8, margin: '16px auto 0' }} />
    </div>
  );

  if (!sentences) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <p style={{ color: '#E8611A', marginBottom: 12 }}>Could not generate sentences.</p>
      <button onClick={generateSentences} style={{ background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Try again</button>
    </div>
  );

  if (done) return (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }} className="fade-up">
      <div style={{ fontSize: 64, marginBottom: 12 }}>{score >= 4 ? '🏆' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: 'var(--bl-text, #1A1208)', marginBottom: 8 }}>{score >= 4 ? 'Bahut Badhiya!' : 'Keep Going!'}</h2>
      <p style={{ color: 'var(--bl-muted, #7A6552)', marginBottom: '1.75rem' }}>You got <strong>{score}</strong> out of <strong>{sentences.length}</strong> right!</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => { setStep(0); setScore(0); setSelected(null); setDone(false); generateSentences(); }}
          style={{ background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try again</button>
        <button onClick={onBack}
          style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back</button>
      </div>
    </div>
  );

  const s = sentences[step];
  return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted, #7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)' }}>Sentence <strong style={{ color: 'var(--bl-text, #1A1208)' }}>{step + 1}</strong> of {sentences.length}</span>
        <span className="bl-score-badge">Score: {score}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #E8611A, #C8912A)', width: `${(step / sentences.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>
      <div className="bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Fill in the blank — {lang?.name}</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.6 }}>
          {s.hindi.split('___').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span style={{ display: 'inline-block', borderBottom: '2px solid #E8611A', minWidth: 60, margin: '0 6px', color: 'transparent' }}>___</span>
              )}
            </span>
          ))}
        </div>
        {s.hint && (
          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,97,26,0.15)', border: '1px solid rgba(232,97,26,0.25)', borderRadius: 99, padding: '5px 14px', fontSize: 13, color: '#F5C49A' }}>
            💡 Meaning: {s.hint}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
        {s.options.map((opt, i) => {
          const answered = selected !== null;
          const isCorrect = i === s.correct;
          const isSelected = i === selected;
          let extraClass = '';
          if (answered && isCorrect) extraClass = 'correct';
          else if (answered && isSelected) extraClass = 'wrong';
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className={`bl-option-btn ${extraClass}`}>
              <span className="bl-option-letter">{answered && isCorrect ? '✓' : answered && isSelected ? '✕' : i + 1}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="slide-up">
          <div className={`bl-feedback-bar ${selected === s.correct ? 'correct' : 'wrong'}`} style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{selected === s.correct ? '🎉' : '💡'}</span>
            <div>
              <div style={{ fontWeight: 700 }}>{selected === s.correct ? 'Sahi! Bahut badhiya!' : 'Galat jawab!'}</div>
              {selected !== s.correct && <div style={{ fontSize: 13, opacity: 0.8 }}>Sahi jawab: <strong>{s.options[s.correct]}</strong></div>}
            </div>
          </div>
          <button onClick={nextStep} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {step + 1 >= sentences.length ? 'See results →' : 'Next sentence →'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Word Quiz ───────────────────────────────────────────────────────────── */
function WordQuiz({ lesson, lang, onBack, onComplete }) {
  const [quiz, setQuiz]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [qIndex, setQIndex]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadQuiz(); }, []);

  async function loadQuiz() {
    setLoading(true);
    try { const data = await generateQuiz(lesson.words); setQuiz(data.questions); }
    catch { setQuiz(null); }
    setLoading(false);
  }

  function pick(i) {
    if (selected !== null || !quiz) return;
    setSelected(i);
    if (quiz[qIndex].correct === i) setScore(s => s + 1);
  }

  function nextQ() {
    if (qIndex + 1 >= quiz.length) { setDone(true); onComplete && onComplete(score + (selected === quiz[qIndex].correct ? 1 : 0)); return; }
    setQIndex(i => i + 1); setSelected(null);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--bl-text, #1A1208)' }}>Generating quiz...</div>
      <div className="bl-shimmer" style={{ width: 160, height: 8, margin: '16px auto 0' }} />
    </div>
  );

  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#E8611A' }}>
      Could not load.{' '}
      <button onClick={loadQuiz} style={{ background: 'none', border: 'none', color: '#E8611A', textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}>Try again</button>
    </div>
  );

  if (done) return (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }} className="fade-up">
      <div style={{ fontSize: 64, marginBottom: 12 }}>{score >= 4 ? '🏆' : '💪'}</div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: 'var(--bl-text, #1A1208)', marginBottom: 8 }}>{score >= 4 ? 'Bahut Badhiya!' : 'Keep Practicing!'}</h2>
      <p style={{ color: 'var(--bl-muted, #7A6552)', marginBottom: '1.75rem' }}>You scored <strong>{score}</strong> out of <strong>{quiz.length}</strong>!</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => { setQIndex(0); setScore(0); setSelected(null); setDone(false); loadQuiz(); }}
          style={{ background: '#0D6E6E', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
        <button onClick={onBack}
          style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back</button>
      </div>
    </div>
  );

  const q = quiz[qIndex];
  return (
    <div style={{ maxWidth: 520 }} className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted, #7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0 }}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)' }}>Question <strong style={{ color: 'var(--bl-text, #1A1208)' }}>{qIndex + 1}</strong> of {quiz.length}</span>
        <span className="bl-score-badge" style={{ background: '#E0F2F2', color: '#0D6E6E', border: '1.5px solid rgba(13,110,110,0.25)' }}>Score: {score}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(26,18,8,0.08)', borderRadius: 99, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #0D6E6E, #E8611A)', width: `${(qIndex / quiz.length) * 100}%`, transition: 'width 0.4s' }} />
      </div>
      <div className="bl-card-dark" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.09em' }}>What is this in {lang?.name}?</div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 600, color: '#FAF6F0', lineHeight: 1.15 }}>{q.hindi}</div>
        {q.roman && <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.45)', marginTop: 8 }}>{q.roman}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {q.options.map((opt, i) => {
          const answered = selected !== null;
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          let extraClass = '';
          if (answered && isCorrect) extraClass = 'correct';
          else if (answered && isSelected) extraClass = 'wrong';
          return (
            <button key={i} onClick={() => pick(i)} disabled={answered}
              className={`bl-option-btn ${extraClass}`}>
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
              <div style={{ fontWeight: 700 }}>{selected === q.correct ? 'Sahi! Bahut badhiya!' : 'Galat jawab!'}</div>
              {selected !== q.correct && <div style={{ fontSize: 13, opacity: 0.8 }}>Sahi jawab: <strong>{q.options[q.correct]}</strong></div>}
            </div>
          </div>
          <button onClick={nextQ} style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {qIndex + 1 >= quiz.length ? 'See results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Lesson Detail ───────────────────────────────────────────────────────── */
function LessonDetail({ lesson, lang, onBack, onStartQuiz, onStartSentences }) {
  const [activeWord, setActiveWord] = useState(null);
  const { user, profile }           = useAuth();
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    const saved = profile?.bookmarks || [];
    const map = {};
    saved.forEach(b => { map[b.id] = true; });
    setBookmarked(map);
  }, [profile]);

  async function toggleBookmark(word) {
    const id = `${lang?.code}-${word.hindi}`;
    const existing = profile?.bookmarks || [];
    let updated;
    if (bookmarked[id]) {
      updated = existing.filter(b => b.id !== id);
      setBookmarked(prev => ({ ...prev, [id]: false }));
    } else {
      updated = [...existing, { id, hindi: word.hindi, target: word.target, roman: word.roman, meaning: word.meaning, lang: lang?.code }];
      setBookmarked(prev => ({ ...prev, [id]: true }));
    }
    if (user) await supabase.from('profiles').update({ bookmarks: updated }).eq('id', user.id);
  }

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bl-muted, #7A6552)', fontSize: 14, marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to lessons
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ width: 56, height: 56, background: '#FDF0E8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '1px solid rgba(232,97,26,0.15)' }}>
          {lesson.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--bl-text, #1A1208)', margin: 0 }}>{lesson.title} — {lang?.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)', margin: '3px 0 0' }}>{lesson.words.length} words · tap to expand · 🔊 to hear</p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
        <button onClick={onStartQuiz} style={{ background: '#E0F2F2', color: '#0D6E6E', border: '2px solid rgba(13,110,110,0.25)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0D6E6E'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#E0F2F2'; e.currentTarget.style.color = '#0D6E6E'; }}>
          🔤 Word Quiz
        </button>
        <button onClick={onStartSentences} style={{ background: '#FDF0E8', color: '#E8611A', border: '2px solid rgba(232,97,26,0.25)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E8611A'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FDF0E8'; e.currentTarget.style.color = '#E8611A'; }}>
          💬 Sentence Builder
        </button>
      </div>

      {/* Word list */}
      <div style={{ display: 'grid', gap: 10 }}>
        {lesson.words.map((word, i) => {
          const open = activeWord === i;
          return (
            <div key={i} className={`bl-word-card ${open ? 'open' : ''}`} onClick={() => setActiveWord(open ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flex: 1 }}>
                  <div style={{ minWidth: 90 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 600, color: open ? '#FAF6F0' : '#1A1208' }}>{word.hindi}</span>
                      <button onClick={e => { e.stopPropagation(); speak(word.hindi, word.roman, 'hindi'); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px', opacity: 0.6 }}>🔊</button>
                    </div>
                    <div style={{ fontSize: 11, color: open ? 'rgba(250,246,240,0.45)' : '#7A6552', marginTop: 2 }}>Hindi</div>
                  </div>
                  <span style={{ color: '#E8611A', fontSize: 16 }}>→</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 600, color: open ? '#F5C49A' : '#E8611A' }}>{word.target}</span>
                      <button onClick={e => { e.stopPropagation(); speak(word.target, word.roman, lang?.code); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px', opacity: 0.8 }}>🔊</button>
                    </div>
                    <div style={{ fontSize: 11, color: open ? 'rgba(250,246,240,0.45)' : '#7A6552', marginTop: 2 }}>{word.roman}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); toggleBookmark(word); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px' }}>
                    {bookmarked[`${lang?.code}-${word.hindi}`] ? '🔖' : '📌'}
                  </button>
                  <span style={{ fontSize: 11, color: open ? 'rgba(250,246,240,0.4)' : '#7A6552' }}>{open ? '▲' : '▼'}</span>
                </div>
              </div>
              {open && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(250,246,240,0.12)', fontSize: 14, color: 'rgba(250,246,240,0.7)' }}>
                  Meaning: <strong style={{ color: '#FAF6F0' }}>{word.meaning}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Lessons Page ───────────────────────────────────────────────────── */
export default function Lessons() {
  const { user, profile }               = useAuth();
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [activeLevel, setActiveLevel]   = useState(1);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [mode, setMode]                 = useState('list');
  const [xpMap, setXpMap]               = useState({});
  const [customTopic, setCustomTopic]   = useState('');
  const [generating, setGenerating]     = useState(false);
  const [, setAiLesson]                 = useState(null);
  const [error, setError]               = useState('');

  const xp           = xpMap[selectedLang] || 0;
  const currentLang  = LANGUAGES.find(l => l.code === selectedLang);
  const lessons      = LESSONS_DATA[selectedLang] || [];
  const unlockedLevel = xp >= 6 ? 3 : xp >= 3 ? 2 : 1;

  useEffect(() => { if (profile?.xp_map) setXpMap(profile.xp_map); }, [profile]);

  function changeLang(code) { setSelectedLang(code); setSelectedLesson(null); setMode('list'); setAiLesson(null); setCustomTopic(''); setError(''); }

  async function handleComplete(score) {
    if (score >= 3 && user) {
      const newXp  = Math.min((xpMap[selectedLang] || 0) + 2, 10);
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
      const data   = await generateLesson(`${customTopic.trim()} in ${currentLang?.name}`);
      const lesson = { ...data, id: 99, icon: '✨', progress: 0, status: 'new' };
      setAiLesson(lesson); setSelectedLesson(lesson); setMode('words');
    } catch { setError('Could not generate lesson. Please try again.'); }
    setGenerating(false);
  }

  if (mode === 'wordquiz'   && selectedLesson) return <WordQuiz    lesson={selectedLesson} lang={currentLang} onBack={() => setMode('words')} onComplete={handleComplete} />;
  if (mode === 'sentences'  && selectedLesson) return <SentenceMode lesson={selectedLesson} lang={currentLang} onBack={() => setMode('words')} onComplete={handleComplete} />;
  if (mode === 'paragraphs')                   return <ParagraphMode lang={currentLang} onBack={() => setMode('list')} />;
  if (mode === 'words'      && selectedLesson) return <LessonDetail  lesson={selectedLesson} lang={currentLang} onBack={() => { setMode('list'); setSelectedLesson(null); }} onStartQuiz={() => setMode('wordquiz')} onStartSentences={() => setMode('sentences')} />;

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
        <h1 className="bl-page-title">Lessons 📚</h1>
        <p className="bl-page-sub">Level up from words → sentences → full paragraphs!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => changeLang(lang.code)} className={`bl-lang-pill ${selectedLang === lang.code ? 'active' : ''}`}>
            {lang.flag} {lang.name} <span style={{ opacity: 0.55, fontSize: 11 }}>{lang.script}</span>
          </button>
        ))}
      </div>

      {/* XP progress */}
      <div className="fade-up-2 bl-card" style={{ padding: '16px 18px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--bl-text, #1A1208)' }}>Your Progress — {currentLang?.name}</span>
          <span style={{ fontSize: 12, color: 'var(--bl-muted, #7A6552)' }}>{xp} / 10 XP</span>
        </div>
        <div className="bl-xp-track" style={{ height: 10 }}>
          <div className="bl-xp-fill" style={{ width: `${(xp / 10) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#0D6E6E' }}>🔤 Words</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: xp >= 3 ? '#E8611A' : '#D0C4B8' }}>💬 Sentences {xp < 3 ? `(${3 - xp} XP)` : '✓'}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: xp >= 6 ? '#7C3AED' : '#D0C4B8' }}>📖 Paragraphs {xp < 6 ? `(${6 - xp} XP)` : '✓'}</span>
        </div>
      </div>

      {/* Level tabs */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
        {LEVELS.map(level => {
          const locked = level.id > unlockedLevel;
          const active = activeLevel === level.id;
          return (
            <button key={level.id} onClick={() => !locked && setActiveLevel(level.id)} disabled={locked}
              style={{ padding: '16px 10px', borderRadius: 16, border: active ? `2px solid ${level.color}` : '1.5px solid rgba(26,18,8,0.08)', background: locked ? '#F5F0EB' : active ? level.bg : '#fff', cursor: locked ? 'not-allowed' : 'pointer', transition: 'all 0.15s', textAlign: 'center', opacity: locked ? 0.55 : 1, boxShadow: active ? `0 4px 16px ${level.color}22` : 'none' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{locked ? '🔒' : level.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: locked ? '#7A6552' : level.color }}>{level.name}</div>
              <div style={{ fontSize: 11, color: 'var(--bl-muted, #7A6552)', marginTop: 3 }}>{locked ? `${level.xpNeeded} XP to unlock` : level.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Paragraph mode CTA */}
      {activeLevel === 3 && unlockedLevel >= 3 && (
        <div className="fade-up" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FF)', border: '2px solid rgba(124,58,237,0.2)', borderRadius: 18, padding: '24px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>📖</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--bl-text, #1A1208)', marginBottom: 6 }}>Paragraph Practice</h3>
          <p style={{ fontSize: 13, color: 'var(--bl-muted, #7A6552)', marginBottom: '1.25rem' }}>AI generates a Hindi paragraph. You translate to {currentLang?.name}!</p>
          <button onClick={() => setMode('paragraphs')} style={{ background: '#7C3AED', color: '#FAF6F0', border: 'none', borderRadius: 14, padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
            Start Paragraph Practice →
          </button>
        </div>
      )}

      {/* AI Lesson Generator */}
      {activeLevel <= 2 && (
        <div className="fade-up-3 bl-card-dark" style={{ padding: '20px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>✨ AI Lesson Generator — {currentLang?.name}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={customTopic} onChange={e => setCustomTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="e.g. Colors, Animals, Weather, Body parts..."
              style={{ flex: 1, background: 'rgba(250,246,240,0.08)', border: '1px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#FAF6F0', outline: 'none' }} />
            <button onClick={generate} disabled={!customTopic.trim() || generating}
              style={{ background: customTopic.trim() && !generating ? '#E8611A' : 'rgba(250,246,240,0.1)', color: customTopic.trim() && !generating ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: customTopic.trim() && !generating ? '0 4px 12px rgba(232,97,26,0.3)' : 'none' }}>
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
            <div key={lesson.id} className={`bl-lesson-row fade-up-${Math.min(i + 3, 5)}`}
              onClick={() => { setSelectedLesson(lesson); setMode('words'); }}>
              <div style={{ width: 50, height: 50, background: '#FDF0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid rgba(232,97,26,0.15)' }}>
                {lesson.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--bl-text, #1A1208)', marginBottom: 3 }}>{lesson.title}</div>
                <div style={{ fontSize: 12, color: 'var(--bl-muted, #7A6552)' }}>{lesson.words.slice(0, 3).map(w => w.roman).join(', ')}...</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#E0F2F2', color: '#0D6E6E', padding: '3px 9px', borderRadius: 99 }}>🔤 Words</span>
                {unlockedLevel >= 2 && <span style={{ fontSize: 11, fontWeight: 600, background: '#FDF0E8', color: '#E8611A', padding: '3px 9px', borderRadius: 99 }}>💬 Sentences</span>}
              </div>
              <span style={{ fontSize: 18, color: '#E8611A', marginLeft: 4 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}