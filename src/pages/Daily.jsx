import { useState } from 'react';
import { LANGUAGES } from '../data/content';
import { checkTranslation } from '../utils/claude';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Word of the day per language — rotates daily
const WORDS_OF_DAY = {
  bhojpuri: [
    { hindi: "नीमन", target: "Neeman", meaning: "Good/Fine — Bhojpuri version of 'accha'", example: "Sab kuch neeman ba — Everything is good." },
    { hindi: "रउआ", target: "Rauwa", meaning: "You (respectful) — polite form of 'aap'", example: "Rauwa kaisan baani? — How are you?" },
    { hindi: "माई", target: "Maai", meaning: "Mother — warm Bhojpuri word for 'maa'", example: "Maai ke yaad aavela — I miss mother." },
    { hindi: "पनिया", target: "Paniya", meaning: "Water — Bhojpuri word for 'paani'", example: "Paniya pi la — Drink some water." },
    { hindi: "बहुत", target: "Bahute", meaning: "Very/A lot — pronounced 'bahute' in Bhojpuri", example: "Bahute neeman ba — It is very good." },
    { hindi: "घर", target: "Ghar", meaning: "Home — same as Hindi but warmer in Bhojpuri", example: "Apan ghar — Our/My home." },
    { hindi: "खुशी", target: "Khushi", meaning: "Happiness — expressed openly in Bhojpuri culture", example: "Man mein bahut khushi ba." },
  ],
  tamil: [
    { hindi: "धन्यवाद", target: "நன்றி (Nandri)", meaning: "Thank you in Tamil", example: "Nandri — Thank you very much!" },
    { hindi: "प्यार", target: "அன்பு (Anbu)", meaning: "Love in Tamil", example: "Anbu — Love/Affection." },
    { hindi: "घर", target: "வீடு (Veedu)", meaning: "Home in Tamil", example: "En veedu — My home." },
    { hindi: "खाना", target: "சாப்பாடு (Saappaadu)", meaning: "Food/Meal in Tamil", example: "Saappaadu saappidunga — Please eat food." },
    { hindi: "पानी", target: "தண்ணீர் (Thanneer)", meaning: "Water in Tamil", example: "Thanneer kudikka — Drink water." },
    { hindi: "माँ", target: "அம்மா (Amma)", meaning: "Mother in Tamil", example: "En Amma — My mother." },
    { hindi: "सुंदर", target: "அழகு (Azagu)", meaning: "Beautiful in Tamil", example: "Azagu — Beauty/Beautiful." },
  ],
  telugu: [
    { hindi: "धन्यवाद", target: "ధన్యవాదాలు (Dhanyavaadaalu)", meaning: "Thank you in Telugu", example: "Dhanyavaadaalu — Thank you!" },
    { hindi: "प्यार", target: "ప్రేమ (Prema)", meaning: "Love in Telugu", example: "Prema — Love/Affection." },
    { hindi: "घर", target: "ఇల్లు (Illu)", meaning: "Home in Telugu", example: "Maa illu — Our home." },
    { hindi: "खाना", target: "భోజనం (Bhojanam)", meaning: "Food in Telugu", example: "Bhojanam cheyyandi — Please eat food." },
    { hindi: "पानी", target: "నీరు (Neeru)", meaning: "Water in Telugu", example: "Neeru tagandi — Drink water." },
    { hindi: "माँ", target: "అమ్మ (Amma)", meaning: "Mother in Telugu", example: "Maa Amma — My mother." },
    { hindi: "सुंदर", target: "అందమైన (Andamaina)", meaning: "Beautiful in Telugu", example: "Andamaina — Beautiful." },
  ],
  marathi: [
    { hindi: "धन्यवाद", target: "धन्यवाद (Dhanyavaad)", meaning: "Thank you in Marathi", example: "Khup dhanyavaad — Thank you very much!" },
    { hindi: "प्यार", target: "प्रेम (Prem)", meaning: "Love in Marathi", example: "Prem — Love/Affection." },
    { hindi: "घर", target: "घर (Ghar)", meaning: "Home in Marathi", example: "Aamcha ghar — Our home." },
    { hindi: "खाना", target: "जेवण (Jevan)", meaning: "Food/Meal in Marathi", example: "Jevan kha — Eat food." },
    { hindi: "पानी", target: "पाणी (Paani)", meaning: "Water in Marathi", example: "Paani pi — Drink water." },
    { hindi: "माँ", target: "आई (Aai)", meaning: "Mother in Marathi", example: "Maza Aai — My mother." },
    { hindi: "सुंदर", target: "सुंदर (Sundar)", meaning: "Beautiful in Marathi", example: "Khup sundar — Very beautiful." },
  ],
  bengali: [
    { hindi: "धन्यवाद", target: "ধন্যবাদ (Dhonnobad)", meaning: "Thank you in Bengali", example: "Dhonnobad — Thank you!" },
    { hindi: "प्यार", target: "ভালোবাসা (Bhalobasha)", meaning: "Love in Bengali", example: "Bhalobasha — Love." },
    { hindi: "घर", target: "বাড়ি (Baari)", meaning: "Home in Bengali", example: "Aamar baari — My home." },
    { hindi: "खाना", target: "খাবার (Khabar)", meaning: "Food in Bengali", example: "Khabar khao — Eat food." },
    { hindi: "पानी", target: "জল (Jol)", meaning: "Water in Bengali", example: "Jol khao — Drink water." },
    { hindi: "माँ", target: "মা (Maa)", meaning: "Mother in Bengali", example: "Aamar maa — My mother." },
    { hindi: "सुंदर", target: "সুন্দর (Shundar)", meaning: "Beautiful in Bengali", example: "Khub shundar — Very beautiful." },
  ],
  gujarati: [
    { hindi: "धन्यवाद", target: "આભાર (Aabhaar)", meaning: "Thank you in Gujarati", example: "Khub aabhaar — Thank you very much!" },
    { hindi: "प्यार", target: "પ્રેમ (Prem)", meaning: "Love in Gujarati", example: "Prem — Love." },
    { hindi: "घर", target: "ઘર (Ghar)", meaning: "Home in Gujarati", example: "Aamanru ghar — Our home." },
    { hindi: "खाना", target: "ખાણું (Khaanu)", meaning: "Food in Gujarati", example: "Khaanu khaao — Eat food." },
    { hindi: "पानी", target: "પાણી (Paani)", meaning: "Water in Gujarati", example: "Paani peeyo — Drink water." },
    { hindi: "माँ", target: "માં (Maa)", meaning: "Mother in Gujarati", example: "Mara maa — My mother." },
    { hindi: "सुंदर", target: "સુંદર (Sundar)", meaning: "Beautiful in Gujarati", example: "Khub sundar — Very beautiful." },
  ],
  punjabi: [
    { hindi: "धन्यवाद", target: "ਧੰਨਵਾਦ (Dhannvaad)", meaning: "Thank you in Punjabi", example: "Bahut dhannvaad — Thank you very much!" },
    { hindi: "प्यार", target: "ਪਿਆਰ (Pyaar)", meaning: "Love in Punjabi", example: "Pyaar — Love." },
    { hindi: "घर", target: "ਘਰ (Ghar)", meaning: "Home in Punjabi", example: "Sada ghar — Our home." },
    { hindi: "खाना", target: "ਖਾਣਾ (Khaana)", meaning: "Food in Punjabi", example: "Khaana khao — Eat food." },
    { hindi: "पानी", target: "ਪਾਣੀ (Paani)", meaning: "Water in Punjabi", example: "Paani pio — Drink water." },
    { hindi: "माँ", target: "ਮਾਂ (Maan)", meaning: "Mother in Punjabi", example: "Meri maan — My mother." },
    { hindi: "सुंदर", target: "ਸੁੰਦਰ (Sundar)", meaning: "Beautiful in Punjabi", example: "Bahut sundar — Very beautiful." },
  ],
  kannada: [
    { hindi: "धन्यवाद", target: "ಧನ್ಯವಾದ (Dhanyavaada)", meaning: "Thank you in Kannada", example: "Dhanyavaada — Thank you!" },
    { hindi: "प्यार", target: "ಪ್ರೀತಿ (Preeti)", meaning: "Love in Kannada", example: "Preeti — Love." },
    { hindi: "घर", target: "ಮನೆ (Mane)", meaning: "Home in Kannada", example: "Namma mane — Our home." },
    { hindi: "खाना", target: "ಊಟ (Oota)", meaning: "Food in Kannada", example: "Oota maadi — Please eat food." },
    { hindi: "पानी", target: "ನೀರು (Neeru)", meaning: "Water in Kannada", example: "Neeru kudee — Drink water." },
    { hindi: "माँ", target: "ಅಮ್ಮ (Amma)", meaning: "Mother in Kannada", example: "Namma Amma — Our mother." },
    { hindi: "सुंदर", target: "ಸುಂದರ (Sundara)", meaning: "Beautiful in Kannada", example: "Tumba sundara — Very beautiful." },
  ],
  malayalam: [
    { hindi: "धन्यवाद", target: "നന്ദി (Nandi)", meaning: "Thank you in Malayalam", example: "Nandi — Thank you!" },
    { hindi: "प्यार", target: "സ്നേഹം (Sneham)", meaning: "Love in Malayalam", example: "Sneham — Love." },
    { hindi: "घर", target: "വീട് (Veedu)", meaning: "Home in Malayalam", example: "Ente veedu — My home." },
    { hindi: "खाना", target: "ഭക്ഷണം (Bhakshanam)", meaning: "Food in Malayalam", example: "Bhakshanam kazhikkoo — Eat food." },
    { hindi: "पानी", target: "വെള്ളം (Vellam)", meaning: "Water in Malayalam", example: "Vellam kudikkoo — Drink water." },
    { hindi: "माँ", target: "അമ്മ (Amma)", meaning: "Mother in Malayalam", example: "Ente Amma — My mother." },
    { hindi: "सुंदर", target: "സുന്ദരം (Sundaram)", meaning: "Beautiful in Malayalam", example: "Valare sundaram — Very beautiful." },
  ],
  urdu: [
    { hindi: "धन्यवाद", target: "شکریہ (Shukriya)", meaning: "Thank you in Urdu", example: "Bahut shukriya — Thank you very much!" },
    { hindi: "प्यार", target: "محبت (Mohabbat)", meaning: "Love in Urdu", example: "Mohabbat — Love." },
    { hindi: "घर", target: "گھر (Ghar)", meaning: "Home in Urdu", example: "Hamara ghar — Our home." },
    { hindi: "खाना", target: "کھانا (Khaana)", meaning: "Food in Urdu", example: "Khaana khao — Eat food." },
    { hindi: "पानी", target: "پانی (Paani)", meaning: "Water in Urdu", example: "Paani piyo — Drink water." },
    { hindi: "माँ", target: "امی (Ammi)", meaning: "Mother in Urdu", example: "Meri Ammi — My mother." },
    { hindi: "सुंदर", target: "خوبصورت (Khubsurat)", meaning: "Beautiful in Urdu", example: "Bahut khubsurat — Very beautiful." },
  ],
  odia: [
    { hindi: "धन्यवाद", target: "ଧନ୍ୟବାଦ (Dhanyavaad)", meaning: "Thank you in Odia", example: "Dhanyavaad — Thank you!" },
    { hindi: "प्यार", target: "ପ୍ରେମ (Prema)", meaning: "Love in Odia", example: "Prema — Love." },
    { hindi: "घर", target: "ଘର (Ghara)", meaning: "Home in Odia", example: "Aama ghara — Our home." },
    { hindi: "खाना", target: "ଖାଦ୍ୟ (Khadya)", meaning: "Food in Odia", example: "Khadya khao — Eat food." },
    { hindi: "पानी", target: "ପାଣି (Paani)", meaning: "Water in Odia", example: "Paani piba — Drink water." },
    { hindi: "माँ", target: "ମା (Maa)", meaning: "Mother in Odia", example: "Mora maa — My mother." },
    { hindi: "सुंदर", target: "ସୁନ୍ଦର (Sundara)", meaning: "Beautiful in Odia", example: "Bahut sundara — Very beautiful." },
  ],
  assamese: [
    { hindi: "धन्यवाद", target: "ধন্যবাদ (Dhonnobad)", meaning: "Thank you in Assamese", example: "Dhonnobad — Thank you!" },
    { hindi: "प्यार", target: "মৰম (Morom)", meaning: "Love in Assamese", example: "Morom — Love/Affection." },
    { hindi: "घर", target: "ঘৰ (Ghor)", meaning: "Home in Assamese", example: "Amar ghor — My home." },
    { hindi: "खाना", target: "খাদ্য (Khadyo)", meaning: "Food in Assamese", example: "Khadyo khaok — Eat food." },
    { hindi: "पानी", target: "পানী (Paani)", meaning: "Water in Assamese", example: "Paani piyok — Drink water." },
    { hindi: "माँ", target: "মা (Maa)", meaning: "Mother in Assamese", example: "Aamar maa — My mother." },
    { hindi: "सुंदर", target: "সুন্দৰ (Shundor)", meaning: "Beautiful in Assamese", example: "Besh shundor — Very beautiful." },
  ],
};

const ALL_CHALLENGES = {
  bhojpuri: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "रउआ कइसन बानी?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "हमार नाम राम बा" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "पनिया दा" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "खाना खाव" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "इ नीमन बा" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "घर जाव" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "हम थाकल बानी" },
  ],
  tamil: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "நீங்கள் எப்படி இருக்கிறீர்கள்?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "என் பெயர் ராம்" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "தண்ணீர் தாருங்கள்" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "சாப்பிடுங்கள்" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "இது நல்லது" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "வீட்டிற்கு போங்கள்" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "நான் சோர்வாக இருக்கிறேன்" },
  ],
  telugu: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "మీరు ఎలా ఉన్నారు?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "నా పేరు రామ్" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "నీరు ఇవ్వండి" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "భోజనం చేయండి" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ఇది మంచిది" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ఇంటికి వెళ్ళండి" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "నేను అలసిపోయాను" },
  ],
  marathi: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "तुम्ही कसे आहात?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "माझे नाव राम आहे" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "पाणी द्या" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "जेवण खा" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "हे चांगले आहे" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "घरी जा" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "मी थकलो आहे" },
  ],
  bengali: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "আপনি কেমন আছেন?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "আমার নাম রাম" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "জল দিন" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "খাবার খান" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "এটা ভালো" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "বাড়ি যান" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "আমি ক্লান্ত" },
  ],
  gujarati: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "તમે કેમ છો?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "મારું નામ રામ છે" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "પાણી આપો" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ખાણું ખાઓ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "આ સારું છે" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ઘરે જાઓ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "હું થાકી ગયો છું" },
  ],
  punjabi: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ਮੇਰਾ ਨਾਮ ਰਾਮ ਹੈ" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ਪਾਣੀ ਦਿਓ" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ਖਾਣਾ ਖਾਓ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ਇਹ ਚੰਗਾ ਹੈ" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ਘਰ ਜਾਓ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ਮੈਂ ਥੱਕਿਆ ਹੋਇਆ ਹਾਂ" },
  ],
  kannada: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ನೀವು ಹೇಗಿದ್ದೀರಿ?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ನನ್ನ ಹೆಸರು ರಾಮ್" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ನೀರು ಕೊಡಿ" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ಊಟ ಮಾಡಿ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ಇದು ಒಳ್ಳೆಯದು" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ಮನೆಗೆ ಹೋಗಿ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ನಾನು ದಣಿದಿದ್ದೇನೆ" },
  ],
  malayalam: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "നിങ്ങൾ എങ്ങനെ ഉണ്ട്?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "എന്റെ പേര് രാം" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "വെള്ളം തരൂ" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ഭക്ഷണം കഴിക്കൂ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ഇത് നല്ലതാണ്" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "വീട്ടിൽ പോകൂ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ഞാൻ ക്ഷീണിതനാണ്" },
  ],
  urdu: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "آپ کیسے ہیں؟" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "میرا نام رام ہے" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "پانی دو" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "کھانا کھاؤ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "یہ اچھا ہے" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "گھر جاؤ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "میں تھکا ہوا ہوں" },
  ],
  odia: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "ଆପଣ କେମିତି ଅଛନ୍ତି?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "ମୋ ନାଁ ରାମ" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "ପାଣି ଦିଅ" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "ଖାଇବା ଖାଅ" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "ଏହା ଭଲ" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ଘରକୁ ଯାଅ" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "ମୁଁ ଥକି ଗଲି" },
  ],
  assamese: [
    { hindi: "आप कैसे हैं?", roman: "Aap kaise hain?", meaning: "How are you?", answer: "আপুনি কেনে আছে?" },
    { hindi: "मेरा नाम राम है", roman: "Mera naam Ram hai", meaning: "My name is Ram", answer: "মোৰ নাম ৰাম" },
    { hindi: "पानी दो", roman: "Paani do", meaning: "Give water", answer: "পানী দিয়ক" },
    { hindi: "खाना खाओ", roman: "Khaana khao", meaning: "Eat food", answer: "খাদ্য খাওক" },
    { hindi: "यह अच्छा है", roman: "Yeh accha hai", meaning: "This is good", answer: "এইটো ভাল" },
    { hindi: "घर जाओ", roman: "Ghar jao", meaning: "Go home", answer: "ঘৰলৈ যাওক" },
    { hindi: "मैं थका हूं", roman: "Main thaka hoon", meaning: "I am tired", answer: "মই ভাগৰি পৰিছো" },
  ],
};

export default function Daily() {
  const { profile, user } = useAuth();
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

  // Word of day — rotates daily per language
  const words = WORDS_OF_DAY[selectedLang] || WORDS_OF_DAY.bhojpuri;
  const wordIndex = Math.floor(Date.now() / 86400000) % words.length;
  const todayWord = words[wordIndex];

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


// If correct, add XP
if (result.startsWith('Bahut badhiya') && user) {
  await supabase.from('profiles').update({
    total_xp: (profile?.total_xp || 0) + 3,
    daily_completed: (profile?.daily_completed || 0) + 1,
  }).eq('id', user.id);
}
      setFeedback(result); setChecked(true);
    } catch (e) {
      setFeedback('Could not connect. Please try again.'); setChecked(true);
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
            <div key={d} style={{ flex: 1, padding: '10px 0', borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 500, background: streakStatus[i] === 'done' ? '#E0F2F2' : streakStatus[i] === 'today' ? '#E8611A' : '#F0E8DC', color: streakStatus[i] === 'done' ? '#0D6E6E' : streakStatus[i] === 'today' ? '#FAF6F0' : '#7A6552' }}>
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
          style={{ width: '100%', background: 'rgba(250,246,240,0.08)', border: '0.5px solid rgba(250,246,240,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#FAF6F0', fontFamily: "'Noto Sans Devanagari','DM Sans',sans-serif", resize: 'none', minHeight: 80, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
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

      {/* Word of the day — per language */}
      <div className="fade-up-4" style={{ background: '#FBF3E2', border: '0.5px solid rgba(200,145,42,0.25)', borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#C8912A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Word of the day · {currentLang?.name} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 28, fontWeight: 500, color: '#1A1208' }}>{todayWord.hindi}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#C8912A', marginTop: 4 }}>{todayWord.target}</div>
        <p style={{ fontSize: 13, color: '#7A6552', marginTop: 8, lineHeight: 1.6 }}>{todayWord.meaning}</p>
        <p style={{ fontSize: 12, color: '#7A6552', marginTop: 6, fontStyle: 'italic' }}>{todayWord.example}</p>
      </div>
    </div>
  );
}