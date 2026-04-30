import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const LANG_INFO = {
  bhojpuri: { flag: '🟠', name: 'Bhojpuri' },
  tamil: { flag: '🔴', name: 'Tamil' },
  telugu: { flag: '🟡', name: 'Telugu' },
  marathi: { flag: '🟣', name: 'Marathi' },
  bengali: { flag: '🟢', name: 'Bengali' },
  gujarati: { flag: '🔵', name: 'Gujarati' },
  kannada: { flag: '🟤', name: 'Kannada' },
  malayalam: { flag: '⚪', name: 'Malayalam' },
  punjabi: { flag: '🟡', name: 'Punjabi' },
  odia: { flag: '🔵', name: 'Odia' },
  urdu: { flag: '🟢', name: 'Urdu' },
  assamese: { flag: '🔴', name: 'Assamese' },
};

const LANG_CODES = {
  bhojpuri: 'hi-IN', tamil: 'ta-IN', telugu: 'te-IN', marathi: 'mr-IN',
  bengali: 'bn-IN', gujarati: 'gu-IN', punjabi: 'pa-IN', kannada: 'kn-IN',
  malayalam: 'ml-IN', urdu: 'ur-IN', odia: 'or-IN', assamese: 'as-IN',
};

function speak(text, langCode) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG_CODES[langCode] || 'hi-IN';
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

export default function Bookmarks() {
  const { user, profile, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Wait for auth to finish loading, then set bookmarks from profile
  useEffect(() => {
    if (!authLoading && profile) {
      setBookmarks(Array.isArray(profile.bookmarks) ? profile.bookmarks : []);
    } else if (!authLoading && profile === null) {
      setBookmarks([]);
    }
  }, [profile, authLoading]);

  async function removeBookmark(id) {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    if (user) {
      await supabase.from('profiles').update({ bookmarks: updated }).eq('id', user.id);
    }
  }

  if (authLoading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#7A6552' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔖</div>
      <div>Loading bookmarks...</div>
    </div>
  );

  const langs = ['all', ...new Set(bookmarks.map(b => b.lang).filter(Boolean))];
  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.lang === filter);

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Bookmarks 🔖</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>
          {bookmarks.length} word{bookmarks.length !== 1 ? 's' : ''} saved for review
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 16, border: '0.5px solid rgba(26,18,8,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔖</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginBottom: 8 }}>No bookmarks yet!</div>
          <div style={{ fontSize: 14, color: '#7A6552' }}>Go to Lessons → open any lesson → tap 📌 on any word to save it here.</div>
        </div>
      ) : (
        <>
          {/* Language filter */}
          <div className="fade-up-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {langs.map(lang => {
              const info = LANG_INFO[lang];
              return (
                <button key={lang} onClick={() => setFilter(lang)} style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: filter === lang ? '#1A1208' : '#fff',
                  color: filter === lang ? '#FAF6F0' : '#1A1208',
                  border: filter === lang ? 'none' : '0.5px solid rgba(26,18,8,0.15)',
                }}>
                  {lang === 'all'
                    ? `📚 All (${bookmarks.length})`
                    : `${info?.flag} ${info?.name} (${bookmarks.filter(b => b.lang === lang).length})`}
                </button>
              );
            })}
          </div>

          {/* Bookmarks list */}
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((word) => {
              const info = LANG_INFO[word.lang];
              return (
                <div key={word.id} style={{
                  background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)',
                  borderRadius: 14, padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 11, background: '#FDF0E8', color: '#E8611A', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>
                        {info?.flag} {info?.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 22, fontWeight: 500, color: '#1A1208' }}>{word.hindi}</div>
                        <div style={{ fontSize: 11, color: '#7A6552' }}>Hindi</div>
                      </div>
                      <span style={{ color: '#E8611A', fontSize: 18 }}>→</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontSize: 22, fontWeight: 500, color: '#E8611A' }}>{word.target}</div>
                          <button onClick={() => speak(word.target, word.lang)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>🔊</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#7A6552' }}>{word.roman}</div>
                      </div>
                    </div>
                    {word.meaning && (
                      <div style={{ fontSize: 12, color: '#7A6552', marginTop: 6, fontStyle: 'italic' }}>{word.meaning}</div>
                    )}
                  </div>
                  <button onClick={() => removeBookmark(word.id)}
                    style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}