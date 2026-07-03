import { useState, useEffect } from 'react';

const NAV_LINKS = ['Home', 'Collections', 'Favorites'];

export default function Navbar({ onNavigate, activeSection, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'var(--bg-glass)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'var(--transition)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: 'var(--text-primary)',
        }}>
          GALLERY
        </div>

        <div style={{ display: 'flex', gap: 36 }}>
          {NAV_LINKS.map((link) => {
            const key = link.toLowerCase();
            const isActive = activeSection === key;
            return (
              <button
                key={link}
                onClick={() => onNavigate(key)}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '0.08em',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  position: 'relative',
                  padding: '4px 0',
                  transition: 'color var(--transition)',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {link}
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 1.5,
                  background: 'var(--accent)',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform var(--transition)',
                }} />
              </button>
            );
          })}
          <button
            onClick={onLogout}
            style={{
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              padding: '4px 0',
              transition: 'color var(--transition)',
              textTransform: 'uppercase',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
