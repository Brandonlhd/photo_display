import { useState } from 'react';
import { login } from '../api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = await login(username, password);
      localStorage.setItem('gallery_token', token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 28, fontWeight: 600, letterSpacing: '0.25em',
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            GALLERY
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            私人相册 · 登录后查看
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', letterSpacing: '0.06em',
              marginBottom: 8, textTransform: 'uppercase',
            }}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
              placeholder="请输入用户名"
              style={{
                width: '100%', height: 46, padding: '0 16px', fontSize: 14,
                color: 'var(--text-primary)', background: 'var(--bg-card)',
                border: `1px solid ${error ? '#e05050' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', outline: 'none',
                transition: 'border-color 0.2s ease', letterSpacing: '0.02em',
              }}
              onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', letterSpacing: '0.06em',
              marginBottom: 8, textTransform: 'uppercase',
            }}>密码</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                placeholder="请输入密码"
                style={{
                  width: '100%', height: 46, padding: '0 44px 0 16px', fontSize: 14,
                  color: 'var(--text-primary)', background: 'var(--bg-card)',
                  border: `1px solid ${error ? '#e05050' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', outline: 'none',
                  transition: 'border-color 0.2s ease', letterSpacing: '0.02em',
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', padding: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 13, color: '#e05050', marginBottom: 16, letterSpacing: '0.02em' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 46, marginTop: 8, fontSize: 14, fontWeight: 500,
              letterSpacing: '0.08em', color: 'var(--bg-primary)', background: 'var(--accent)',
              borderRadius: 'var(--radius)', transition: 'opacity 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  );
}
