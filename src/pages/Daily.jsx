import { useState } from 'react';
import { wordOfDay } from '../data/content';
import { checkTranslation } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../data/content';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const ALL_CHALLENGES = {
  bhojpuri: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "रउआ कइसन बानी?", answer_roman: "Rauwa kaisan baani?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "हमार नाम राम बा", answer_roman: "Hamaar naam Ram ba" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "पनिया दा", answer_roman: "Paniya da" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "खाना खाव", answer_roman: "Khaana khaav" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "घर जाव", answer_roman: "Ghar jaav" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "इ नीमन बा", answer_roman: "I neeman ba" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "हम थाकल बानी", answer_roman: "Hum thakal baani" },
  ],
  tamil: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "நீங்கள் எப்படி இருக்கிறீர்கள்?", answer_roman: "Neengal eppadi irukkireergal?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "என் பெயர் ராம்", answer_roman: "En peyar Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "தண்ணீர் தாருங்கள்", answer_roman: "Thanneer tharungal" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "சாப்பிடுங்கள்", answer_roman: "Saappidungal" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "வீட்டிற்கு போங்கள்", answer_roman: "Veettirku pongal" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "இது நல்லது", answer_roman: "Idhu nandru" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "நான் சோர்வாக இருக்கிறேன்", answer_roman: "Naan sorvaga irukkiren" },
  ],
  telugu: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "మీరు ఎలా ఉన్నారు?", answer_roman: "Meeru ela unnaru?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "నా పేరు రామ్", answer_roman: "Naa peru Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "నీరు ఇవ్వండి", answer_roman: "Neeru ivvandi" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "భోజనం చేయండి", answer_roman: "Bhojanam cheyandi" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ఇంటికి వెళ్ళండి", answer_roman: "Intiki vellandi" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ఇది మంచిది", answer_roman: "Idi manchidi" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "నేను అలసిపోయాను", answer_roman: "Nenu alasipoyanu" },
  ],
  marathi: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "तुम्ही कसे आहात?", answer_roman: "Tumhi kase aahat?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "माझे नाव राम आहे", answer_roman: "Maaze naav Ram aahe" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "पाणी द्या", answer_roman: "Paani dyaa" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "जेवण खा", answer_roman: "Jevan kha" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "घरी जा", answer_roman: "Ghari jaa" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "हे चांगले आहे", answer_roman: "He chaangle aahe" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "मी थकलो आहे", answer_roman: "Mi thaklo aahe" },
  ],
  bengali: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "আপনি কেমন আছেন?", answer_roman: "Apni kemon achen?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "আমার নাম রাম", answer_roman: "Aamar naam Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "জল দিন", answer_roman: "Jol din" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "খাবার খান", answer_roman: "Khabar khan" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "বাড়ি যান", answer_roman: "Baari jaan" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "এটা ভালো", answer_roman: "Eta bhaalo" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "আমি ক্লান্ত", answer_roman: "Aami klanto" },
  ],
  gujarati: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "તમે કેમ છો?", answer_roman: "Tame kem chho?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "મારું નામ રામ છે", answer_roman: "Maarun naam Ram chhe" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "પાણી આપો", answer_roman: "Paani aapo" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ખાણું ખાઓ", answer_roman: "Khaanu khaao" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ઘરે જાઓ", answer_roman: "Ghare jaao" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "આ સારું છે", answer_roman: "Aa sarun chhe" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "હું થાકી ગયો છું", answer_roman: "Hun thaaki gayo chhun" },
  ],
  punjabi: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", answer_roman: "Tusi kiven ho?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ਮੇਰਾ ਨਾਮ ਰਾਮ ਹੈ", answer_roman: "Mera naam Ram hai" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ਪਾਣੀ ਦਿਓ", answer_roman: "Paani dio" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ਖਾਣਾ ਖਾਓ", answer_roman: "Khaana khaao" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ਘਰ ਜਾਓ", answer_roman: "Ghar jaao" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ਇਹ ਚੰਗਾ ਹੈ", answer_roman: "Ih changa hai" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ਮੈਂ ਥੱਕਿਆ ਹੋਇਆ ਹਾਂ", answer_roman: "Main thakkia hoia haan" },
  ],
  kannada: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ನೀವು ಹೇಗಿದ್ದೀರಿ?", answer_roman: "Neevu hegiddiri?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ನನ್ನ ಹೆಸರು ರಾಮ್", answer_roman: "Nanna hesaru Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ನೀರು ಕೊಡಿ", answer_roman: "Neeru kodi" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ಊಟ ಮಾಡಿ", answer_roman: "Oota maadi" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ಮನೆಗೆ ಹೋಗಿ", answer_roman: "Manege hogi" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ಇದು ಒಳ್ಳೆಯದು", answer_roman: "Idu olleyadu" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ನಾನು ದಣಿದಿದ್ದೇನೆ", answer_roman: "Naanu danididdhene" },
  ],
  malayalam: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "നിങ്ങൾ എങ്ങനെ ഉണ്ട്?", answer_roman: "Ningal engane und?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "എന്റെ പേര് രാം", answer_roman: "Ente peru Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "വെള്ളം തരൂ", answer_roman: "Vellam tharoo" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ഭക്ഷണം കഴിക്കൂ", answer_roman: "Bhakshanam kazhikkoo" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "വീട്ടിൽ പോകൂ", answer_roman: "Veettil pokoo" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ഇത് നല്ലതാണ്", answer_roman: "Ith nallathaanu" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ഞാൻ ക്ഷീണിതനാണ്", answer_roman: "Njaan ksheenithanaanu" },
  ],
  urdu: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "آپ کیسے ہیں؟", answer_roman: "Aap kaise hain?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "میرا نام رام ہے", answer_roman: "Mera naam Ram hai" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "پانی دو", answer_roman: "Paani do" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "کھانا کھاؤ", answer_roman: "Khaana khaao" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "گھر جاؤ", answer_roman: "Ghar jaao" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "یہ اچھا ہے", answer_roman: "Yeh accha hai" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "میں تھکا ہوا ہوں", answer_roman: "Main thaka hua hoon" },
  ],
  odia: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ଆପଣ କେମିତି ଅଛନ୍ତି?", answer_roman: "Aapana kemiti achhanti?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ମୋ ନାଁ ରାମ", answer_roman: "Mo naan Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ପାଣି ଦିଅ", answer_roman: "Paani dia" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ଖାଇବା ଖାଅ", answer_roman: "Khaiba khao" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ଘରକୁ ଯାଅ", answer_roman: "Gharku jaao" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ଏହା ଭଲ", answer_roman: "Eha bhala" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ମୁଁ ଥକି ଗଲି", answer_roman: "Mun thaki gali" },
  ],
  assamese: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "আপুনি কেনে আছে?", answer_roman: "Aapuni kene ase?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "মোৰ নাম ৰাম", answer_roman: "Mor naam Ram" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "পানী দিয়ক", answer_roman: "Paani diyok" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "খাদ্য খাওক", answer_roman: "Khadyo khaok" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ঘৰলৈ যাওক", answer_roman: "Ghorloi jaok" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "এইটো ভাল", answer_roman: "Eito bhaal" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "মই ভাগৰি পৰিছো", answer_roman: "Moi bhagori porisho" },
  ],
};

export default function Daily() {
  const { profile } = useAuth();
  const streak = profile?.streak || 0;
  const [selectedLang, setSelectedLang] = useState('bhojpuri');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const streakStatus = days.map((_, i) =>
    i < streak ? 'done' : i === Math.min(streak, 6) ? 'today' : 'upcoming'
  );

  const challenges = ALL_CHALLENGES[selectedLang] || ALL_CHALLENGES.bhojpuri;
  const todayIndex = Math.floor(Date.now() / 86400000) % challenges.length;
  const challenge = challenges[todayIndex];
  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  function changeLang(lang) {
    setSelectedLang(lang);
    setAnswer('');
    setFeedback('');
    setChecked(false);
  }

  async function check() {
    if (!answer.trim() || loading) return;
    setLoading(true); setChecked(false);
    try {
      const result = await checkTranslation(challenge.hindi, answer.trim(), challenge.answer, currentLang?.name);
      setFeedback(result); setChecked(true);
    } catch (e) {
      setFeedback('Could not connect to AI. Try again. Error: ' + e.message);
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

      {/* Language Selector */}
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
          <div style={{ fontSize: 11, color: 'rgba(250,246,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today's {currentLang?.name} challenge
          </div>
          <span style={{ background: 'rgba(232,97,26,0.2)', color: '#F5C49A', fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500 }}>✨ AI-checked</span>
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#FAF6F0', marginBottom: 4 }}>{challenge.hindi}</div>
        <div style={{ fontSize: 14, color: 'rgba(250,246,240,0.5)', marginBottom: '1.25rem' }}>{challenge.roman} — {challenge.meaning}</div>

        <textarea value={answer} onChange={e => { setAnswer(e.target.value); setFeedback(''); setChecked(false); }}
          placeholder={`Type your ${currentLang?.name} translation here...`}
          style={{ width: '100%', background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#FAF6F0', fontFamily: "'Noto Sans Devanagari','DM Sans',sans-serif", resize: 'none', minHeight: 80, outline: 'none', marginBottom: 10 }} />

        <button onClick={check} disabled={!answer.trim() || loading}
          style={{ width: '100%', background: answer.trim() && !loading ? '#E8611A' : 'rgba(250,246,240,0.1)', color: answer.trim() && !loading ? '#FAF6F0' : 'rgba(250,246,240,0.3)', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 500, cursor: answer.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
          {loading ? '✨ AI is checking...' : 'Check with AI →'}
        </button>

        {checked && feedback && (
          <div className="fade-up" style={{ marginTop: 12, padding: '13px 15px', borderRadius: 10, background: isCorrect ? 'rgba(13,110,110,0.25)' : 'rgba(232,97,26,0.2)', color: isCorrect ? '#9FE1CB' : '#F5C49A', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {feedback}
          </div>
        )}
      </div>

      {/* Word of the day */}
      <div className="fade-up-4" style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.25)', borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Word of the day · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#1A1208' }}>{wordOfDay.hindi}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#C8912A', marginTop: 4 }}>{wordOfDay.bhojpuri}</div>
        <p style={{ fontSize: 13, color: '#7A6552', marginTop: 8, lineHeight: 1.6 }}>{wordOfDay.meaning}</p>
        <p style={{ fontSize: 12, color: '#7A6552', marginTop: 6, fontStyle: 'italic' }}>{wordOfDay.example}</p>
      </div>
    </div>
  );
}