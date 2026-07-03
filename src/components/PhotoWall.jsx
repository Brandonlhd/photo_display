import { useMemo } from 'react';
import PhotoCard from './PhotoCard';
import { useFavorites } from '../context/FavoritesContext';

export default function PhotoWall({ photos, activeCategory, onPhotoClick }) {
  const { isFavorite } = useFavorites();

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return photos;
    if (activeCategory === 'favorites') return photos.filter((p) => isFavorite(p.id));
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory, isFavorite]);

  if (!filtered.length) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, letterSpacing: '0.06em' }}>
          No photos found
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{
        columns: 3,
        columnGap: 20,
      }}>
        {filtered.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onPhotoClick={onPhotoClick} />
        ))}
      </div>
    </div>
  );
}
