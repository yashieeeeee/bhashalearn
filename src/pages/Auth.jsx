import { useState } from 'react';
import { signIn, signUp } from '../utils/supabase';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handle() {
    setError(''); setSuccess(''); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else setSuccess('Account created! Check your email to confirm, then log in.');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#1A1208' }}>
            Bhasha<span style={{ color: '#E8611A' }}>Learn</span>
          </div>
          <div style={{ fontSize: 14, color: '#7A6552', marginTop: 6 }}>Hindi → Bhojpuri · Learn your roots 🙏</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(26,18,8,0.1)', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 32px rgba(26,18,8,0.08)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#F0E8DC', borderRadius: 10, padding: 4, marginBottom: '1.75rem' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: mode === m ? '#1A1208' : 'transparent', color: mode === m ? '#FAF6F0' : '#7A6552' }}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#7A6552', display: 'block', marginBottom: 6 }}>Your name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Kumar"
                  style={{ width: '100%', border: '0.5px solid rgba(26,18,8,0.15)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#1A1208', outline: 'none', background: '#FAF6F0' }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#7A6552', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ width: '100%', border: '0.5px solid rgba(26,18,8,0.15)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#1A1208', outline: 'none', background: '#FAF6F0' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#7A6552', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                onKeyDown={e => e.key === 'Enter' && handle()}
                style={{ width: '100%', border: '0.5px solid rgba(26,18,8,0.15)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#1A1208', outline: 'none', background: '#FAF6F0' }} />
            </div>
          </div>

          {error && <div style={{ marginTop: 12, padding: '10px 13px', background: '#FDF0E8', borderRadius: 8, fontSize: 13, color: '#E8611A' }}>{error}</div>}
          {success && <div style={{ marginTop: 12, padding: '10px 13px', background: '#E0F2F2', borderRadius: 8, fontSize: 13, color: '#0D6E6E' }}>{success}</div>}

          <button onClick={handle} disabled={loading || !email || !password}
            style={{ marginTop: 20, width: '100%', background: email && password && !loading ? '#1A1208' : '#F0E8DC', color: email && password && !loading ? '#FAF6F0' : '#7A6552', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 500, cursor: email && password && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in →' : 'Create account →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#7A6552', marginTop: '1.5rem' }}>
          Your progress is saved securely with Supabase 🔒
        </p>
      </div>
    </div>
  );
}
