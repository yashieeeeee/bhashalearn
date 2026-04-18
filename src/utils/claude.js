const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function getKey() {
  const key = process.env.REACT_APP_GEMINI_API_KEY;
  if (!key) throw new Error("Missing REACT_APP_GEMINI_API_KEY in .env file!");
  return key;
}

async function callGemini(systemPrompt, userMessage, maxTokens = 1000) {
  const key = getKey();
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────
// Returns: { questions: [{ hindi, roman, meaning, options: [], correct: 0 }] }
export async function generateQuiz(words) {
  const system = `You are a language quiz generator. Given vocabulary words, generate exactly 5 multiple choice questions.
Return ONLY valid JSON, no markdown fences, no explanation:
{"questions":[{"hindi":"hindi word","roman":"romanization","meaning":"english meaning","options":["a","b","c","d"],"correct":0}]}
The "correct" field is the 0-based index of the right answer. Options must be in the target language. Randomize the correct answer position.`;

  const text = await callGemini(system, `Generate quiz from these words: ${JSON.stringify(words.slice(0, 12))}`);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Invalid quiz format");
  return parsed;
}

// ─── Lesson Generator ─────────────────────────────────────────────────────────
// Returns: { title, words: [{ hindi, target, roman, meaning }] }
export async function generateLesson(topic) {
  const system = `You are a language teacher creating vocabulary lessons for Hindi speakers.
Generate a lesson with exactly 6 vocabulary words on the given topic.
Return ONLY valid JSON, no markdown, no explanation:
{"title":"Topic Name","words":[{"hindi":"hindi word in devanagari","target":"word in target language script","roman":"romanized pronunciation","meaning":"english meaning"}]}`;

  const text = await callGemini(system, `Topic: ${topic}`);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!parsed.words || !Array.isArray(parsed.words)) throw new Error("Invalid lesson format");
  return parsed;
}

// ─── Translation Checker ──────────────────────────────────────────────────────
// Returns a feedback string
export async function checkTranslation(hindi, userAnswer, correctAnswer) {
  const system = `You are a friendly Bhojpuri language tutor checking a student's translation.
If correct or close enough, start with exactly "Bahut badhiya". If wrong, gently correct them.
2-3 sentences max. Use simple English with some Bhojpuri flavor.`;

  return await callGemini(
    system,
    `Hindi: "${hindi}" | Correct answer: "${correctAnswer}" | Student's answer: "${userAnswer}". Give feedback.`
  );
}

// ─── AI Tutor Chat ────────────────────────────────────────────────────────────
// Returns a response string
export async function chatWithTutor(userMessage, language = "Indian languages") {
  const system = `You are a friendly and encouraging Indian languages tutor helping Hindi speakers learn any Indian language including Bhojpuri, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu and Assamese.
When a user asks about a specific language, teach that language.
Give clear helpful answers. Always include the word in native script + Roman transliteration + meaning.
Keep responses concise (3-5 sentences) and end with encouragement.`;

  return await callGemini(system, userMessage, 800);
}