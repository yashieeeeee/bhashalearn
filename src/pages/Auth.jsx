import { useState, useEffect } from 'react';
import { signIn, signUp } from '../utils/supabase';

const LANGUAGES = [
  { name: "Hindi", word: "नमस्ते", meaning: "Hello", color: "#E8611A", bg: "#FDF0E8" },
  { name: "Tamil", word: "வணக்கம்", meaning: "Vanakkam", color: "#0D6E6E", bg: "#E0F2F2" },
  { name: "Telugu", word: "నమస్కారం", meaning: "Namaskaram", color: "#C8912A", bg: "#FBF3E2" },
  { name: "Bengali", word: "নমস্কার", meaning: "Nomoshkar", color: "#7C3AED", bg: "#F5F3FF" },
  { name: "Marathi", word: "नमस्कार", meaning: "Namaskar", color: "#DC2626", bg: "#FEF2F2" },
  { name: "Gujarati", word: "નમસ્તે", meaning: "Namaste", color: "#059669", bg: "#ECFDF5" },
  { name: "Punjabi", word: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", meaning: "Sat Sri Akaal", color: "#D97706", bg: "#FFFBEB" },
  { name: "Kannada", word: "ನಮಸ್ಕಾರ", meaning: "Namaskara", color: "#0891B2", bg: "#ECFEFF" },
  { name: "Malayalam", word: "നമസ്കാരം", meaning: "Namaskaram", color: "#65A30D", bg: "#F7FEE7" },
  { name: "Urdu", word: "السلام علیکم", meaning: "Assalamu Alaikum", color: "#9333EA", bg: "#FAF5FF" },
  { name: "Odia", word: "ନମସ୍କାର", meaning: "Namaskaar", color: "#E11D48", bg: "#FFF1F2" },
  { name: "Bhojpuri", word: "प्रणाम", meaning: "Pranaam", color: "#EA580C", bg: "#FFF7ED" },
];

const FACTS = [
  "India has 22 official languages and over 19,500 dialects 🇮🇳",
  "Tamil is one of the world's oldest living languages, over 2,000 years old 📜",
  "Sanskrit is the mother of most Indian languages and influenced the world 🌍",
  "Bengali is the 5th most spoken language in the world 🌟",
  "Hindi is spoken by over 600 million people worldwide 💬",
  "India's languages use 13 different scripts — a unique global record ✍️",
];

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeLang, setActiveLang] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => {
      setActiveLang(i => (i + 1) % LANGUAGES.length);
    }, 2000);
    const t2 = setInterval(() => {
      setFactIndex(i => (i + 1) % FACTS.length);
    }, 4000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  async function handle() {
    setError(''); setSuccess(''); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else setSuccess('Account created! Check your email to confirm, then log in.');
    }
    setLoading(false);
  }

  const lang = LANGUAGES[activeLang];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
      background: '#FAF6F0',
    }}>

      {/* LEFT PANEL — Language showcase */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        background: '#1A1208',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Floating language bubbles background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {LANGUAGES.map((l, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 37 + 10) % 85}%`,
              top: `${(i * 53 + 5) % 85}%`,
              fontSize: i % 3 === 0 ? '13px' : i % 3 === 1 ? '11px' : '10px',
              color: l.color,
              opacity: activeLang === i ? 0.9 : 0.15,
              transition: 'opacity 0.5s ease',
              fontFamily: "'Noto Sans Devanagari', sans-serif",
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {l.word}
            </div>
          ))}
        </div>

        {/* Main showcase */}
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>

          {/* Logo */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.2rem',
            fontWeight: 700,
            color: '#FAF6F0',
            marginBottom: '3rem',
            letterSpacing: '-0.5px',
          }}>
            Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
          </div>

          {/* Active language card */}
          <div style={{
            background: lang.bg,
            borderRadius: '24px',
            padding: '2.5rem 3rem',
            marginBottom: '2rem',
            minWidth: '280px',
            transition: 'all 0.4s ease',
            border: `2px solid ${lang.color}22`,
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: lang.color,
              marginBottom: '12px',
            }}>
              {lang.name}
            </div>
            <div style={{
              fontFamily: "'Noto Sans Devanagari', serif",
              fontSize: '3rem',
              fontWeight: 700,
              color: '#1A1208',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}>
              {lang.word}
            </div>
            <div style={{
              fontSize: '16px',
              color: lang.color,
              fontWeight: 500,
            }}>
              {lang.meaning}
            </div>
          </div>

          {/* Language dots */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {LANGUAGES.map((_, i) => (
              <div key={i} style={{
                width: activeLang === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '99px',
                background: activeLang === i ? '#E8611A' : 'rgba(250,246,240,0.25)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>

          {/* Rotating fact */}
          <div style={{
            background: 'rgba(250,246,240,0.06)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            maxWidth: '320px',
            margin: '0 auto',
            border: '0.5px solid rgba(250,246,240,0.1)',
          }}>
            <div style={{ fontSize: '11px', color: '#E8611A', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Did you know?
            </div>
            <div style={{
              fontSize: '13px',
              color: 'rgba(250,246,240,0.75)',
              lineHeight: 1.6,
              transition: 'all 0.5s ease',
            }}>
              {FACTS[factIndex]}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            {[
              { num: '12+', label: 'Languages' },
              { num: '1B+', label: 'Speakers' },
              { num: '2000+', label: 'Years of history' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#E8611A', fontFamily: "'Playfair Display', serif" }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: 'rgba(250,246,240,0.5)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Auth form */}
      <div style={{
        width: '460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
        background: '#FAF6F0',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#1A1208',
              margin: '0 0 8px',
            }}>
              {mode === 'login' ? 'Welcome back! 🙏' : 'Start your journey 🚀'}
            </h1>
            <p style={{ fontSize: '14px', color: '#7A6552', margin: 0 }}>
              {mode === 'login'
                ? 'Log in to continue your language learning'
                : 'Join thousands learning Indian languages'}
            </p>
          </div>

          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            background: '#F0E8DC',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '1.75rem',
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '9px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: mode === m ? '#1A1208' : 'transparent',
                  color: mode === m ? '#FAF6F0' : '#7A6552',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#7A6552', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Kumar"
                  style={{ width: '100%', border: '1.5px solid #E8D5C0', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', color: '#1A1208', outline: 'none', background: '#fff', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#E8611A'}
                  onBlur={e => e.target.style.borderColor = '#E8D5C0'}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#7A6552', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ width: '100%', border: '1.5px solid #E8D5C0', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', color: '#1A1208', outline: 'none', background: '#fff', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#E8611A'}
                onBlur={e => e.target.style.borderColor = '#E8D5C0'}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#7A6552', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ width: '100%', border: '1.5px solid #E8D5C0', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', color: '#1A1208', outline: 'none', background: '#fff', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#E8611A'}
                onBlur={e => e.target.style.borderColor = '#E8D5C0'}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '14px', padding: '12px 14px', background: '#FDF0E8', borderRadius: '10px', fontSize: '13px', color: '#E8611A', border: '0.5px solid #E8611A33' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: '14px', padding: '12px 14px', background: '#E0F2F2', borderRadius: '10px', fontSize: '13px', color: '#0D6E6E', border: '0.5px solid #0D6E6E33' }}>
              {success}
            </div>
          )}

          <button onClick={handle} disabled={loading || !email || !password}
            style={{
              marginTop: '20px',
              width: '100%',
              background: email && password && !loading ? '#E8611A' : '#F0E8DC',
              color: email && password && !loading ? '#FAF6F0' : '#7A6552',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: email && password && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (email && password && !loading) e.target.style.background = '#d4551a'; }}
            onMouseLeave={e => { if (email && password && !loading) e.target.style.background = '#E8611A'; }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Continue learning →' : 'Start learning for free →'}
          </button>

          {/* Language pills */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#7A6552', marginBottom: '10px' }}>Learn any of these languages</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {LANGUAGES.map(l => (
                <span key={l.name} style={{
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: l.bg,
                  color: l.color,
                  border: `0.5px solid ${l.color}33`,
                }}>
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#7A6552', marginTop: '1.5rem' }}>
            Progress saved securely · Free forever 🔒
          </p>
        </div>
      </div>
    </div>
  );
}