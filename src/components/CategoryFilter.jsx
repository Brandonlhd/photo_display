import { useMemo } from 'react';

export default function CategoryFilter({ photos, activeCategory, onCategoryChange }) {
  const categories = useMemo(() => {
    const set = new Set(photos.map((p) => p.category));
    return [...set];
  }, [photos]);

  const albumTitles = useMemo(() => {
    const map = {};
    photos.forEach((p) => {
      if (!map[p.category]) map[p.category] = p.albumTitle;
    });
    return map;
  }, [photos]);

  const items = [
    { key: 'all', label: 'All' },
    ...categories.map((cat) => ({ key: cat, label: albumTitles[cat] || cat })),
    { key: 'favorites', label: '♥ Favorites' },
  ];

  return (
    <div className="container" style={{ paddingTop: 8, paddingBottom: 8 }}>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {items.map(({ key, label }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              style={{
                padding: '10px 22px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '0.04em',
                color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
