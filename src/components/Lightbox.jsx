import { useEffect, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function Lightbox({ photo, onClose }) {
  const handleBgClick = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!photo) return null;

  return (
    <div
      onClick={handleBgClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease',
          zIndex: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Zoomable image area */}
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={4}
        doubleClick={{ mode: 'toggle', step: 0.8 }}
        wheel={{ step: 0.15 }}
      >
        {({ zoomIn, zoomOut, resetTransform, scale }) => (
          <>
            <div onClick={(e) => e.stopPropagation()}>
              <TransformComponent
                wrapperStyle={{
                  maxWidth: '90vw',
                  maxHeight: '88vh',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  cursor: scale > 1 ? 'grab' : 'zoom-in',
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.albumTitle}
                  draggable={false}
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '88vh',
                    objectFit: 'contain',
                    userSelect: 'none',
                    display: 'block',
                  }}
                />
              </TransformComponent>
            </div>

            {/* Zoom controls */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 28,
                right: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                zIndex: 2,
              }}
            >
              <ZoomBtn onClick={() => zoomIn()} label="Zoom in" icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              } />
              <ZoomBtn onClick={() => zoomOut()} label="Zoom out" icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              } />
              {scale > 1 && (
                <ZoomBtn onClick={() => resetTransform()} label="Reset zoom" icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                } />
              )}
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>
          {photo.albumTitle}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          {photo.date}
        </div>
      </div>
    </div>
  );
}

function ZoomBtn({ onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
    >
      {icon}
    </button>
  );
}
