import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye, ExternalLink, ChevronRight } from 'lucide-react';
import api from '../api/axiosInstance';
import useCartStore from '../store/cartStore';
import useCurrencyStore from '../store/currencyStore';
import useThemeStore from '../store/themeStore';
import toast from 'react-hot-toast';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem, isInCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const navigate = useNavigate();
  const inCart = product ? isInCart(product._id) : false;
  const { data: productExtras } = useSiteContent('productPageExtras');
  const { data: productPage } = useSiteContent('productPage');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        document.title = `${r.data.name} -- SuperUi`;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const seoUrl = product ? `/product/${product._id}` : `/product/${id}`;

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Product not found.</div>;

  const allImages = [product.imgUrl, ...(product.galleryImages || [])];

  const handleImgError = (e) => {
    e.currentTarget.src = 'https://placehold.co/800x500/1a1a1a/FF5000?text=No+Preview';
  };

  const handleBuyNow = () => {
    navigate('/checkout', { state: { directProduct: { ...product, quantity: 1 } } });
  };

  document.title = `${product.name} -- SuperUi`;

  return (
    <>
      {product && (
        <Seo
          title={product.name}
          description={product.description || `Buy ${product.name} -- premium digital product with instant email delivery.`}
          keywords={[product.category?.name, product.name, 'digital product', 'source code', 'website template'].filter(Boolean)}
          url={seoUrl}
          image={product.imgUrl}
          type="product"
        />
      )}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 60px', minHeight: '90vh', display: 'flex', flexDirection: 'column' }} className="product-page-container">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, color: '#555', fontSize: 13, flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>{productPage?.breadcrumbHome || 'Home'}</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`} style={{ color: '#555', textDecoration: 'none' }}>{product.category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span style={{ color: '#FF5000' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="product-layout">
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
              onError={handleImgError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="eager"
            />
          </div>

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className="product-thumb-btn"
                  style={{
                    width: 70, height: 48, borderRadius: 8, overflow: 'hidden',
                    border: activeImg === idx ? '2px solid #FF5000' : '1px solid #E5E5E5',
                    background: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <img src={img} alt="" onError={handleImgError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            fontWeight: 800, fontSize: 'clamp(24px, 3vw, 34px)',
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
              <p style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Tech Stack</p>
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
              id={`add-to-cart-${product._id}`}
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
            background: '#FFFFFF', border: '1px solid #E5E5E5',
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

      {/* -- Description -- */}
      <div style={{ marginTop: 60, maxWidth: 800 }}>
        <div className="accent-line" />
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 22, color: '#F0F0F0', marginBottom: 20 }}>{productPage?.aboutTitle || 'About this product'}</h2>
        <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{product.description}</p>
      </div>

      <style>{`
        .product-page-container {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        @media (max-width: 900px) {
          .product-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .product-page-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
        @media (max-width: 768px) {
          .product-layout {
            gap: 20px !important;
          }
          .product-thumb-btn {
            width: 56px !important;
            height: 40px !important;
          }
          .product-page-container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .product-layout {
            gap: 16px !important;
          }
          .product-thumb-btn {
            width: 48px !important;
            height: 34px !important;
          }
          .product-page-container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

