import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile, upsertProfile, updateStreak } from '../utils/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  if (_event === 'TOKEN_REFRESHED' || _event === 'INITIAL_SESSION') return;
  if (_event === 'SIGNED_OUT') {
    setUser(null); setProfile(null); setLoading(false);
  }
  // Don't do anything else — SIGNED_IN is already handled by getSession above
});
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
  // Don't show loading spinner if we already have a profile (e.g. tab refocus)
  if (!profile) setLoading(true);
  let p = await getProfile(userId);
  if (!p) {
    await upsertProfile(userId, { streak: 0, words_learned: 0 });
    p = await getProfile(userId);
  }
  const streak = await updateStreak(userId);
  setProfile(prev => ({ ...p, streak }));
  setLoading(false);
}

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
