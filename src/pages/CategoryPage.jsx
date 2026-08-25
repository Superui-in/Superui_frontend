import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import useThemeStore from '../store/themeStore';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const { darkMode } = useThemeStore();
  const { data: categoryBanner } = useSiteContent('categoryBanner');
  const { data: categoryEmpty } = useSiteContent('categoryEmpty');

  const isAllProducts = slug === 'all';

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearchQuery(searchParams.get('q') || '');
    const endpoint = isAllProducts
      ? api.get('/products').then(r => ({ category: { name: 'All Products' }, products: r.data }))
      : api.get(`/categories/${slug}/products`).then(r => r.data);

    endpoint
      .then(d => {
        setData(d);
        document.title = `${d.category?.name || 'Products'} -- SuperUi`;
      })
      .catch(() => setError('Category not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredProducts = useMemo(() => {
    if (!data?.products?.length || !searchQuery.trim()) return data?.products || [];
    const q = searchQuery.toLowerCase().trim();
    return data.products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.techStack || []).some(t => t.toLowerCase().includes(q))
    );
  }, [data, searchQuery]);

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (error)   return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>{error}</div>;

  return (
    <>
      <Seo
        title={isAllProducts ? 'All Digital Products' : `${data?.category?.name || 'Products'}`}
        description={`Browse ${isAllProducts ? 'all premium digital products' : data?.category?.name + ' digital products'} -- rediment websites, portfolio templates, source code, and more. Pay once, download forever.`}
        keywords={['digital products', 'website templates', 'source code', 'portfolio', 'rediment website', 'buy digital products']}
        url={`/category/${slug}`}
      />
      <div className="category-page-container" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 100px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .category-product-grid {
          display: grid !important;
          width: 100% !important;
        }
        /* 1500px - 1920px+: 5 cards per row */
        @media (min-width: 1500px) {
          .category-product-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 24px !important;
          }
          .category-page-container {
            max-width: 1680px !important;
          }
        }
        /* 1199px - 1499px: 4 cards per row */
        @media (min-width: 1199px) and (max-width: 1499.98px) {
          .category-product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 22px !important;
          }
          .category-page-container {
            max-width: 1360px !important;
          }
        }
        /* 991px - 1198px: 3 cards per row */
        @media (min-width: 991px) and (max-width: 1198.98px) {
          .category-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
          .category-page-container {
            max-width: 1160px !important;
          }
        }
        /* 567px - 990px: 2 cards per row */
        @media (min-width: 567px) and (max-width: 990.98px) {
          .category-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
        /* 320px - 566px: 1 card per row */
        @media (max-width: 566.98px) {
          .category-product-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .category-page-container {
            padding: 24px 12px 80px !important;
          }
        }
        @media (max-width: 768px) {
          .category-page-container {
            padding: 28px 16px 80px !important;
          }
          .category-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .all-products-search {
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .category-page-container {
            padding: 20px 10px 60px !important;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, color: darkMode ? '#888' : '#555', fontSize: 13 }}>
        <Link to="/" style={{ color: darkMode ? '#888' : '#555', textDecoration: 'none' }}>{categoryBanner?.breadcrumbHome || 'Home'}</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#FF5000', fontWeight: 700 }}>{data.category?.name}</span>
      </div>

      {/* Section Header with Search */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }} className="category-header-row">
        <div>
          <div className="accent-line" />
          <h1 className="section-title" style={{ color: darkMode ? '#FFF' : '#111', fontWeight: 900 }}>{data.category?.name}</h1>
          <p style={{ color: darkMode ? '#888' : '#666', fontSize: 14, marginTop: 8 }}>
            {isAllProducts
              ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} available`
              : `${data.products?.length || 0} product${data.products?.length !== 1 ? 's' : ''} available`
            }
          </p>
        </div>

        {isAllProducts && (
          <div style={{ position: 'relative', minWidth: 280, maxWidth: 400, width: '100%' }} className="all-products-search">
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '11px 38px 11px 40px',
                border: '1.5px solid #E5E5E5', borderRadius: 12,
                fontSize: 14, background: darkMode ? '#1E1E1E' : '#F7F7F7',
                color: darkMode ? '#FFF' : '#1A1A1A', outline: 'none',
                transition: 'all 0.2s', fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 4, borderRadius: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FF5000'; e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'none'; }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="category-product-grid">
          {filteredProducts.map(p => (
            <div key={p._id} className="product-card-wrapper" style={{ maxWidth: '100%' }}>
              <ProductCard product={p} onClick={setSelectedProduct} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>??</div>
          <p style={{ color: '#555', fontSize: 15 }}>{searchQuery ? 'No products match your search.' : (categoryEmpty?.title || 'No products in this category yet.')}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary"
              style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <X size={14} /> Clear Search
            </button>
          )}
          {!searchQuery && categoryEmpty?.subtitle && <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>{categoryEmpty.subtitle}</p>}
          {!searchQuery && (
            <Link to={categoryEmpty?.buttonLink || '/'} className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              {categoryEmpty?.buttonText || 'Back to Home'}
            </Link>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
    </>
  );
}

