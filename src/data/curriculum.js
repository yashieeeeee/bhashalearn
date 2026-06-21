// ── BhashaLearn Curriculum — 8 Units ─────────────────────────────────────────
export const UNITS = [
  {
    id: 1, title: 'Unit 1', subtitle: 'Getting Started', color: '#0D6E6E', bg: '#E0F2F2', icon: '🌱',
    lessons: [
      { id: 'u1l1', title: 'Greetings',     icon: '👋', xp: 10, lessonIndex: 0, desc: 'Hello, thank you, sorry' },
      { id: 'u1l2', title: 'Numbers 1–10',  icon: '🔢', xp: 10, lessonIndex: 1, desc: 'Count from one to ten' },
      { id: 'u1l3', title: 'Food & Drinks', icon: '🍛', xp: 10, lessonIndex: 2, desc: 'Water, food, milk & more' },
      { id: 'u1l4', title: 'Family',        icon: '👨‍👩‍👧', xp: 15, lessonIndex: 3, desc: 'Mother, father, siblings' },
    ],
  },
  {
    id: 2, title: 'Unit 2', subtitle: 'Daily Life', color: '#E8611A', bg: '#FDF0E8', icon: '☀️',
    lessons: [
      { id: 'u2l1', title: 'Introduce Yourself', icon: '🙋', xp: 15, lessonIndex: null, desc: 'My name is, I am from...', words: [
        { hindi: 'मेरा नाम है', meaning: 'My name is', roman: 'Mera naam hai' },
        { hindi: 'मैं ... से हूँ', meaning: 'I am from...', roman: 'Main ... se hoon' },
        { hindi: 'मुझे खुशी है', meaning: 'Nice to meet you', roman: 'Mujhe khushi hai' },
        { hindi: 'आप कैसे हैं?', meaning: 'How are you?', roman: 'Aap kaise hain?' },
        { hindi: 'मैं ठीक हूँ', meaning: 'I am fine', roman: 'Main theek hoon' },
      ]},
      { id: 'u2l2', title: 'At a Café', icon: '☕', xp: 15, lessonIndex: null, desc: 'Order food, ask for bill', words: [
        { hindi: 'एक कप चाय', meaning: 'One cup of tea', roman: 'Ek cup chai' },
        { hindi: 'बिल लाओ', meaning: 'Bring the bill', roman: 'Bill laao' },
        { hindi: 'कितना हुआ?', meaning: 'How much is it?', roman: 'Kitna hua?' },
        { hindi: 'और दीजिए', meaning: 'Give me more', roman: 'Aur dijiye' },
        { hindi: 'बहुत स्वादिष्ट', meaning: 'Very delicious', roman: 'Bahut swaadisht' },
      ]},
      { id: 'u2l3', title: 'Talk About Age', icon: '🎂', xp: 15, lessonIndex: null, desc: 'Ask and say your age', words: [
        { hindi: 'उम्र क्या है?', meaning: 'How old are you?', roman: 'Umar kya hai?' },
        { hindi: 'मैं बीस साल का हूँ', meaning: 'I am 20 years old', roman: 'Main bees saal ka hoon' },
        { hindi: 'जन्मदिन', meaning: 'Birthday', roman: 'Janamdin' },
        { hindi: 'साल', meaning: 'Year', roman: 'Saal' },
        { hindi: 'महीना', meaning: 'Month', roman: 'Maheena' },
      ]},
      { id: 'u2l4', title: 'Colors', icon: '🎨', xp: 20, lessonIndex: null, desc: 'Red, blue, green & more', words: [
        { hindi: 'लाल', meaning: 'Red', roman: 'Laal' },
        { hindi: 'नीला', meaning: 'Blue', roman: 'Neela' },
        { hindi: 'हरा', meaning: 'Green', roman: 'Haraa' },
        { hindi: 'पीला', meaning: 'Yellow', roman: 'Peela' },
        { hindi: 'सफेद', meaning: 'White', roman: 'Safed' },
      ]},
    ],
  },
  {
    id: 3, title: 'Unit 3', subtitle: 'Getting Around', color: '#7C3AED', bg: '#F5F3FF', icon: '🗺️',
    lessons: [
      { id: 'u3l1', title: 'Directions', icon: '🧭', xp: 20, lessonIndex: null, desc: 'Left, right, near, far', words: [
        { hindi: 'बाएं', meaning: 'Left', roman: 'Baayen' },
        { hindi: 'दाएं', meaning: 'Right', roman: 'Daayen' },
        { hindi: 'सीधे', meaning: 'Straight ahead', roman: 'Seedhe' },
        { hindi: 'पास', meaning: 'Near', roman: 'Paas' },
        { hindi: 'दूर', meaning: 'Far', roman: 'Door' },
      ]},
      { id: 'u3l2', title: 'Transport', icon: '🚌', xp: 20, lessonIndex: null, desc: 'Bus, train, auto & more', words: [
        { hindi: 'बस', meaning: 'Bus', roman: 'Bus' },
        { hindi: 'रेलगाड़ी', meaning: 'Train', roman: 'Relgaadi' },
        { hindi: 'ऑटो रिक्शा', meaning: 'Auto rickshaw', roman: 'Auto' },
        { hindi: 'हवाई जहाज', meaning: 'Airplane', roman: 'Hawai Jahaz' },
        { hindi: 'साइकिल', meaning: 'Bicycle', roman: 'Cycle' },
      ]},
      { id: 'u3l3', title: 'Shopping', icon: '🛒', xp: 20, lessonIndex: null, desc: 'Buy things, ask prices', words: [
        { hindi: 'कितने का है?', meaning: 'How much is this?', roman: 'Kitne ka hai?' },
        { hindi: 'सस्ता', meaning: 'Cheap', roman: 'Sasta' },
        { hindi: 'महंगा', meaning: 'Expensive', roman: 'Mahanga' },
        { hindi: 'खरीदना', meaning: 'To buy', roman: 'Khareedna' },
        { hindi: 'बाज़ार', meaning: 'Market', roman: 'Bazaar' },
      ]},
      { id: 'u3l4', title: 'Time & Days', icon: '⏰', xp: 25, lessonIndex: null, desc: 'Days, morning & evening', words: [
        { hindi: 'सोमवार', meaning: 'Monday', roman: 'Somvaar' },
        { hindi: 'सुबह', meaning: 'Morning', roman: 'Subah' },
        { hindi: 'शाम', meaning: 'Evening', roman: 'Shaam' },
        { hindi: 'कल', meaning: 'Yesterday / Tomorrow', roman: 'Kal' },
        { hindi: 'आज', meaning: 'Today', roman: 'Aaj' },
      ]},
    ],
  },
  {
    id: 4, title: 'Unit 4', subtitle: 'Express Yourself', color: '#C8912A', bg: '#FBF3E2', icon: '💬',
    lessons: [
      { id: 'u4l1', title: 'Feelings', icon: '😊', xp: 25, lessonIndex: null, desc: 'Happy, sad, tired & more', words: [
        { hindi: 'खुश', meaning: 'Happy', roman: 'Khush' },
        { hindi: 'दुखी', meaning: 'Sad', roman: 'Dukhi' },
        { hindi: 'थका हुआ', meaning: 'Tired', roman: 'Thaka hua' },
        { hindi: 'गुस्सा', meaning: 'Angry', roman: 'Gussa' },
        { hindi: 'डर', meaning: 'Fear / Scared', roman: 'Dar' },
      ]},
      { id: 'u4l2', title: 'Weather', icon: '🌤️', xp: 25, lessonIndex: null, desc: 'Hot, cold, rain, sunny', words: [
        { hindi: 'गर्मी', meaning: 'Heat / Summer', roman: 'Garmi' },
        { hindi: 'ठंड', meaning: 'Cold / Winter', roman: 'Thand' },
        { hindi: 'बारिश', meaning: 'Rain', roman: 'Baarish' },
        { hindi: 'धूप', meaning: 'Sunshine', roman: 'Dhoop' },
        { hindi: 'आंधी', meaning: 'Storm', roman: 'Aandhi' },
      ]},
      { id: 'u4l3', title: 'Body Parts', icon: '🫀', xp: 25, lessonIndex: null, desc: 'Head, hands, eyes & more', words: [
        { hindi: 'सिर', meaning: 'Head', roman: 'Sir' },
        { hindi: 'हाथ', meaning: 'Hand', roman: 'Haath' },
        { hindi: 'आँख', meaning: 'Eye', roman: 'Aankh' },
        { hindi: 'कान', meaning: 'Ear', roman: 'Kaan' },
        { hindi: 'पैर', meaning: 'Leg / Foot', roman: 'Pair' },
      ]},
      { id: 'u4l4', title: 'Unit Challenge', icon: '🏆', xp: 50, lessonIndex: null, desc: 'Mix of all Unit 4 topics', words: [
        { hindi: 'खुश', meaning: 'Happy', roman: 'Khush' },
        { hindi: 'बारिश', meaning: 'Rain', roman: 'Baarish' },
        { hindi: 'आँख', meaning: 'Eye', roman: 'Aankh' },
        { hindi: 'गर्मी', meaning: 'Summer', roman: 'Garmi' },
        { hindi: 'हाथ', meaning: 'Hand', roman: 'Haath' },
      ]},
    ],
  },
  {
    id: 5, title: 'Unit 5', subtitle: 'Home & Places', color: '#DC2626', bg: '#FEE2E2', icon: '🏠',
    lessons: [
      { id: 'u5l1', title: 'Rooms at Home', icon: '🛋️', xp: 25, lessonIndex: null, desc: 'Kitchen, bedroom, bathroom', words: [
        { hindi: 'रसोई', meaning: 'Kitchen', roman: 'Rasoi' },
        { hindi: 'कमरा', meaning: 'Room', roman: 'Kamra' },
        { hindi: 'बाथरूम', meaning: 'Bathroom', roman: 'Bathroom' },
        { hindi: 'दरवाज़ा', meaning: 'Door', roman: 'Darwaaza' },
        { hindi: 'खिड़की', meaning: 'Window', roman: 'Khidki' },
      ]},
      { id: 'u5l2', title: 'Household Items', icon: '🪑', xp: 25, lessonIndex: null, desc: 'Chair, bed, table & more', words: [
        { hindi: 'कुर्सी', meaning: 'Chair', roman: 'Kursi' },
        { hindi: 'मेज़', meaning: 'Table', roman: 'Mez' },
        { hindi: 'बिस्तर', meaning: 'Bed', roman: 'Bistar' },
        { hindi: 'दीवार', meaning: 'Wall', roman: 'Deewar' },
        { hindi: 'छत', meaning: 'Ceiling / Roof', roman: 'Chhat' },
      ]},
      { id: 'u5l3', title: 'Places in City', icon: '🏙️', xp: 25, lessonIndex: null, desc: 'Hospital, school, temple', words: [
        { hindi: 'अस्पताल', meaning: 'Hospital', roman: 'Aspatal' },
        { hindi: 'स्कूल', meaning: 'School', roman: 'School' },
        { hindi: 'मंदिर', meaning: 'Temple', roman: 'Mandir' },
        { hindi: 'बैंक', meaning: 'Bank', roman: 'Bank' },
        { hindi: 'पुलिस', meaning: 'Police station', roman: 'Police' },
      ]},
      { id: 'u5l4', title: 'Nature & Animals', icon: '🌿', xp: 30, lessonIndex: null, desc: 'Trees, rivers, animals', words: [
        { hindi: 'पेड़', meaning: 'Tree', roman: 'Ped' },
        { hindi: 'नदी', meaning: 'River', roman: 'Nadi' },
        { hindi: 'पहाड़', meaning: 'Mountain', roman: 'Pahad' },
        { hindi: 'गाय', meaning: 'Cow', roman: 'Gaay' },
        { hindi: 'हाथी', meaning: 'Elephant', roman: 'Haathi' },
      ]},
    ],
  },
  {
    id: 6, title: 'Unit 6', subtitle: 'Work & School', color: '#059669', bg: '#D1FAE5', icon: '💼',
    lessons: [
      { id: 'u6l1', title: 'Professions', icon: '👨‍⚕️', xp: 30, lessonIndex: null, desc: 'Doctor, teacher, farmer', words: [
        { hindi: 'डॉक्टर', meaning: 'Doctor', roman: 'Doctor' },
        { hindi: 'शिक्षक', meaning: 'Teacher', roman: 'Shikshak' },
        { hindi: 'किसान', meaning: 'Farmer', roman: 'Kisaan' },
        { hindi: 'पुलिसवाला', meaning: 'Police officer', roman: 'Policewala' },
        { hindi: 'दुकानदार', meaning: 'Shopkeeper', roman: 'Dookaandaar' },
      ]},
      { id: 'u6l2', title: 'School & Study', icon: '📖', xp: 30, lessonIndex: null, desc: 'Book, pencil, class & more', words: [
        { hindi: 'किताब', meaning: 'Book', roman: 'Kitaab' },
        { hindi: 'कलम', meaning: 'Pen', roman: 'Kalam' },
        { hindi: 'कक्षा', meaning: 'Class / Classroom', roman: 'Kaksha' },
        { hindi: 'होमवर्क', meaning: 'Homework', roman: 'Homework' },
        { hindi: 'परीक्षा', meaning: 'Exam', roman: 'Pareeksha' },
      ]},
      { id: 'u6l3', title: 'Money & Numbers', icon: '💰', xp: 30, lessonIndex: null, desc: 'Rupee, hundred, thousand', words: [
        { hindi: 'रुपया', meaning: 'Rupee', roman: 'Rupaya' },
        { hindi: 'सौ', meaning: 'Hundred', roman: 'Sau' },
        { hindi: 'हज़ार', meaning: 'Thousand', roman: 'Hazaar' },
        { hindi: 'महंगाई', meaning: 'Inflation', roman: 'Mahangaai' },
        { hindi: 'बचत', meaning: 'Savings', roman: 'Bachat' },
      ]},
      { id: 'u6l4', title: 'Daily Routine', icon: '🌅', xp: 35, lessonIndex: null, desc: 'Wake up, eat, sleep, work', words: [
        { hindi: 'उठना', meaning: 'To wake up', roman: 'Uthna' },
        { hindi: 'नहाना', meaning: 'To bathe', roman: 'Nahaana' },
        { hindi: 'खाना खाना', meaning: 'To eat food', roman: 'Khaana khaana' },
        { hindi: 'काम करना', meaning: 'To work', roman: 'Kaam karna' },
        { hindi: 'सोना', meaning: 'To sleep', roman: 'Sona' },
      ]},
    ],
  },
  {
    id: 7, title: 'Unit 7', subtitle: 'Stories & Culture', color: '#BE185D', bg: '#FCE7F3', icon: '🎭',
    lessons: [
      { id: 'u7l1', title: 'Festivals', icon: '🪔', xp: 35, lessonIndex: null, desc: 'Diwali, Holi, Eid & more', words: [
        { hindi: 'दीवाली', meaning: 'Diwali — festival of lights', roman: 'Diwali' },
        { hindi: 'होली', meaning: 'Holi — festival of colors', roman: 'Holi' },
        { hindi: 'ईद', meaning: 'Eid — Islamic festival', roman: 'Eid' },
        { hindi: 'पूजा', meaning: 'Prayer / Worship', roman: 'Pooja' },
        { hindi: 'मेला', meaning: 'Fair / Festival market', roman: 'Mela' },
      ]},
      { id: 'u7l2', title: 'Clothes & Fashion', icon: '👗', xp: 35, lessonIndex: null, desc: 'Saree, kurta, dupatta', words: [
        { hindi: 'साड़ी', meaning: 'Saree', roman: 'Saari' },
        { hindi: 'कुर्ता', meaning: 'Kurta shirt', roman: 'Kurta' },
        { hindi: 'दुपट्टा', meaning: 'Dupatta / Scarf', roman: 'Dupatta' },
        { hindi: 'जूते', meaning: 'Shoes', roman: 'Joote' },
        { hindi: 'कपड़े', meaning: 'Clothes', roman: 'Kapde' },
      ]},
      { id: 'u7l3', title: 'Health & Body', icon: '🏥', xp: 35, lessonIndex: null, desc: 'Pain, medicine, doctor visit', words: [
        { hindi: 'दर्द', meaning: 'Pain', roman: 'Dard' },
        { hindi: 'बुखार', meaning: 'Fever', roman: 'Bukhaar' },
        { hindi: 'दवाई', meaning: 'Medicine', roman: 'Dawaai' },
        { hindi: 'आराम', meaning: 'Rest', roman: 'Aaraam' },
        { hindi: 'ठीक हो जाओ', meaning: 'Get well soon', roman: 'Theek ho jaao' },
      ]},
      { id: 'u7l4', title: 'Proverbs & Phrases', icon: '📜', xp: 40, lessonIndex: null, desc: 'Common sayings & expressions', words: [
        { hindi: 'जैसी करनी वैसी भरनी', meaning: 'As you sow, so shall you reap', roman: 'Jaisi karni waisi bharni' },
        { hindi: 'अपना हाथ जगन्नाथ', meaning: 'Self-help is the best help', roman: 'Apna haath Jagannath' },
        { hindi: 'एक और एक ग्यारह', meaning: 'Unity is strength', roman: 'Ek aur ek gyaarah' },
        { hindi: 'धीरे चलो', meaning: 'Go slowly / Take it easy', roman: 'Dheere chalo' },
        { hindi: 'जहाँ चाह वहाँ राह', meaning: 'Where there is a will, there is a way', roman: 'Jahaan chaah wahaan raah' },
      ]},
    ],
  },
  {
    id: 8, title: 'Unit 8', subtitle: 'Master Level', color: '#1A1208', bg: '#F5F0EB', icon: '👑',
    lessons: [
      { id: 'u8l1', title: 'Advanced Conversation', icon: '🗣️', xp: 50, lessonIndex: null, desc: 'Complex sentences & ideas', words: [
        { hindi: 'मुझे लगता है', meaning: 'I think / I feel', roman: 'Mujhe lagta hai' },
        { hindi: 'क्या आप सहमत हैं?', meaning: 'Do you agree?', roman: 'Kya aap sahmat hain?' },
        { hindi: 'मेरी राय में', meaning: 'In my opinion', roman: 'Meri raay mein' },
        { hindi: 'शायद', meaning: 'Maybe / Perhaps', roman: 'Shaayad' },
        { hindi: 'बिल्कुल', meaning: 'Absolutely / Exactly', roman: 'Bilkul' },
      ]},
      { id: 'u8l2', title: 'News & Current Events', icon: '📰', xp: 50, lessonIndex: null, desc: 'Talk about world events', words: [
        { hindi: 'समाचार', meaning: 'News', roman: 'Samaachaar' },
        { hindi: 'सरकार', meaning: 'Government', roman: 'Sarkaar' },
        { hindi: 'चुनाव', meaning: 'Election', roman: 'Chunaav' },
        { hindi: 'विकास', meaning: 'Development', roman: 'Vikaas' },
        { hindi: 'समस्या', meaning: 'Problem / Issue', roman: 'Samasya' },
      ]},
      { id: 'u8l3', title: 'Literature & Poetry', icon: '✍️', xp: 50, lessonIndex: null, desc: 'Famous phrases from literature', words: [
        { hindi: 'कविता', meaning: 'Poem / Poetry', roman: 'Kavita' },
        { hindi: 'कहानी', meaning: 'Story', roman: 'Kahaani' },
        { hindi: 'लेखक', meaning: 'Author / Writer', roman: 'Lekhak' },
        { hindi: 'भाषा', meaning: 'Language', roman: 'Bhaasha' },
        { hindi: 'संस्कृति', meaning: 'Culture', roman: 'Sanskriti' },
      ]},
      { id: 'u8l4', title: 'Grand Final 🏆', icon: '🎓', xp: 100, lessonIndex: null, desc: 'Ultimate challenge — all units!', words: [
        { hindi: 'नमस्ते', meaning: 'Hello / Greetings', roman: 'Namaste' },
        { hindi: 'धन्यवाद', meaning: 'Thank you', roman: 'Dhanyavaad' },
        { hindi: 'परिवार', meaning: 'Family', roman: 'Parivaar' },
        { hindi: 'भाषा', meaning: 'Language', roman: 'Bhaasha' },
        { hindi: 'संस्कृति', meaning: 'Culture', roman: 'Sanskriti' },
      ]},
    ],
  },
];

// Flat list of all lesson IDs in order (for unlock logic)
export const LESSON_ORDER = UNITS.flatMap(u => u.lessons.map(l => l.id));

// Get words for a lesson
export function getLessonWords(lesson, langCode, LESSONS_DATA) {
  if (lesson.lessonIndex !== null && lesson.lessonIndex !== undefined) {
    return LESSONS_DATA[langCode]?.[lesson.lessonIndex]?.words || [];
  }
  return (lesson.words || []).map(w => ({
    hindi: w.hindi,
    target: w.meaning,
    roman: w.roman,
    meaning: w.meaning,
  }));
}