import { useRef, useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';

export default function PhotoCard({ photo, onPhotoClick }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const fav = isFavorite(photo.id);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <div
     ref={ref}
      onClick={() => onPhotoClick?.(photo)}
     onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        marginBottom: 20,
        background: 'var(--bg-card)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        cursor: 'pointer',
        breakInside: 'avoid',
      }}
    >
      <img
        src={photo.src}
        alt={photo.albumTitle}
        loading="lazy"
        style={{
          width: '100%',
          display: 'block',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }}
      />

      {/* hover overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '40px 20px 18px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#fff',
          marginBottom: 4,
          letterSpacing: '0.02em',
        }}>
          {photo.albumTitle}
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.04em',
        }}>
          {photo.date} &middot; {photo.filename}
        </div>
      </div>

      {/* favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(photo.id);
        }}
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: hovered || fav ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.2s ease',
          transform: fav ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  );
}
