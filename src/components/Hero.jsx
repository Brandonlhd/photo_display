import { useState, useEffect, useCallback, useRef } from 'react';

export default function Hero({ photos }) {
  const slides = photos.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(goNext, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, goNext]);

  if (!slides.length) return null;

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: '72vh',
        minHeight: 500,
        overflow: 'hidden',
        marginTop: 72,
      }}
    >
      {slides.map((photo, i) => (
        <div
          key={photo.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <img
            src={photo.src}
            alt={photo.albumTitle}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.1) 50%, rgba(10,10,10,0.3) 100%)',
          }} />
        </div>
      ))}

      {/* center text */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontSize: 42,
          fontWeight: 300,
          letterSpacing: '0.15em',
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          {slides[current]?.albumTitle || ''}
        </h1>
        <p style={{
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
        }}>
          {slides[current]?.date || ''}
        </p>
      </div>

      {/* arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: 32,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: 32,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* dots */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
              transition: 'var(--transition)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
