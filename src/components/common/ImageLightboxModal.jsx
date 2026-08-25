import { X, ZoomIn, ExternalLink, ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ImageLightboxModal({ isOpen, imageUrl, title, onClose }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          color: '#1A1A1A'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ZoomIn size={18} color="#FF5000" />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16 }}>
            {title || 'Image Preview'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ExternalLink size={14} /> Open Original
          </a>

          <button
            onClick={onClose}
            style={{
              background: '#F5F5F5',
              border: '1px solid #E5E5E5',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1A1A1A',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF5000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F5'; }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image container */}
      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #E5E5E5',
          background: '#FFFFFF',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          minWidth: 320,
          minHeight: 220,
          padding: hasError ? 32 : 0
        }}
        onClick={e => e.stopPropagation()}
      >
        {hasError ? (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <ImageOff size={44} color="#FF5000" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: '#1A1A1A', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              Unable to load image
            </div>
            <div style={{ fontSize: 12, maxWidth: 360, color: '#666' }}>
              The URL might be broken, expired, or blocking external embeds. You can try clicking 'Open Original' above.
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={title || 'Full preview'}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block'
            }}
            onError={() => setHasError(true)}
          />
        )}
      </div>

      <div style={{ marginTop: 12, color: '#666', fontSize: 12 }}>
        Click anywhere outside or press <kbd style={{ background: '#F5F5F5', padding: '2px 6px', borderRadius: 4, color: '#666' }}>Esc</kbd> to close
      </div>
    </div>
  );
}

