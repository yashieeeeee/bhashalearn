// ── BhashaLearn Curriculum ────────────────────────────────────────────────────
// Structured learning path — same shape for every language.
// Words are keyed by language code from LESSONS_DATA.
// Each unit has lessons; each lesson has: id, title, icon, xpReward, lessonKey
// lessonKey maps to LESSONS_DATA[lang][index].words

export const UNITS = [
  {
    id: 1,
    title: 'Unit 1',
    subtitle: 'Getting Started',
    color: '#0D6E6E',
    bg: '#E0F2F2',
    icon: '🌱',
    lessons: [
      { id: 'u1l1', title: 'Greetings',         icon: '👋', xp: 10, lessonIndex: 0, desc: 'Say hello, thank you & sorry' },
      { id: 'u1l2', title: 'Numbers 1–10',       icon: '🔢', xp: 10, lessonIndex: 1, desc: 'Count from one to ten' },
      { id: 'u1l3', title: 'Food & Drinks',      icon: '🍛', xp: 10, lessonIndex: 2, desc: 'Water, food, milk & more' },
      { id: 'u1l4', title: 'Family',             icon: '👨‍👩‍👧', xp: 15, lessonIndex: 3, desc: 'Mother, father, siblings' },
    ],
  },
  {
    id: 2,
    title: 'Unit 2',
    subtitle: 'Daily Life',
    color: '#E8611A',
    bg: '#FDF0E8',
    icon: '☀️',
    lessons: [
      { id: 'u2l1', title: 'Introduce Yourself', icon: '🙋', xp: 15, lessonIndex: null, desc: 'My name is, I am from...', words: [
        { hindi: 'मेरा नाम', meaning: 'My name is', roman: 'Mera naam' },
        { hindi: 'मैं ... से हूँ', meaning: 'I am from...', roman: 'Main ... se hoon' },
        { hindi: 'मेरी उम्र', meaning: 'My age is', roman: 'Meri umar' },
        { hindi: 'मैं काम करता हूँ', meaning: 'I work', roman: 'Main kaam karta hoon' },
        { hindi: 'मुझे खुशी है', meaning: 'Nice to meet you', roman: 'Mujhe khushi hai' },
      ]},
      { id: 'u2l2', title: 'At a Café',          icon: '☕', xp: 15, lessonIndex: null, desc: 'Order food & ask for the bill', words: [
        { hindi: 'एक कप चाय', meaning: 'One cup of tea', roman: 'Ek cup chai' },
        { hindi: 'बिल लाओ', meaning: 'Bring the bill', roman: 'Bill laao' },
        { hindi: 'कितना हुआ?', meaning: 'How much is it?', roman: 'Kitna hua?' },
        { hindi: 'और दो', meaning: 'Give me more', roman: 'Aur do' },
        { hindi: 'बहुत स्वादिष्ट', meaning: 'Very delicious', roman: 'Bahut swaadisht' },
      ]},
      { id: 'u2l3', title: 'Talk About Age',     icon: '🎂', xp: 15, lessonIndex: null, desc: 'Ask and say your age', words: [
        { hindi: 'आपकी उम्र क्या है?', meaning: 'How old are you?', roman: 'Aapki umar kya hai?' },
        { hindi: 'मैं बीस साल का हूँ', meaning: 'I am 20 years old', roman: 'Main bees saal ka hoon' },
        { hindi: 'जन्मदिन', meaning: 'Birthday', roman: 'Janamdin' },
        { hindi: 'साल', meaning: 'Year', roman: 'Saal' },
        { hindi: 'महीना', meaning: 'Month', roman: 'Maheena' },
      ]},
      { id: 'u2l4', title: 'Colors',             icon: '🎨', xp: 20, lessonIndex: null, desc: 'Learn colors in the language', words: [
        { hindi: 'लाल', meaning: 'Red', roman: 'Laal' },
        { hindi: 'नीला', meaning: 'Blue', roman: 'Neela' },
        { hindi: 'हरा', meaning: 'Green', roman: 'Haraa' },
        { hindi: 'पीला', meaning: 'Yellow', roman: 'Peela' },
        { hindi: 'सफेद', meaning: 'White', roman: 'Safed' },
      ]},
    ],
  },
  {
    id: 3,
    title: 'Unit 3',
    subtitle: 'Getting Around',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: '🗺️',
    lessons: [
      { id: 'u3l1', title: 'Directions',         icon: '🧭', xp: 20, lessonIndex: null, desc: 'Left, right, near, far', words: [
        { hindi: 'बाएं', meaning: 'Left', roman: 'Baayen' },
        { hindi: 'दाएं', meaning: 'Right', roman: 'Daayen' },
        { hindi: 'सीधे', meaning: 'Straight', roman: 'Seedhe' },
        { hindi: 'पास', meaning: 'Near', roman: 'Paas' },
        { hindi: 'दूर', meaning: 'Far', roman: 'Door' },
      ]},
      { id: 'u3l2', title: 'Transport',          icon: '🚌', xp: 20, lessonIndex: null, desc: 'Bus, train, auto & more', words: [
        { hindi: 'बस', meaning: 'Bus', roman: 'Bus' },
        { hindi: 'रेलगाड़ी', meaning: 'Train', roman: 'Relgaadi' },
        { hindi: 'ऑटो', meaning: 'Auto', roman: 'Auto' },
        { hindi: 'हवाई जहाज', meaning: 'Airplane', roman: 'Hawai Jahaz' },
        { hindi: 'साइकिल', meaning: 'Bicycle', roman: 'Cycle' },
      ]},
      { id: 'u3l3', title: 'Shopping',           icon: '🛒', xp: 20, lessonIndex: null, desc: 'Buy things, ask prices', words: [
        { hindi: 'यह कितने का है?', meaning: 'How much is this?', roman: 'Yeh kitne ka hai?' },
        { hindi: 'सस्ता', meaning: 'Cheap', roman: 'Sasta' },
        { hindi: 'महंगा', meaning: 'Expensive', roman: 'Mahanga' },
        { hindi: 'खरीदना', meaning: 'To buy', roman: 'Khareedna' },
        { hindi: 'बाज़ार', meaning: 'Market', roman: 'Bazaar' },
      ]},
      { id: 'u3l4', title: 'Time & Days',        icon: '⏰', xp: 25, lessonIndex: null, desc: 'Days of week, morning/evening', words: [
        { hindi: 'सोमवार', meaning: 'Monday', roman: 'Somvaar' },
        { hindi: 'सुबह', meaning: 'Morning', roman: 'Subah' },
        { hindi: 'शाम', meaning: 'Evening', roman: 'Shaam' },
        { hindi: 'कल', meaning: 'Yesterday/Tomorrow', roman: 'Kal' },
        { hindi: 'आज', meaning: 'Today', roman: 'Aaj' },
      ]},
    ],
  },
  {
    id: 4,
    title: 'Unit 4',
    subtitle: 'Express Yourself',
    color: '#C8912A',
    bg: '#FBF3E2',
    icon: '💬',
    lessons: [
      { id: 'u4l1', title: 'Feelings',           icon: '😊', xp: 25, lessonIndex: null, desc: 'Happy, sad, tired & more', words: [
        { hindi: 'खुश', meaning: 'Happy', roman: 'Khush' },
        { hindi: 'दुखी', meaning: 'Sad', roman: 'Dukhi' },
        { hindi: 'थका हुआ', meaning: 'Tired', roman: 'Thaka hua' },
        { hindi: 'गुस्सा', meaning: 'Angry', roman: 'Gussa' },
        { hindi: 'डर', meaning: 'Fear', roman: 'Dar' },
      ]},
      { id: 'u4l2', title: 'Weather',            icon: '🌤️', xp: 25, lessonIndex: null, desc: 'Hot, cold, rain, sunny', words: [
        { hindi: 'गर्मी', meaning: 'Heat/Summer', roman: 'Garmi' },
        { hindi: 'ठंड', meaning: 'Cold/Winter', roman: 'Thand' },
        { hindi: 'बारिश', meaning: 'Rain', roman: 'Baarish' },
        { hindi: 'धूप', meaning: 'Sunshine', roman: 'Dhoop' },
        { hindi: 'आंधी', meaning: 'Storm', roman: 'Aandhi' },
      ]},
      { id: 'u4l3', title: 'Body Parts',         icon: '🫀', xp: 25, lessonIndex: null, desc: 'Head, hands, eyes & more', words: [
        { hindi: 'सिर', meaning: 'Head', roman: 'Sir' },
        { hindi: 'हाथ', meaning: 'Hand', roman: 'Haath' },
        { hindi: 'आँख', meaning: 'Eye', roman: 'Aankh' },
        { hindi: 'कान', meaning: 'Ear', roman: 'Kaan' },
        { hindi: 'पैर', meaning: 'Leg/Foot', roman: 'Pair' },
      ]},
      { id: 'u4l4', title: 'Final Challenge',    icon: '🏆', xp: 50, lessonIndex: null, desc: 'Master quiz across all units', words: [] },
    ],
  },
];

// Flat list of all lesson IDs in order (for unlock logic)
export const LESSON_ORDER = UNITS.flatMap(u => u.lessons.map(l => l.id));

// Get lesson words — uses LESSONS_DATA for unit 1, built-in words for rest
export function getLessonWords(lesson, langCode, LESSONS_DATA) {
  if (lesson.lessonIndex !== null && lesson.lessonIndex !== undefined) {
    return LESSONS_DATA[langCode]?.[lesson.lessonIndex]?.words || [];
  }
  // For units 2-4, translate Hindi words to target language using basic mapping
  // The words array contains Hindi + meaning + roman — we use meaning as the "target" for MCQ
  return (lesson.words || []).map(w => ({
    hindi: w.hindi,
    target: w.meaning, // English meaning as the answer
    roman: w.roman,
    meaning: w.meaning,
  }));
}