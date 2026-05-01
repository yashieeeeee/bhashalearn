import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';

// Each language's BCP-47 code AND what text to speak (script vs roman)
const LANG_CONFIG = {
  bhojpuri:  { lang: 'hi-IN',    useScript: true  }, // Devanagari — hi-IN reads it well
  hindi:     { lang: 'hi-IN',    useScript: true  },
  marathi:   { lang: 'mr-IN',    useScript: true  }, // Devanagari — mr-IN voice
  tamil:     { lang: 'ta-IN',    useScript: true  }, // Tamil script — ta-IN
  telugu:    { lang: 'te-IN',    useScript: true  }, // Telugu script — te-IN
  bengali:   { lang: 'bn-IN',    useScript: true  }, // Bengali script — bn-IN
  gujarati:  { lang: 'gu-IN',    useScript: true  }, // Gujarati script — gu-IN
  kannada:   { lang: 'kn-IN',    useScript: true  }, // Kannada script — kn-IN
  malayalam: { lang: 'ml-IN',    useScript: true  }, // Malayalam script — ml-IN
  punjabi:   { lang: 'pa-IN',    useScript: true  }, // Gurmukhi — pa-IN
  urdu:      { lang: 'ur-PK',    useScript: true  }, // Urdu script — ur-PK (best support)
  odia:      { lang: 'or-IN',    useScript: false }, // Odia script has poor TTS — use roman
  assamese:  { lang: 'bn-IN',    useScript: true  }, // Assamese closest to Bengali TTS
};

// Speak function — waits for voices, picks best available, falls back gracefully
function speakWord(targetScript, romanText, langCode, onStart, onEnd) {
  window.speechSynthesis.cancel();

  const config = LANG_CONFIG[langCode] || { lang: 'hi-IN', useScript: true };
  // Decide what text to speak
// Check if voice exists for target language
const voices = window.speechSynthesis.getVoices();
const hasVoice = voices.some(v => v.lang === config.lang || v.lang.startsWith(config.lang.split('-')[0]));
// If no voice found, fall back to Roman in English
const textToSpeak = (config.useScript && hasVoice) ? targetScript : romanText;
const langCode2 = hasVoice ? config.lang : 'en-IN';

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = langCode2;
  utterance.rate = 0.75;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => onStart && onStart();
  utterance.onend = () => onEnd && onEnd();
  utterance.onerror = (e) => {
    console.warn('TTS error:', e.error, '— falling back to roman');
    // Fallback: speak roman text in en-IN
    const fallback = new SpeechSynthesisUtterance(romanText);
    fallback.lang = 'en-IN';
    fallback.rate = 0.75;
    fallback.onend = () => onEnd && onEnd();
    window.speechSynthesis.speak(fallback);
  };

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Find best voice: exact lang match → same language prefix → any Indian → first available
      const voice =
        voices.find(v => v.lang === langCode2) ||
        voices.find(v => v.lang.startsWith(langCode2.split('-')[0])) ||
        voices.find(v => v.lang.includes('IN') || v.lang.includes('PK')) ||
        voices[0];
      if (voice) utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Voices load asynchronously on first page load
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      trySpeak();
    };
  }
}

function scoreIt(spoken, target, roman) {
  const clean = s => s.toLowerCase().trim().replace(/[.,?!،।\s]+/g, ' ').trim();
  const s = clean(spoken || '');
  const t = clean(target || '');
  const r = clean(roman || '');
  if (!s) return 0;
  if (s === t || s === r) return 100;
  if (t && (s.includes(t) || t.includes(s))) return 95;
  if (r && (s.includes(r) || r.includes(s))) return 90;
  // Word-level roman match
  if (r) {
    const rWords = r.split(' ');
    const sWords = s.split(' ');
    const matched = rWords.filter(w => w.length > 1 && sWords.some(sw => sw.includes(w) || w.includes(sw)));
    if (matched.length > 0) return Math.round(35 + (matched.length / rWords.length) * 55);
  }
  // Character overlap for scripts
  if (t) {
    const tChars = [...t.replace(/\s/g, '')];
    const sChars = [...s.replace(/\s/g, '')];
    const overlap = tChars.filter(c => sChars.includes(c)).length;
    if (tChars.length > 0) return Math.max(25, Math.round((overlap / tChars.length) * 85));
  }
  return 25;
}

function ScoreRing({ score }) {
  const color = score >= 80 ? '#0D6E6E' : score >= 50 ? '#C8912A' : '#E8611A';
  const label = score >= 80 ? 'Excellent! 🎉' : score >= 50 ? 'Good effort! 💪' : 'Keep practicing! 📚';
  const r = 40, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
      <svg width="110" height="110" style={{ display: 'block', margin: '0 auto 10px' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#F0E8DC" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="55" y="60" textAnchor="middle"
          style={{ fontSize: '22px', fontWeight: 700, fill: color, fontFamily: 'sans-serif' }}>{score}%</text>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 500, color }}>{label}</div>
    </div>
  );
}

export default function Pronunciation() {
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [lessonIdx, setLessonIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [waitingToRecord, setWaitingToRecord] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [score, setScore] = useState(null);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef('');

  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const lessons = LESSONS_DATA[selectedLang] || [];
  const lesson = lessons[lessonIdx];
  const word = lesson?.words[wordIdx];
  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); recognitionRef.current?.abort(); };
  }, []);

  function handleSpeak() {
    if (!word || speaking) return;
    setSpeaking(true);
    speakWord(word.target, word.roman, selectedLang, null, () => setSpeaking(false));
  }

  // Play audio then automatically start recording after it finishes
  function handleListenThenSpeak() {
    if (!word || speaking || listening) return;
    setScore(null); setTranscript(''); setInterimText('');
    setSpeaking(true);
    setWaitingToRecord(true);
    speakWord(word.target, word.roman, selectedLang, null, () => {
      setSpeaking(false);
      setWaitingToRecord(false);
      setTimeout(() => startListening(), 400);
    });
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !word) return;
    recognitionRef.current?.abort();

    const recognition = new SR();
    recognitionRef.current = recognition;
    const config = LANG_CONFIG[selectedLang] || { lang: 'hi-IN' };
    recognition.lang = config.lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;
    finalTextRef.current = '';

    recognition.onstart = () => { setListening(true); setScore(null); setTranscript(''); setInterimText(''); };

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          let best = 0, bestText = e.results[i][0].transcript;
          for (let j = 0; j < e.results[i].length; j++) {
            const alt = e.results[i][j].transcript;
            const s = scoreIt(alt, word.target, word.roman);
            if (s > best) { best = s; bestText = alt; }
          }
          finalTextRef.current = bestText;
          setTranscript(bestText);
          setScore(best);
          setInterimText('');
        } else {
          interim += e.results[i][0].transcript;
          setInterimText(interim);
        }
      }
    };

    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === 'not-allowed') alert('Please allow microphone access in browser settings.');
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText('');
      if (finalTextRef.current && score === null) {
        setScore(scoreIt(finalTextRef.current, word.target, word.roman));
      }
    };

    try { recognition.start(); } catch (e) { setListening(false); }
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  function nextWord() {
    setScore(null); setTranscript(''); setInterimText('');
    window.speechSynthesis.cancel();
    if (wordIdx + 1 < (lesson?.words.length || 0)) setWordIdx(w => w + 1);
    else if (lessonIdx + 1 < lessons.length) { setLessonIdx(l => l + 1); setWordIdx(0); }
    else { setLessonIdx(0); setWordIdx(0); }
  }

  function changeLang(code) {
    setSelectedLang(code); setLessonIdx(0); setWordIdx(0);
    setScore(null); setTranscript(''); setInterimText('');
    window.speechSynthesis.cancel(); recognitionRef.current?.abort();
  }

  if (!supported) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#1A1208', marginBottom: 8 }}>Browser not supported</div>
      <div style={{ fontSize: 14, color: '#7A6552' }}>Please use Chrome or Edge on desktop.</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Pronunciation 🗣️</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Hear the word → speak it → get scored instantly!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
            padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            background: selectedLang === lang.code ? '#1A1208' : '#fff',
            color: selectedLang === lang.code ? '#FAF6F0' : '#1A1208',
            border: selectedLang === lang.code ? 'none' : '0.5px solid rgba(26,18,8,0.15)',
          }}>{lang.flag} {lang.name}</button>
        ))}
      </div>

      {/* Lesson tabs */}
      <div className="fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {lessons.map((l, i) => (
          <button key={i} onClick={() => { setLessonIdx(i); setWordIdx(0); setScore(null); setTranscript(''); setInterimText(''); }}
            style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', background: lessonIdx === i ? '#E8611A' : '#fff', color: lessonIdx === i ? '#FAF6F0' : '#1A1208', border: lessonIdx === i ? 'none' : '0.5px solid rgba(26,18,8,0.15)', fontWeight: lessonIdx === i ? 500 : 400 }}>
            {l.icon} {l.title}
          </button>
        ))}
      </div>

      {word && (
        <div className="fade-up-3">
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#7A6552' }}>Word {wordIdx + 1} of {lesson.words.length}</span>
            <span style={{ fontSize: 12, color: '#7A6552' }}>{currentLang?.name}</span>
          </div>
          <div style={{ height: 5, background: '#F0E8DC', borderRadius: 99, marginBottom: '1.5rem' }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#E8611A', width: `${((wordIdx + 1) / lesson.words.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>

          {/* Word card */}
          <div style={{ background: '#1A1208', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Say this in {currentLang?.name}
            </div>
            <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 48, fontWeight: 500, color: '#FAF6F0', marginBottom: 12 }}>
              {word.hindi}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 26, color: '#F5C49A', fontWeight: 500, fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{word.target}</div>
              <button onClick={handleSpeak} disabled={speaking || listening}
                style={{ background: speaking ? 'rgba(250,246,240,0.08)' : 'rgba(250,246,240,0.18)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: speaking || listening ? 'not-allowed' : 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                title="Hear pronunciation">
                {speaking ? '⏳' : '🔊'}
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(250,246,240,0.5)' }}>{word.roman} · {word.meaning}</div>
          </div>

          {/* Tip */}
          {score === null && !listening && !speaking && (
            <div style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.25rem', fontSize: 13, color: '#854F0B', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
              <span>Tap <strong>"Listen then Speak"</strong> — it plays the word and then automatically records you!</span>
            </div>
          )}

          {/* Waiting state */}
          {waitingToRecord && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#C8912A', fontSize: 14, fontWeight: 500 }}>
              🔊 Playing... get ready to speak!
            </div>
          )}

          {/* Score */}
          {score !== null && <ScoreRing score={score} />}

          {/* Transcript */}
          {(transcript || interimText) && (
            <div style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>You said</div>
              <div style={{ fontSize: 18, color: '#1A1208', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                {transcript || <span style={{ color: '#C8912A' }}>{interimText}...</span>}
              </div>
            </div>
          )}

          {/* Low score hint */}
          {score !== null && score < 60 && (
            <div style={{ background: '#E0F2F2', border: '0.5px solid rgba(13,110,110,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: '1.25rem', fontSize: 13, color: '#085041', textAlign: 'center' }}>
              Try saying: <strong>{word.roman}</strong>
              <button onClick={handleSpeak} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, fontSize: 16 }}>🔊</button>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            {/* Primary magic button */}
            {!listening && !speaking && score === null && (
              <button onClick={handleListenThenSpeak}
                style={{ width: '100%', background: '#E8611A', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#C8512A'}
                onMouseLeave={e => e.currentTarget.style.background = '#E8611A'}>
                🔊 Listen then Speak →
              </button>
            )}

            {/* Mic button — manual option */}
            {!waitingToRecord && (
              <>
                <button onClick={listening ? stopListening : startListening} disabled={speaking}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: listening ? '#DC2626' : '#1A1208', color: '#FAF6F0', border: 'none', cursor: speaking ? 'not-allowed' : 'pointer', fontSize: 32, boxShadow: listening ? '0 0 0 12px rgba(220,38,38,0.15)' : '0 4px 16px rgba(26,18,8,0.2)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listening ? '⏹' : '🎤'}
                </button>
                <div style={{ fontSize: 13, color: listening ? '#DC2626' : '#7A6552', fontWeight: listening ? 500 : 400 }}>
                  {listening ? '🔴 Listening... tap to stop' : 'Or tap mic to speak directly'}
                </div>
              </>
            )}
          </div>

          {/* Try again / Next */}
          {score !== null && (
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => { setScore(null); setTranscript(''); setInterimText(''); }}
                style={{ background: '#FDF0E8', color: '#E8611A', border: '0.5px solid rgba(232,97,26,0.3)', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Try again ↺
              </button>
              <button onClick={nextWord}
                style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Next word →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}