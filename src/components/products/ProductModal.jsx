import { useState, useEffect } from 'react';
import { X, ShoppingCart, Check, ExternalLink, ChevronRight } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useCurrencyStore from '../../store/currencyStore';
import useThemeStore from '../../store/themeStore';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function ProductModal({ product, onClose }) {
  const { addItem, isInCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const inCart = product ? isInCart(product._id) : false;
  const { data: productExtras } = useSiteContent('productPageExtras');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!product) return null;

  const allImages = [product.imgUrl, ...(product.galleryImages || [])];
  const [activeImg, setActiveImg] = useState(0);
  const handleBuyNow = () => {
    onClose();
    setTimeout(() => {
      window.location.href = `/checkout?direct=${product._id}`;
    }, 100);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF', border: '1px solid #E5E5E5',
        borderRadius: 20, maxWidth: 1100, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: '#F5F5F5', border: '1px solid #E5E5E5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#666',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, padding: '32px 32px 32px 32px' }}>
          {/* Images */}
          <div>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: '#F5F5F5',
              aspectRatio: '16/10', marginBottom: 16,
              border: '1px solid #EAEAEA',
            }}>
              <img
                src={allImages[activeImg]}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x500/1a1a1a/FF5000?text=No+Preview'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    style={{
                      width: 70, height: 48, borderRadius: 8, overflow: 'hidden',
                      border: activeImg === idx ? '2px solid #FF5000' : '1px solid #E5E5E5',
                      background: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="" onError={(e) => { e.currentTarget.src = 'https://placehold.co/160x108/1a1a1a/FF5000?text=No+Image'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <span className="badge badge-muted" style={{ marginBottom: 12 }}>
                {product.category.name}
              </span>
            )}

            <h1 style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 800, fontSize: 'clamp(22px, 2.5vw, 30px)',
              color: '#111',
              letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.2,
            }}>
              {product.name}
            </h1>

            <p style={{ color: '#666', fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
              {product.title || product.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: 24 }}>
              {product.discountPrice && product.discountPrice < product.actualPrice ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="price-discount" style={{ fontSize: 28, fontWeight: 900, color: '#FF5000' }}>
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="price-actual" style={{ fontSize: 18, color: '#888', textDecoration: 'line-through' }}>
                    {formatPrice(product.actualPrice)}
                  </span>
                  <span className="badge badge-primary">
                    {Math.round((1 - product.discountPrice / product.actualPrice) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <span className="price-discount" style={{ fontSize: 28, fontWeight: 900, color: '#FF5000' }}>
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>

            {/* Tech Stack */}
            {product.techStack?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: '#666', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Tech Stack</p>
                <div className="tags-row">
                  {product.techStack.map(t => (
                    <span key={t} className="badge badge-muted">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <button
                onClick={handleBuyNow}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 800, justifyContent: 'center' }}
              >
                Direct Buy Now ?
              </button>

              <button
                id={`modal-add-to-cart-${product._id}`}
                className={inCart ? 'btn-ghost' : 'btn-outline'}
                style={{ width: '100%', padding: '13px 24px', fontSize: 14.5, fontWeight: 700, justifyContent: 'center' }}
                onClick={() => {
                  if (!inCart) { addItem(product); toast.success('Added to cart!'); }
                }}
              >
                {inCart ? <><Check size={16} /> Added in Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
              </button>

              {product.websitePreviewUrl && (
                <a
                  href={product.websitePreviewUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-ghost" style={{ width: '100%', textAlign: 'center', padding: '12px 24px', fontSize: 14, justifyContent: 'center' }}
                >
                  <ExternalLink size={14} /> Live Preview
                </a>
              )}
            </div>

            {/* What you get */}
            <div style={{
              background: '#F5F5F5', border: '1px solid #E5E5E5',
              borderRadius: 12, padding: '16px 20px',
            }}>
              <p style={{ color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                {productExtras?.whatYouGetTitle || 'What You Get'}
              </p>
              {(productExtras?.whatYouGetItems || [
                'Instant email delivery after payment',
                'Full source code',
                'Documentation included',
                '1-time purchase, lifetime access'
              ]).map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: '#333', fontSize: 13 }}>
                  <Check size={14} color="#FF5000" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

