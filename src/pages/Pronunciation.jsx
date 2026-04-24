import { useState, useRef } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';

// ─── Pronunciation scoring ────────────────────────────────────────────────────
function scorePronunciation(spoken, target) {
  const s = spoken.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (s === t) return 100;
  const sWords = s.split(' ');
  const tWords = t.split(' ');
  const matches = sWords.filter(w => tWords.includes(w)).length;
  return Math.round((matches / Math.max(sWords.length, tWords.length)) * 100);
}

function ScoreRing({ score }) {
  const color = score >= 80 ? '#0D6E6E' : score >= 50 ? '#C8912A' : '#E8611A';
  const label = score >= 80 ? 'Excellent! 🎉' : score >= 50 ? 'Good effort! 💪' : 'Keep practicing! 📚';
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: `${color}11` }}>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>{score}%</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color }}>{label}</div>
    </div>
  );
}

export default function Pronunciation() {
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [lessonIdx, setLessonIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  const lessons = LESSONS_DATA[selectedLang] || [];
  const lesson = lessons[lessonIdx];
  const word = lesson?.words[wordIdx];
  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'hi-IN'; // Hindi for input
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => { setListening(true); setTranscript(''); setScore(null); };

    recognition.onresult = (e) => {
      const results = Array.from(e.results[0]).map(r => r.transcript);
      const best = results[0];
      setTranscript(best);
      // Score against roman pronunciation
      const s = scorePronunciation(best, word?.roman || word?.target || '');
      setScore(s);
      setListening(false);
    };

    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => { setListening(false); };
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function nextWord() {
    setScore(null); setTranscript('');
    if (wordIdx + 1 < (lesson?.words.length || 0)) {
      setWordIdx(w => w + 1);
    } else if (lessonIdx + 1 < lessons.length) {
      setLessonIdx(l => l + 1);
      setWordIdx(0);
    } else {
      setWordIdx(0); setLessonIdx(0);
    }
  }

  if (!supported) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#7A6552' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
      <div style={{ fontWeight: 500, color: '#1A1208', marginBottom: 8 }}>Speech Recognition Not Supported</div>
      <div style={{ fontSize: 13 }}>Please use Chrome or Edge browser for pronunciation practice.</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Pronunciation 🗣️</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Speak the word — AI scores your pronunciation!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setLessonIdx(0); setWordIdx(0); setScore(null); setTranscript(''); }}
            style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: selectedLang === lang.code ? '#1A1208' : '#fff', color: selectedLang === lang.code ? '#FAF6F0' : '#1A1208', border: selectedLang === lang.code ? 'none' : '0.5px solid rgba(26,18,8,0.15)', transition: 'all 0.15s' }}>
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Lesson selector */}
      <div className="fade-up-3" style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {lessons.map((l, i) => (
          <button key={i} onClick={() => { setLessonIdx(i); setWordIdx(0); setScore(null); setTranscript(''); }}
            style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer', background: lessonIdx === i ? '#E8611A' : '#fff', color: lessonIdx === i ? '#FAF6F0' : '#1A1208', border: lessonIdx === i ? 'none' : '0.5px solid rgba(26,18,8,0.15)', fontWeight: lessonIdx === i ? 600 : 400 }}>
            {l.icon} {l.title}
          </button>
        ))}
      </div>

      {/* Word card */}
      {word && (
        <div className="fade-up-3">
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#7A6552' }}>Word {wordIdx + 1} of {lesson.words.length} — {lesson.title}</span>
            <span style={{ fontSize: 12, color: '#7A6552' }}>{currentLang?.name}</span>
          </div>
          <div style={{ height: 4, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${((wordIdx + 1) / lesson.words.length) * 100}%` }} />
          </div>

          {/* Word display */}
          <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 12, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Say this in {currentLang?.name}</div>
            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 500, color: '#FAF6F0', marginBottom: 8 }}>{word.hindi}</div>
            <div style={{ fontSize: 20, color: '#F5C49A', marginBottom: 4 }}>{word.target}</div>
            <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)' }}>🔤 {word.roman} · {word.meaning}</div>
          </div>

          {/* Score */}
          {score !== null && <ScoreRing score={score} />}

          {/* Transcript */}
          {transcript && (
            <div style={{ background: '#FBF3E2', borderRadius: 12, padding: '12px 16px', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>You said</div>
              <div style={{ fontSize: 16, color: '#1A1208', fontStyle: 'italic' }}>"{transcript}"</div>
            </div>
          )}

          {/* Mic button */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              onClick={listening ? stopListening : startListening}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: listening ? '#DC2626' : '#E8611A',
                color: '#FAF6F0', border: 'none', cursor: 'pointer', fontSize: 32,
                boxShadow: listening ? '0 0 0 8px rgba(220,38,38,0.2)' : '0 4px 20px rgba(232,97,26,0.4)',
                transition: 'all 0.2s',
                animation: listening ? 'pulse 1s infinite' : 'none',
              }}>
              {listening ? '⏹' : '🎤'}
            </button>
            <div style={{ fontSize: 12, color: '#7A6552', marginTop: 8 }}>
              {listening ? 'Listening... tap to stop' : 'Tap to speak'}
            </div>
          </div>

          {/* Next button */}
          {score !== null && (
            <button onClick={nextWord} className="fade-up"
              style={{ width: '100%', background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Next word →
            </button>
          )}
        </div>
      )}
    </div>
  );
}