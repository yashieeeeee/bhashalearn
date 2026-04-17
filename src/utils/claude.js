const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

const HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
};

function checkKey() {
  if (!API_KEY) throw new Error(
    "Missing API key! Rename .env.txt → .env in your project root and restart npm start."
  );
}

async function parseResponse(res) {
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data?.content?.[0]?.text || "";
}

// Single-turn helper (used internally + exported for any direct use)
export async function callClaude(system, userMessage, maxTokens = 1000) {
  checkKey();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  return parseResponse(res);
}

// Multi-turn chat — accepts a full messages array [{ role, content }]
// Used by AiTutor.jsx for conversation history
export async function callClaudeChat(messages, maxTokens = 1000) {
  checkKey();
  const system = `You are a friendly and encouraging Bhojpuri language tutor helping Hindi speakers learn Bhojpuri.
Answer questions about Bhojpuri words, grammar, pronunciation, and culture.
Keep responses concise and warm. Mix in occasional Bhojpuri phrases with translations for flavor.`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  return parseResponse(res);
}

// Generate a quiz from a list of words
// Returns: { questions: [{ hindi, roman, meaning, options, correct }] }
export async function generateQuiz(words) {
  const system = `You are a language quiz generator. Given a list of vocabulary words, generate exactly 5 multiple choice questions.
Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "questions": [
    {
      "hindi": "the Hindi word being tested",
      "roman": "romanization of hindi word",
      "meaning": "english meaning",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0
    }
  ]
}
The "correct" field is the 0-based index of the right answer in the options array.
Options should be in the target language. Mix up where the correct answer appears.`;

  const text = await callClaude(system, `Generate quiz from these words: ${JSON.stringify(words)}`);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Generate a new lesson on a given topic
// Returns: { title, words: [{ hindi, target, roman, meaning }] }
export async function generateLesson(topic) {
  const system = `You are a language teacher creating vocabulary lessons for Hindi speakers.
Generate a lesson with exactly 6 words on the given topic.
Return ONLY a valid JSON object, no markdown, no explanation:
{
  "title": "Topic Name",
  "words": [
    {
      "hindi": "hindi word in devanagari",
      "target": "word in target language script",
      "roman": "romanized pronunciation",
      "meaning": "english meaning"
    }
  ]
}`;

  const text = await callClaude(system, `Topic: ${topic}`);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// Check a translation answer using AI
// Returns a feedback string
export async function checkTranslation(hindi, userAnswer, correctAnswer) {
  const system = `You are a friendly Bhojpuri language tutor checking a student's translation.
Be encouraging. If correct, start with "Bahut badhiya". If wrong, explain what the correct answer is and why.
Keep your response to 2-3 sentences max. Write in simple English with some Bhojpuri words for flavor.`;

  return await callClaude(
    system,
    `Hindi phrase: "${hindi}"
Student's answer: "${userAnswer}"
Correct answer: "${correctAnswer}"
Is the student's answer correct or close enough? Give feedback.`
  );
}