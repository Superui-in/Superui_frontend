import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import useCurrencyStore from '../../store/currencyStore';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://placehold.co/600x400/1a1a1a/FF5000?text=No+Image';

export default function ProductCard({ product, onClick, horizontal = false }) {
  const { addItem, isInCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const inCart = isInCart(product._id);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const hasDiscount = product.discountPrice && product.discountPrice < product.actualPrice;
  const displayPrice = hasDiscount ? product.discountPrice : product.actualPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discountPrice / product.actualPrice) * 100)
    : 0;
  const rating = product.rating || 4.9;
  const reviews = product.reviews || 129;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(product);
      toast.success(`"${product.name}" added to cart!`);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(product);
    }
    navigate('/checkout');
  };

  const handlePreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  const Wrapper = onClick ? ({ children }) => (
    <div onClick={() => onClick(product)} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  ) : ({ children }) => (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      {children}
    </Link>
  );

  const isHorizontal = horizontal === true;
  const accentColor = '#FF5000';

  if (isHorizontal) {
    return (
      <Wrapper>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #EAEAEA',
            boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
            transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            fontFamily: "'Inter', system-ui, sans-serif",
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* LEFT: Content */}
          <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <h3
              className="product-card-tooltip"
              data-tip={product.name}
              style={{
                fontWeight: 700, fontSize: 15,
                color: '#111',
                marginBottom: 6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {product.name}
            </h3>
            <p
              className="product-card-tooltip"
              data-tip={product.title || product.description}
              style={{
                color: '#888', fontSize: 12.5, lineHeight: 1.5,
                marginBottom: 12,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.title || product.description}
            </p>

            {product.techStack?.length > 0 && (
              <div className="tags-row" style={{ marginBottom: 10 }}>
                {product.techStack.slice(0, 3).map(t => (
                  <span key={t} className="badge badge-muted" style={{ fontSize: 10, padding: '2px 8px' }}>{t}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: accentColor }}>
                <Star size={13} fill={accentColor} />
                <span style={{ fontWeight: 700, fontSize: 12 }}>{rating}</span>
              </div>
              <span style={{ color: '#BBB', fontSize: 11 }}>({reviews})</span>
              {hasDiscount && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#FFF0E6',
                  color: accentColor,
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 10.5, fontWeight: 700,
                  border: '1px solid #FFE0CC',
                }}>
                  -{discountPct}%
                </span>
              )}
            </div>

            {product.isFeatured && (
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: '#F0FFF4',
                  color: '#166534',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11, fontWeight: 700,
                  border: '1px solid #BBF7D0',
                }}>
                  <Zap size={11} fill="#166534" /> Instant Delivery
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#111', letterSpacing: '-0.5px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatPrice(displayPrice)}
                </div>
                {hasDiscount && (
                  <div style={{ fontSize: 11, color: '#AAA', textDecoration: 'line-through', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatPrice(product.actualPrice)}
                  </div>
                )}
              </div>
              <button
                onClick={handleBuyNow}
                title="Buy now"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: accentColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  boxShadow: '0 4px 14px rgba(255,80,0,0.3)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E04000'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = accentColor; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div style={{ position: 'relative', width: 180, minHeight: 140, overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
            <img
              src={product.imgUrl}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
              loading="eager"
            />
            {product.category && (
              <span style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                color: '#fff', padding: '2px 8px', borderRadius: 20,
                fontSize: 10, fontWeight: 700,
              }}>
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid #EAEAEA',
          boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          fontFamily: "'Inter', system-ui, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          height: 415, // Made shorter as requested (415px instead of 480px)
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* -- Image Area -- */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
          <img
            src={product.imgUrl}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
              transition: 'transform 0.4s ease, filter 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              filter: hovered ? 'blur(2px) brightness(0.7)' : 'blur(0) brightness(1)',
            }}
            loading="eager"
          />

          {/* Category pill (top-left) */}
          {product.category && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              color: '#fff',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11, fontWeight: 700,
            }}>
              {product.category.name}
            </span>
          )}

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0)',
            transition: 'all 0.3s',
          }} />

          {/* Actions overlay */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            display: 'flex', gap: 8,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.28s',
          }}>
            <button
              onClick={handleAddToCart}
              title="Add to cart"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#fff',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: inCart ? '#22C55E' : '#111',
              }}
            >
              {inCart ? <Check size={16} /> : <ShoppingCart size={16} />}
            </button>
            <button
              onClick={handlePreview}
              title="Quick view"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#fff',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: '#111',
              }}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* -- Content -- */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3
            className="product-card-tooltip"
            data-tip={product.name}
            style={{
              fontWeight: 700, fontSize: 14.5,
              color: '#111',
              marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {product.name}
          </h3>
          <p
            className="product-card-tooltip"
            data-tip={product.title || product.description}
            style={{
              color: '#888', fontSize: 12, lineHeight: 1.4,
              marginBottom: 8,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.title || product.description}
          </p>

          {/* Tags row */}
          {product.techStack?.length > 0 && (
            <div className="tags-row" style={{ marginBottom: 8 }}>
              {product.techStack.slice(0, 3).map(t => (
                <span key={t} className="badge badge-muted" style={{ fontSize: 9.5, padding: '2px 8px' }}>{t}</span>
              ))}
            </div>
          )}

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: accentColor }}>
              <Star size={12} fill={accentColor} />
              <span style={{ fontWeight: 700, fontSize: 11.5 }}>{rating}</span>
            </div>
            <span style={{ color: '#BBB', fontSize: 10.5 }}>({reviews})</span>
            {hasDiscount && (
              <span style={{
                marginLeft: 'auto',
                background: '#FFF0E6',
                color: accentColor,
                padding: '2px 6px',
                borderRadius: 5,
                fontSize: 10, fontWeight: 700,
                border: '1px solid #FFE0CC',
              }}>
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Instant delivery badge */}
          {product.isFeatured && (
            <div style={{ marginBottom: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#F0FFF4',
                color: '#166534',
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: 10, fontWeight: 700,
                border: '1px solid #BBF7D0',
              }}>
                <Zap size={10} fill="#166534" /> Instant Delivery
              </span>
            </div>
          )}

          {/* Spacer pushes bottom section down */}
          <div style={{ flex: 1 }} />

          <div style={{ height: 1, background: '#F0F0F0', marginBottom: 10 }} />

          {/* Price + Buy Now button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontWeight: 800, fontSize: 17,
                color: '#111111',
                letterSpacing: '-0.4px',
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {formatPrice(displayPrice)}
              </div>
              {hasDiscount && (
                <div style={{ fontSize: 11, color: '#AAA', textDecoration: 'line-through', marginTop: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatPrice(product.actualPrice)}
                </div>
              )}
            </div>

            <button
              onClick={handleBuyNow}
              title="Buy now"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: accentColor,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '-0.1px',
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: '0 4px 14px rgba(255,80,0,0.25)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E04000'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(255,80,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = accentColor; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,80,0,0.25)'; }}
            >
               Buy Now
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .product-card-tooltip {
          position: relative;
        }
        .product-card-tooltip:hover::after {
          content: attr(data-tip);
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: #1A1A1A;
          color: #FFF;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          pointer-events: none;
          opacity: 0;
          animation: tooltipFadeIn 0.2s ease forwards;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .product-card-tooltip:hover::before {
          content: '';
          position: absolute;
          bottom: calc(100% + 2px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          border: 5px solid transparent;
          border-top-color: #1A1A1A;
          pointer-events: none;
          opacity: 0;
          animation: tooltipFadeIn 0.2s ease forwards;
          z-index: 999;
        }
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </Wrapper>
  );
}
