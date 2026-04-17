import { useState } from 'react';
import { LANGUAGES, LESSONS_DATA } from '../data/content';

export default function Flashcards() {
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState({});
  const [done, setDone] = useState(false);

  const langData = LESSONS_DATA[selectedLang] || [];
  const flashcards = langData.flatMap(l => l.words.map(w => ({ hindi: w.hindi, target: w.target, roman: w.roman, meaning: w.meaning })));
  const card = flashcards[index] || {};
  const remaining = flashcards.length - Object.keys(ratings).length;
  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  function changeLang(lang) {
    setSelectedLang(lang);
    setIndex(0); setFlipped(false); setRatings({}); setDone(false);
  }

  function rate(r) {
    setRatings(prev => ({ ...prev, [index]: r }));
    setFlipped(false);
    if (index + 1 >= flashcards.length) { setDone(true); return; }
    setIndex(i => i + 1);
  }

  function restart() { setIndex(0); setFlipped(false); setRatings({}); setDone(false); }

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: '#1A1208' }}>Flashcards</h1>
        <p style={{ fontSize: 13, color: '#7A6552', marginTop: 4 }}>Pick a language and start flipping!</p>
      </div>

      {/* Language selector */}
      <div className="fade-up-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' }}>
        {LANGUAGES.map(lang => (
          <button key={lang.code} onClick={() => changeLang(lang.code)} style={{
            padding: '7px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            background: selectedLang === lang.code ? '#1A1208' : '#fff',
            color: selectedLang === lang.code ? '#FAF6F0' : '#1A1208',
            border: selectedLang === lang.code ? '0.5px solid #1A1208' : '0.5px solid rgba(26,18,8,0.15)',
          }}>
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {done ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }} className="fade-up">
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>Deck complete!</h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '2rem' }}>
            {[['Easy', '#0D6E6E', '#E0F2F2'], ['So-so', '#C8912A', '#FBF3E2'], ['Hard', '#E8611A', '#FDF0E8']].map(([label, c, bg]) => (
              <div key={label} style={{ background: bg, borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: c }}>{Object.values(ratings).filter(v => v === label.toLowerCase()).length}</div>
                <div style={{ fontSize: 12, color: c }}>{label}</div>
              </div>
            ))}
          </div>
          <button onClick={restart} style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Review again</button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: '#7A6552' }}>{remaining} cards remaining</p>
            <div style={{ fontSize: 13, color: '#7A6552' }}>{index + 1} / {flashcards.length}</div>
          </div>
          <div className="fade-up" style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {flashcards.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 99, background: i < index ? (ratings[i] === 'easy' ? '#0D6E6E' : ratings[i] === 'hard' ? '#E8611A' : '#C8912A') : i === index ? '#1A1208' : '#F0E8DC', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Card */}
          <div className="fade-up-2" onClick={() => setFlipped(f => !f)}
            style={{ background: flipped ? '#1A1208' : '#fff', border: '0.5px solid rgba(26,18,8,0.12)', borderRadius: 20, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s, transform 0.15s', marginBottom: '1.5rem' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>

            {/* Side label */}
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16,
              color: flipped ? 'rgba(250,246,240,0.5)' : '#7A6552' }}>
              {flipped ? currentLang?.name?.toUpperCase() : 'HINDI'}
            </div>

            {/* Main word */}
            <div style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: 48, fontWeight: 500, lineHeight: 1.3,
              color: flipped ? '#F5C49A' : '#1A1208' }}>
              {flipped ? card.target : card.hindi}
            </div>

            {/* Roman / hint */}
            {flipped && (
              <div style={{ fontSize: 16, color: 'rgba(250,246,240,0.6)', marginTop: 8 }}>
                {card.roman}
              </div>
            )}

            {/* Meaning or tap hint */}
            <div style={{ fontSize: 14, marginTop: 12,
              color: flipped ? 'rgba(250,246,240,0.55)' : '#7A6552' }}>
              {flipped ? card.meaning : 'Tap to reveal ' + currentLang?.name}
            </div>
          </div>

          {/* Rating buttons */}
          {flipped ? (
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Hard', r: 'hard', bg: '#FDF0E8', border: '#E8611A', color: '#E8611A' },
                { label: 'So-so', r: 'ok', bg: '#FBF3E2', border: '#C8912A', color: '#C8912A' },
                { label: 'Easy', r: 'easy', bg: '#E0F2F2', border: '#0D6E6E', color: '#0D6E6E' },
              ].map(btn => (
                <button key={btn.r} onClick={() => rate(btn.r)} style={{ background: btn.bg, border: `1.5px solid ${btn.border}44`, borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 500, color: btn.color, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = btn.border}
                  onMouseLeave={e => e.currentTarget.style.borderColor = btn.border + '44'}>{btn.label}</button>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#7A6552' }}>Tap the card to flip, then rate how well you knew it.</p>
          )}
        </>
      )}
    </div>
  );
}
