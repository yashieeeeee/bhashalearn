import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { LANGUAGES } from '../data/content';

export default function Bookmarks() {
  const { user, profile } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setBookmarks(profile?.bookmarks || []);
  }, [profile]);

  async function removeBookmark(wordId) {
    const updated = bookmarks.filter(b => b.id !== wordId);
    setBookmarks(updated);
    await supabase.from('profiles').update({ bookmarks: updated }).eq('id', user.id);
  }

  const langs = ['all', ...new Set(bookmarks.map(b => b.lang))];
  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.lang === filter);
  const currentLang = LANGUAGES.find(l => l.code === filter);

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Bookmarks 🔖</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>Words you saved for later review</p>
      </div>

      {bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 16, border: '0.5px solid rgba(26,18,8,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔖</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1A1208', marginBottom: 8 }}>No bookmarks yet!</div>
          <div style={{ fontSize: 14, color: '#7A6552' }}>Go to Lessons and tap the 🔖 icon on any word to save it here.</div>
        </div>
      ) : (
        <>
          {/* Language filter */}
          <div className="fade-up-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {langs.map(lang => {
              const langData = LANGUAGES.find(l => l.code === lang);
              return (
                <button key={lang} onClick={() => setFilter(lang)}
                  style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: filter === lang ? '#1A1208' : '#fff', color: filter === lang ? '#FAF6F0' : '#1A1208', border: filter === lang ? 'none' : '0.5px solid rgba(26,18,8,0.15)' }}>
                  {lang === 'all' ? `📚 All (${bookmarks.length})` : `${langData?.flag} ${langData?.name}`}
                </button>
              );
            })}
          </div>

          {/* Bookmarks list */}
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((word) => {
              const langData = LANGUAGES.find(l => l.code === word.lang);
              return (
                <div key={word.id} style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, background: '#FDF0E8', color: '#E8611A', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>{langData?.flag} {langData?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 20, fontWeight: 500, color: '#1A1208' }}>{word.hindi}</div>
                        <div style={{ fontSize: 11, color: '#7A6552' }}>Hindi</div>
                      </div>
                      <span style={{ color: '#E8611A', fontSize: 16 }}>→</span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 500, color: '#E8611A' }}>{word.target}</div>
                        <div style={{ fontSize: 11, color: '#7A6552' }}>{word.roman}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#7A6552', marginTop: 6, fontStyle: 'italic' }}>{word.meaning}</div>
                  </div>
                  <button onClick={() => removeBookmark(word.id)}
                    style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
                    title="Remove bookmark">
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