import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import PhotoWall from './components/PhotoWall';
import Lightbox from './components/Lightbox';
import LoginPage from './components/LoginPage';
import { fetchPhotos } from './api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('gallery_token'));
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const heroPhotos = useMemo(() => {
    if (!photos.length) return [];
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [photos]);

  // Fetch photos when authenticated
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchPhotos(token)
      .then(setPhotos)
      .catch(() => {
        // Token expired, logout
        handleLogout();
      })
      .finally(() => setLoading(false));
  }, [token]);

  function handleLogin(t) {
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('gallery_token');
    setToken(null);
    setPhotos([]);
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const handleNavigate = (section) => {
    setActiveSection(section);
    if (section === 'home') {
      setActiveCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'collections') {
      setActiveCategory('all');
      document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'favorites') {
      setActiveCategory('favorites');
      document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-primary)',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} onLogout={handleLogout} />
      <Hero photos={heroPhotos} />
      <div id="gallery-section" style={{ padding: '60px 0 100px' }}>
        <div style={{ marginBottom: 40 }}>
          <CategoryFilter
            photos={photos}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        <PhotoWall photos={photos} activeCategory={activeCategory} onPhotoClick={setLightboxPhoto} />
      </div>
      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </>
  );
}
