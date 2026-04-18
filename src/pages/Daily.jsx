import { useState } from 'react';
import { wordOfDay } from '../data/content';
import { checkTranslation } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const ALL_CHALLENGES = [
  { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "रउआ कइसन बानी?", answer_roman: "Rauwa kaisan baani?", lang: "bhojpuri" },
  { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "हमार नाम राम बा", answer_roman: "Hamaar naam Ram ba", lang: "bhojpuri" },
  { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "पनिया दा", answer_roman: "Paniya da", lang: "bhojpuri" },
  { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "खाना खाव", answer_roman: "Khaana khaav", lang: "bhojpuri" },
  { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "घर जाव", answer_roman: "Ghar jaav", lang: "bhojpuri" },
  { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "इ नीमन बा", answer_roman: "I neeman ba", lang: "bhojpuri" },
  { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "हम थाकल बानी", answer_roman: "Hum thakal baani", lang: "bhojpuri" },
];

export default function Daily() {
  const { profile } = useAuth();
  const streak = profile?.streak || 0;

  const todayIndex = Math.floor(Date.now() / 86400000) % ALL_CHALLENGES.length;
  const challenge = ALL_CHALLENGES[todayIndex];
  const word = wordOfDay;

  const streakStatus = days.map((_, i) =>
    i < streak ? 'done' : i === Math.min(streak, 6) ? 'today' : 'upcoming'
  );

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function check() {
    if (!answer.trim() || loading) return;
    setLoading(true); setChecked(false);
    try {
      const result = await checkTranslation(challenge.hindi, answer.trim(), challenge.answer, 'Bhojpuri');
      setFeedback(result); setChecked(true);
    } catch (e) {
      setFeedback('Could not connect to AI. Check your internet and try again. Error: ' + e.message);
      setChecked(true);
    }
    setLoading(false);
  }

  const isCorrect = feedback.startsWith('Bahut badhiya');

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#1A1208' }}>Daily Practice</h1>
        <p style={{ fontSize: 14, color: '#7A6552', marginTop: 4 }}>A little every day goes a long way.</p>
      </div>

      {/* Streak */}
      <div className="fade-up-2" style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7A6552', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>This week · 🔥 {streak} day streak</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, padding: '10px 0', borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 500,
              background: streakStatus[i] === 'done' ? '#E0F2F2' : streakStatus[i] === 'today' ? '#E8611A' : '#F0E8DC',
              color: streakStatus[i] === 'done' ? '#0D6E6E' : streakStatus[i] === 'today' ? '#FAF6F0' : '#7A6552' }}>
              <div>{d}</div>
              <div style={{ marginTop: 4 }}>{streakStatus[i] === 'done' ? '✓' : streakStatus[i] === 'today' ? '→' : '·'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge */}
      <div className="fade-up-3" style={{ background: '#1A1208', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today's challenge</div>
          <span style={{ background: 'rgba(232,97,26,0.2)', color: '#F5C49A', fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500 }}>✨ AI-checked</span>
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#FAF6F0', marginBottom: 4 }}>{challenge.hindi}</div>
        <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)', marginBottom: '1.25rem' }}>{challenge.roman} — {challenge.meaning}</div>

        <textarea value={answer} onChange={e => { setAnswer(e.target.value); setFeedback(''); setChecked(false); }}
          placeholder="Type your Bhojpuri translation here..."
          style={{ width: '100%', background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#FAF6F0', fontFamily: "'Noto Sans Devanagari','DM Sans',sans-serif", resize: 'none', minHeight: 80, outline: 'none', marginBottom: 10 }} />

        <button onClick={check} disabled={!answer.trim() || loading}
          style={{ width: '100%', background: answer.trim() && !loading ? '#E8611A' : 'rgba(250,246,240,0.1)', color: answer.trim() && !loading ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 500, cursor: answer.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
          {loading ? '✨ Claude is checking...' : 'Check with AI →'}
        </button>

        {checked && feedback && (
          <div className="fade-up" style={{ marginTop: 12, padding: '13px 15px', borderRadius: 10, background: isCorrect ? 'rgba(13,110,110,0.25)' : 'rgba(232,97,26,0.2)', color: isCorrect ? '#9FE1CB' : '#F5C49A', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {feedback}
          </div>
        )}
      </div>

      {/* Word of the day — rotates daily */}
      <div className="fade-up-4" style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.25)', borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Word of the day · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#1A1208' }}>{wordOfDay.hindi}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#C8912A', marginTop: 4 }}>{wordOfDay.target}</div>
        <p style={{ fontSize: 13, color: '#7A6552', marginTop: 8, lineHeight: 1.6 }}>{wordOfDay.meaning}</p>
        <p style={{ fontSize: 12, color: '#7A6552', marginTop: 6, fontStyle: 'italic' }}>{wordOfDay.example}</p>
      </div>
    </div>
  );
}
