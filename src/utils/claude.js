const API_URL = "https://api.anthropic.com/v1/messages";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };
}

async function callClaude(system, userMessage, maxTokens = 1000) {
  const key = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!key) throw new Error("API key missing!");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Claude");
  return text;
}

// Returns: { questions: [{ hindi, roman, meaning, options: [], correct: 0 }] }
export async function generateQuiz(words) {
  const system = `You are a language quiz generator. Given vocabulary words, generate exactly 5 multiple choice questions.
Return ONLY valid JSON, no markdown fences, no explanation:
{"questions":[{"hindi":"hindi word","roman":"romanization","meaning":"english meaning","options":["a","b","c","d"],"correct":0}]}
The "correct" field is the 0-based index of the right answer. Options must be in the target language. Randomize the correct answer position.`;

  const text = await callClaude(system, `Words: ${JSON.stringify(words.slice(0, 12))}`);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Invalid quiz format");
  return parsed;
}

// Returns: { title, words: [{ hindi, target, roman, meaning }] }
export async function generateLesson(topic) {
  const system = `You are a language teacher creating vocabulary lessons for Hindi speakers.
Generate a lesson with exactly 6 vocabulary words on the given topic.
Return ONLY valid JSON, no markdown, no explanation:
{"title":"Topic Name","words":[{"hindi":"hindi word in devanagari","target":"word in target language script","roman":"romanized pronunciation","meaning":"english meaning"}]}`;

  const text = await callClaude(system, `Topic: ${topic}`);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!parsed.words || !Array.isArray(parsed.words)) throw new Error("Invalid lesson format");
  return parsed;
}

// Returns a feedback string
export async function checkTranslation(hindi, userAnswer, correctAnswer) {
  const system = `You are a friendly Bhojpuri language tutor checking a student's translation.
If correct or close enough, start with exactly "Bahut badhiya". If wrong, gently correct them.
2-3 sentences max. Use simple English with some Bhojpuri flavor.`;

  return await callClaude(
    system,
    `Hindi: "${hindi}" | Correct answer: "${correctAnswer}" | Student's answer: "${userAnswer}". Give feedback.`
  );
}

// Returns a response string for AI Tutor chat
export async function chatWithTutor(userMessage, language = "Bhojpuri") {
  const system = `You are a friendly ${language} language tutor for Hindi speakers. Give helpful, concise answers (3-5 sentences). Use Devanagari + Roman transliteration for all words. End with encouragement.`;
  return await callClaude(system, userMessage, 800);
}