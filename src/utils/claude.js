const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are BhashaLearn's Indian language tutor. You help Hindi speakers learn regional Indian languages.
Always be encouraging, warm, and use simple language.
Respond concisely. Use "Bahut badhiya!" for correct answers, "Koi baat nahi!" for mistakes.`;

async function callClaude(messages, systemOverride) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemOverride || SYSTEM_PROMPT,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "API error: " + res.status);
  }
  const data = await res.json();
  return data.content[0].text;
}

export { callClaude };

export async function generateLesson(topic, langName = "Bhojpuri") {
  const system = `You are a language lesson generator. Return ONLY valid JSON, no markdown, no backticks, no explanation.
Return exactly this JSON structure with exactly 6 words:
{"title":"lesson title","subtitle":"short description","words":[{"hindi":"हिंदी word","target":"${langName} word","roman":"romanized ${langName}","meaning":"English meaning"}]}`;
  const text = await callClaude([{ role: "user", content: `Generate a Hindi to ${langName} vocabulary lesson about: ${topic}` }], system);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function generateQuiz(words, langName = "Bhojpuri") {
  const system = `You are a language quiz generator. Return ONLY valid JSON, no markdown, no backticks, no explanation.
Return exactly this structure with exactly 5 questions:
{"questions":[{"hindi":"Hindi word","roman":"romanization","meaning":"English","options":["option1","option2","option3","option4"],"correct":0}]}
The "correct" field must be the 0-based index (0,1,2, or 3) of the right answer in the options array.
Make the options realistic — mix correct and plausible wrong answers from the same language.`;
  const text = await callClaude([
    { role: "user", content: `Generate 5 MCQ quiz questions for Hindi speakers learning ${langName}. Use these vocabulary words: ${JSON.stringify(words.slice(0, 10))}` }
  ], system);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function checkTranslation(hindi, userAnswer, correctAnswer, langName = "Bhojpuri") {
  return await callClaude([{
    role: "user",
    content: `The student is learning ${langName}.
Hindi sentence: "${hindi}"
Correct ${langName} translation: "${correctAnswer}"
Student's answer: "${userAnswer}"

Check if the student's answer is correct or close enough. Give 2-3 sentences of warm, encouraging feedback.
If correct or close: start with "Bahut badhiya! ✓"
If wrong: start with "Koi baat nahi! ✗" then show the correct answer and explain the difference briefly.`
  }]);
}

// Daily word of the day — rotates every day
export function getWordOfDay(langCode = "bhojpuri") {
  const words = {
    bhojpuri: [
      { hindi: "नीमन", target: "Neeman", meaning: "Good / Fine", example: "Sab kuch neeman ba — Everything is good." },
      { hindi: "रउआ", target: "Rauwa", meaning: "You (respectful)", example: "Rauwa kaisan baani? — How are you?" },
      { hindi: "हमार", target: "Hamaar", meaning: "My / Mine", example: "Hamaar naam Ram ba — My name is Ram." },
      { hindi: "बहुत", target: "Bahut", meaning: "Very / A lot", example: "Bahut badhiya! — Very good!" },
      { hindi: "आवे", target: "Aawe", meaning: "To come", example: "U aawe wala ba — He is about to come." },
      { hindi: "जाव", target: "Jaav", meaning: "To go", example: "Hum jaav tani — Let me go for a bit." },
      { hindi: "खइबे", target: "Khaibe", meaning: "Will eat", example: "Ka khaibe? — What will you eat?" },
    ],
    tamil: [
      { hindi: "वणक्कम", target: "Vanakkam", meaning: "Hello / Greetings", example: "Vanakkam! — Hello!" },
      { hindi: "नन्री", target: "Nandri", meaning: "Thank you", example: "Romba nandri — Thank you very much." },
      { hindi: "एप्पदि", target: "Eppadi", meaning: "How", example: "Neenga eppadi irukkeenga? — How are you?" },
    ],
    default: [
      { hindi: "नमस्ते", target: "Hello", meaning: "A universal greeting", example: "Say namaste to greet anyone respectfully." },
    ]
  };
  const list = words[langCode] || words.default;
  const dayIndex = Math.floor(Date.now() / 86400000) % list.length;
  return list[dayIndex];
}
