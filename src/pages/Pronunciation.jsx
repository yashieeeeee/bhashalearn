import { useState, useRef } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';

function speak(text, langCode) {
  const langMap = {
    bhojpuri: 'hi-IN', tamil: 'ta-IN', telugu: 'te-IN', marathi: 'mr-IN',
    bengali: 'bn-IN', gujarati: 'gu-IN', punjabi: 'pa-IN', kannada: 'kn-IN',
    malayalam: 'ml-IN', urdu: 'ur-IN', odia: 'or-IN', assamese: 'as-IN',
  };
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langMap[langCode] || 'hi-IN';
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

function scoreIt(spoken, target, roman) {
  const clean = s => s.toLowerCase().trim().replace(/[.,?!،]/g, '');
  const s = clean(spoken);
  const t = clean(target);
  const r = clean(roman || '');
  if (!s) return 0;
  if (s === t || s === r) return 100;
  if (t && (s.includes(t) || t.includes(s))) return 92;
  if (r && (s.includes(r) || r.includes(s))) return 88;
  // Unicode character overlap for Indian scripts
  const tChars = [...t];
  const sChars = [...s];
  const overlap = tChars.filter(c => sChars.includes(c)).length;
  const pct = tChars.length > 0 ? Math.round((overlap / tChars.length) * 100) : 0;
  return Math.max(pct, 20); // min 20% for trying
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
  const [interimText, setInterimText] = useState('');
  const [score, setScore] = useState(null);
  const recognitionRef = useRef(null);
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const lessons = LESSONS_DATA[selectedLang] || [];
  const lesson = lessons[lessonIdx];
  const word = lesson?.words[wordIdx];
  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'hi-IN'; // Hindi works best for Indian languages in browser
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 5;

    let finalText = '';

    recognition.onstart = () => {
      setListening(true);
      setTranscript('');
      setInterimText('');
      setScore(null);
      finalText = '';
    };

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += t + ' ';
          setTranscript(finalText.trim());
          setInterimText('');
          // Score against all alternatives
          let best = 0;
          for (let j = 0; j < e.results[i].length; j++) {
            const alt = e.results[i][j].transcript;
            const s = scoreIt(alt, word?.target || '', word?.roman || '');
            if (s > best) best = s;
          }
          setScore(best);
        } else {
          interim += t;
          setInterimText(interim);
        }
      }
    };

    recognition.onerror = (e) => {
      console.log('Speech error:', e.error);
      if (e.error !== 'no-speech') setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText('');
      // If we have final text, score it
      if (finalText.trim() && score === null) {
        const s = scoreIt(finalText.trim(), word?.target || '', word?.roman || '');
        setScore(s);
        setTranscript(finalText.trim());
      }
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function nextWord() {
    setScore(null); setTranscript(''); setInterimText('');
    if (wordIdx + 1 < (lesson?.words.length || 0)) setWordIdx(w => w + 1);
    else if (lessonIdx + 1 < lessons.length) { setLessonIdx(l => l + 1); setWordIdx(0); }
    else { setLessonIdx(0); setWordIdx(0); }
  }

  function changeLang(code) {
    setSelectedLang(code); setLessonIdx(0); setWordIdx(0);
    setScore(null); setTranscript(''); setInterimText('');
  }

  if (!supported) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
      <div style={{ fontWeight: 600, color: '#1A1208', marginBottom: 8 }}>Not Supported</div>
      <div style={{ fontSize: 14, color: '#7A6552' }}>Please use Chrome or Edge browser.</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Pronunciation 🗣️</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Listen → then speak — get scored instantly!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
            padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: selectedLang === lang.code ? '#1A1208' : '#fff',
            color: selectedLang === lang.code ? '#FAF6F0' : '#1A1208',
            border: selectedLang === lang.code ? 'none' : '0.5px solid rgba(26,18,8,0.15)',
          }}>
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Lesson tabs */}
      <div className="fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {lessons.map((l, i) => (
          <button key={i} onClick={() => { setLessonIdx(i); setWordIdx(0); setScore(null); setTranscript(''); }}
            style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer', background: lessonIdx === i ? '#E8611A' : '#fff', color: lessonIdx === i ? '#FAF6F0' : '#1A1208', border: lessonIdx === i ? 'none' : '0.5px solid rgba(26,18,8,0.15)', fontWeight: lessonIdx === i ? 600 : 400 }}>
            {l.icon} {l.title}
          </button>
        ))}
      </div>

      {word && (
        <div className="fade-up-3">
          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#7A6552' }}>Word {wordIdx + 1} of {lesson.words.length}</span>
            <span style={{ fontSize: 12, color: '#7A6552' }}>{currentLang?.name}</span>
          </div>
          <div style={{ height: 4, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${((wordIdx + 1) / lesson.words.length) * 100}%` }} />
          </div>

          {/* Word card */}
          <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Say this in {currentLang?.name}
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 500, color: '#FAF6F0', marginBottom: 8 }}>
              {word.hindi}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 24, color: '#F5C49A', fontWeight: 500 }}>{word.target}</div>
              <button onClick={() => speak(word.target, selectedLang)}
                style={{ background: 'rgba(250,246,240,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Hear pronunciation">
                🔊
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.5)' }}>{word.roman} · {word.meaning}</div>
          </div>

          {/* Tip: listen first */}
          {score === null && !listening && (
            <div style={{ background: '#FBF3E2', borderRadius: 12, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#C8912A', textAlign: 'center' }}>
              💡 First tap 🔊 to hear it, then tap 🎤 to speak!
            </div>
          )}

          {/* Score ring */}
          {score !== null && <ScoreRing score={score} />}

          {/* Live transcript */}
          {(transcript || interimText) && (
            <div style={{ background: '#FBF3E2', borderRadius: 12, padding: '12px 16px', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>You said</div>
              <div style={{ fontSize: 16, color: '#1A1208', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                {transcript || interimText}
                {listening && interimText && <span style={{ color: '#C8912A' }}>...</span>}
              </div>
            </div>
          )}

          {/* Hint when score is low */}
          {score !== null && score < 60 && (
            <div style={{ background: '#E0F2F2', borderRadius: 12, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#0D6E6E', textAlign: 'center' }}>
              💡 Try saying: <strong>{word.roman}</strong>
              <button onClick={() => speak(word.target, selectedLang)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6, fontSize: 15 }}>🔊</button>
            </div>
          )}

          {/* Mic button */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button onClick={listening ? stopListening : startListening}
              style={{
                width: 84, height: 84, borderRadius: '50%',
                background: listening ? '#DC2626' : '#E8611A',
                color: '#FAF6F0', border: 'none', cursor: 'pointer', fontSize: 34,
                boxShadow: listening ? '0 0 0 10px rgba(220,38,38,0.2)' : '0 4px 20px rgba(232,97,26,0.4)',
                transition: 'all 0.2s',
              }}>
              {listening ? '⏹' : '🎤'}
            </button>
            <div style={{ fontSize: 13, color: listening ? '#DC2626' : '#7A6552', marginTop: 10, fontWeight: listening ? 600 : 400 }}>
              {listening ? '🔴 Listening... tap to stop' : 'Tap to speak'}
            </div>
          </div>

          {/* Next word */}
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