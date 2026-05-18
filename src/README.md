# BhashaLearn UI Redesign — Drop-in Components

## Files

| File | What it is |
|------|-----------|
| `theme.css` | Design tokens (colors, fonts, spacing). Import once in `index.css`. |
| `App.jsx` | Root app — wires all screens + bottom nav. |
| `HomeScreen.jsx` + `.css` | Home screen with header, streak, language cards, AI tutor card, next lesson. |
| `QuizScreen.jsx` + `.css` | Quiz screen with progress bar, MCQ options, lives, feedback bar, result screen. |
| `AiTutorScreen.jsx` + `.css` | Gemini chat screen with message bubbles, typing indicator, suggestion chips. |
| `BottomNav.jsx` + `.css` | Fixed 5-tab bottom navigation bar. |

## Setup

### 1. Copy files into your `src/` folder

```
src/
  theme.css          ← new
  App.jsx            ← replaces your App.js
  HomeScreen.jsx     ← new
  HomeScreen.css     ← new
  QuizScreen.jsx     ← new
  QuizScreen.css     ← new
  AiTutorScreen.jsx  ← new
  AiTutorScreen.css  ← new
  BottomNav.jsx      ← new
  BottomNav.css      ← new
```

### 2. Import the theme in your `index.css`

```css
@import './theme.css';
```

Or add this line at the top of your existing `index.css`.

### 3. Update `index.js` (if needed)

Your existing `index.js` doesn't need to change — it just renders `<App />`.

### 4. Connect your real data

Each component has a clearly marked section at the top (with a comment `─── Mock data ───`).
Replace those mock arrays/objects with props or context from your existing data layer.

**HomeScreen** — pass your real languages array and user object.

**QuizScreen** — pass a `questions` prop (array of question objects). The shape is:
```js
{
  id: number,
  prompt: string,           // e.g. "What does this mean?"
  word: string,             // e.g. "बाबा (Baba)"
  options: string[],        // 4 choices
  correct: number,          // index of correct option (0-3)
  explanation: string,      // shown in feedback bar
  explanationHindi: string, // shown below in italics
}
```

**AiTutorScreen** — replace the `callGemini()` stub at the top with your real Gemini 2.5 Flash API call.

### 5. Google Font (optional but recommended)

The theme uses **Baloo 2** for a warm, playful feel that suits Indian language apps.
It's already imported in `theme.css` via Google Fonts. If you're offline-first, download
and self-host it from https://fonts.google.com/specimen/Baloo+2

## Color system

All colors are CSS variables defined in `theme.css`. To change the brand color,
just update `--bl-saffron` and `--bl-saffron-dark` — every component picks it up automatically.

```css
/* Example: switch to blue brand */
:root {
  --bl-saffron:      #1A6FE8;
  --bl-saffron-dark: #1257C0;
  --bl-saffron-light:#E8F0FF;
  --bl-saffron-pale: #F5F8FF;
}
```
