import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import PhotoWall from './components/PhotoWall';
import photos from './data/photos.json';
import Lightbox from './components/Lightbox';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('home');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const heroPhotos = useMemo(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

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

  return (
    <>
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />
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
