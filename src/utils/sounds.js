// ── BhashaLearn Sound System ─────────────────────────────────────────────────
// Pure Web Audio API — zero dependencies, zero network requests.
// All sounds are generated programmatically.

const ctx = () => {
  if (!window._blAudioCtx) {
    window._blAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window._blAudioCtx;
};

function play(fn) {
  try {
    const c = ctx();
    if (c.state === 'suspended') c.resume();
    fn(c);
  } catch {}
}

// ── Correct answer — bright upward ding ──────────────────────────────────────
export function soundCorrect() {
  play(c => {
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, c.currentTime + i * 0.08);
      g.gain.setValueAtTime(0, c.currentTime + i * 0.08);
      g.gain.linearRampToValueAtTime(0.18, c.currentTime + i * 0.08 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.22);
      o.start(c.currentTime + i * 0.08);
      o.stop(c.currentTime + i * 0.08 + 0.25);
    });
  });
}

// ── Wrong answer — dull thud / buzz ──────────────────────────────────────────
export function soundWrong() {
  play(c => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.18);
    g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    o.start(c.currentTime);
    o.stop(c.currentTime + 0.25);
  });
}

// ── Quiz complete / lesson done — celebratory fanfare ────────────────────────
export function soundComplete() {
  play(c => {
    // Ascending arpeggio + final chord
    const melody = [
      [523.25, 0.00],  // C5
      [659.25, 0.10],  // E5
      [783.99, 0.20],  // G5
      [1046.5, 0.32],  // C6
    ];
    melody.forEach(([freq, t]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + t);
      g.gain.linearRampToValueAtTime(0.2, c.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.35);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + 0.38);
    });
  });
}

// ── Level up — triumphant two-tone rise ──────────────────────────────────────
export function soundLevelUp() {
  play(c => {
    const sequence = [
      [523.25, 0.00, 0.18],
      [783.99, 0.16, 0.18],
      [1046.5, 0.32, 0.12],
      [1318.5, 0.44, 0.40],
    ];
    sequence.forEach(([freq, t, dur]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + t);
      g.gain.linearRampToValueAtTime(0.22, c.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + dur + 0.05);
    });
  });
}

// ── Streak milestone — punchy rhythm ─────────────────────────────────────────
export function soundStreak() {
  play(c => {
    [0, 0.12, 0.24].forEach(t => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine';
      o.frequency.value = t === 0.24 ? 880 : 660;
      g.gain.setValueAtTime(0.2, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.14);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + 0.16);
    });
  });
}

// ── Button tap — subtle click ─────────────────────────────────────────────────
export function soundTap() {
  play(c => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(600, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.06);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    o.start(c.currentTime);
    o.stop(c.currentTime + 0.1);
  });
}

// ── Badge earned — magical shimmer ───────────────────────────────────────────
export function soundBadge() {
  play(c => {
    const freqs = [523, 659, 784, 1047, 1319];
    freqs.forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      const t = c.currentTime + i * 0.06;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t);
      o.stop(t + 0.32);
    });
  });
}