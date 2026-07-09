import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qymebheyxaoqwybqprax.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bWViaGV5eGFvcXd5YnFwcmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDQ4NTEsImV4cCI6MjA5MTkyMDg1MX0.FK7HQcMaMlghpMpWQqOlToTzYr910T8f30kCMikdDMQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: { params: { eventsPerSecond: 1 } },
  global: { fetch: (...args) => fetch(...args) },
});

// ── Auth helpers ─────────────────────────────────────────────────────────────
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  });
  return { data, error };
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}
export async function signOut() { await supabase.auth.signOut(); }
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Profile helpers ───────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}
export async function upsertProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').upsert({ id: userId, ...updates });
  return { data, error };
}

// ── Progress helpers ──────────────────────────────────────────────────────────
export async function getLessonProgress(userId) {
  const { data } = await supabase.from('progress').select('*').eq('user_id', userId);
  return data || [];
}
export async function saveLessonProgress(userId, lessonId, progress, completed) {
  const { data, error } = await supabase.from('progress').upsert({
    user_id: userId, lesson_id: lessonId,
    lesson_progress: progress, completed,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' });
  return { data, error };
}

// ── Quiz score helpers ────────────────────────────────────────────────────────
export async function saveQuizScore(userId, score, total, topic) {
  const { data, error } = await supabase.from('quiz_scores')
    .insert({ user_id: userId, score, total, topic });
  return { data, error };
}
export async function getQuizScores(userId) {
  const { data } = await supabase.from('quiz_scores')
    .select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(10);
  return data || [];
}

// ── Streak helper — NOW only called after real activity ───────────────────────
// Returns { newStreak, streakIncreased } so callers can show popup
export async function recordActivity(userId) {
  const profile = await getProfile(userId);
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!profile) {
    await upsertProfile(userId, { streak: 1, last_active: today, streak_freezes: 1 });
    return { newStreak: 1, streakIncreased: true, freezeUsed: false };
  }

  const last     = profile.last_active;
  const freezes  = profile.streak_freezes ?? 1; // null = existing user before feature, treat as 1

  // Already recorded activity today — don't increment again
  if (last === today) {
    return { newStreak: profile.streak || 1, streakIncreased: false, freezeUsed: false };
  }

  let newStreak;
  let freezeUsed = false;

  if (last === yesterday) {
    // Consecutive day — extend streak normally
    newStreak = (profile.streak || 0) + 1;
  } else if (last) {
    // Missed at least one day
    const daysMissed = Math.floor((new Date(today) - new Date(last)) / 86400000) - 1;
    if (daysMissed <= 1 && freezes > 0) {
      // Missed exactly 1 day and has a freeze — protect the streak!
      newStreak  = (profile.streak || 0) + 1;
      freezeUsed = true;
      await upsertProfile(userId, {
        streak: newStreak,
        last_active: today,
        streak_freezes: freezes - 1,
      });
      return { newStreak, streakIncreased: true, freezeUsed: true };
    } else {
      // Missed too many days or no freeze — reset
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await upsertProfile(userId, { streak: newStreak, last_active: today });
  return { newStreak, streakIncreased: true, freezeUsed };
}

// Buy a streak freeze with XP (costs 50 XP)
export async function buyStreakFreeze(userId) {
  const profile = await getProfile(userId);
  if (!profile) return { success: false, reason: 'No profile' };
  if ((profile.total_xp || 0) < 50) return { success: false, reason: 'Not enough XP' };
  await upsertProfile(userId, {
    total_xp: (profile.total_xp || 0) - 50,
    streak_freezes: (profile.streak_freezes || 0) + 1,
  });
  return { success: true };
}

// Keep old name as alias so nothing else breaks
export async function updateStreak(userId) {
  const { newStreak } = await recordActivity(userId);
  return newStreak;
}