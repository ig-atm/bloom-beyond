// ================================================================
//  BEYOND BLOOM — Admin Login Page
// ================================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Loader } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
        top: '10%', left: '10%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
        bottom: '10%', right: '15%', pointerEvents: 'none'
      }} />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">Beyond <span>Bloom</span></div>
        <div className="login-sub">CRM Admin Portal · Private Access</div>

        <div className="gold-rule" style={{ marginBottom: 32 }} />

        {error && (
          <div className="toast toast-error" style={{ position: 'static', marginBottom: 20, animation: 'none' }}>
            <Lock size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@beyondbloomdubai.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--muted)', padding: 0
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', marginTop: 8 }}
          >
            {loading ? <Loader size={16} className="spin" style={{ animation: 'spin 0.7s linear infinite' }} /> : <Lock size={16} />}
            {loading ? 'Authenticating…' : 'Access Portal'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 24 }}>
          Beyond Bloom Internal · Authorised Personnel Only
        </p>
      </div>
    </div>
  );
}
