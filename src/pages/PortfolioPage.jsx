import { useEffect, useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import useThemeStore from '../store/themeStore';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';

export default function PortfolioPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { darkMode } = useThemeStore();

  document.title = 'Portfolio -- SuperUi';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (sortBy === 'price_asc') params.set('sort', 'price_asc');
      else if (sortBy === 'price_desc') params.set('sort', 'price_desc');
      else if (sortBy === 'name_asc') params.set('sort', 'name_asc');
      else if (sortBy === 'name_desc') params.set('sort', 'name_desc');
      params.set('limit', '100');

      const res = await api.get(`/portfolio?${params.toString()}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [sortBy]);

  const handleSearch = () => {
    loadProducts();
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (priceRange.min !== '' && priceRange.min !== null) {
      const min = Number(priceRange.min);
      result = result.filter(p => (p.actualPrice || 0) >= min);
    }
    if (priceRange.max !== '' && priceRange.max !== null) {
      const max = Number(priceRange.max);
      result = result.filter(p => (p.actualPrice || 0) <= max);
    }

    return result;
  }, [products, searchQuery, priceRange]);

  return (
    <>
      <Seo
        title="Portfolio"
        description="Browse our portfolio of premium digital products -- rediment websites, portfolio templates, and custom web development projects."
        keywords={['portfolio', 'rediment website', 'portfolio template', 'web development', 'digital products', 'custom website']}
        url="/portfolio"
      />
      <div className="portfolio-page-container" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 100px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .portfolio-grid {
          display: grid !important;
          width: 100% !important;
        }
        /* 1500px - 1920px+: 5 cards per row */
        @media (min-width: 1500px) {
          .portfolio-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 24px !important;
          }
          .portfolio-page-container {
            max-width: 1680px !important;
          }
        }
        /* 1199px - 1499px: 4 cards per row */
        @media (min-width: 1199px) and (max-width: 1499.98px) {
          .portfolio-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 22px !important;
          }
          .portfolio-page-container {
            max-width: 1360px !important;
          }
        }
        /* 991px - 1198px: 3 cards per row */
        @media (min-width: 991px) and (max-width: 1198.98px) {
          .portfolio-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
          .portfolio-page-container {
            max-width: 1160px !important;
          }
        }
        /* 567px - 990px: 2 cards per row */
        @media (min-width: 567px) and (max-width: 990.98px) {
          .portfolio-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
        /* 320px - 566px: 1 card per row */
        @media (max-width: 566.98px) {
          .portfolio-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .portfolio-page-container {
            padding: 24px 12px 80px !important;
          }
        }
        @media (max-width: 768px) {
          .portfolio-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .portfolio-controls {
            width: 100% !important;
          }
          .portfolio-controls input[type="text"] {
            min-width: 0 !important;
            flex: 1 !important;
          }
        }
        @media (max-width: 480px) {
          .portfolio-page-container {
            padding: 20px 10px 60px !important;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, color: darkMode ? '#888' : '#555', fontSize: 13 }}>
        <a href="/" style={{ color: darkMode ? '#888' : '#555', textDecoration: 'none' }}>Home</a>
        <span style={{ color: '#FF5000' }}>/</span>
        <span style={{ color: '#FF5000', fontWeight: 700 }}>Portfolio</span>
      </div>

      {/* Header + Controls Row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32, gap: 20, flexWrap: 'wrap'
      }} className="portfolio-header-row">
        {/* Left: Title + Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div className="accent-line" style={{ marginBottom: 8 }} />
            <h1 className="section-title" style={{ color: darkMode ? '#FFF' : '#111', fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1.2 }}>Portfolio</h1>
          </div>
          <span style={{
            background: '#FF5000', color: '#FFF', fontSize: 12, fontWeight: 700,
            padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap'
          }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {/* Right: Search + Filters + Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }} className="portfolio-controls">
          <div style={{ position: 'relative', minWidth: 220, maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#AAA', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadProducts()}
              style={{
                width: '100%', padding: '9px 32px 9px 34px',
                border: '1.5px solid #E5E5E5', borderRadius: 10,
                fontSize: 13, background: darkMode ? '#1E1E1E' : '#F7F7F7',
                color: darkMode ? '#FFF' : '#1A1A1A', outline: 'none',
                transition: 'all 0.2s',
              }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); loadProducts(); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 2 }}>
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10,
              border: '1.5px solid #E5E5E5',
              background: showFilters ? '#FFF4EE' : (darkMode ? '#1E1E1E' : '#F7F7F7'),
              color: showFilters ? '#FF5000' : (darkMode ? '#CCC' : '#444'),
              fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={14} /> Filters <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: 10,
              border: '1.5px solid #E5E5E5',
              background: darkMode ? '#1E1E1E' : '#F7F7F7',
              color: darkMode ? '#CCC' : '#444',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
          </select>
        </div>
      </div>

      {/* Price Filter Panel */}
      {showFilters && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28,
          padding: '16px 20px', background: darkMode ? '#1A1A1A' : '#FAFAFA',
          border: '1px solid #E5E5E5', borderRadius: 14,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#CCC' : '#444' }}>Price Range:</span>
          <input
            type="number"
            placeholder="Min ?"
            value={priceRange.min}
            onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
            style={{
              width: 120, padding: '8px 12px', borderRadius: 8,
              border: '1.5px solid #E5E5E5', fontSize: 13,
              background: darkMode ? '#1E1E1E' : '#FFF',
              color: darkMode ? '#FFF' : '#1A1A1A', outline: 'none',
            }}
          />
          <span style={{ color: '#888' }}>--</span>
          <input
            type="number"
            placeholder="Max ?"
            value={priceRange.max}
            onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
            style={{
              width: 120, padding: '8px 12px', borderRadius: 8,
              border: '1.5px solid #E5E5E5', fontSize: 13,
              background: darkMode ? '#1E1E1E' : '#FFF',
              color: darkMode ? '#FFF' : '#1A1A1A', outline: 'none',
            }}
          />
          <button
            onClick={loadProducts}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: '#FF5000', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Apply
          </button>
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={() => setPriceRange({ min: '', max: '' })}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid #E5E5E5',
                background: 'transparent', color: '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Portfolio Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
          <p style={{ color: '#888', marginTop: 16 }}>Loading portfolio...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="portfolio-grid">
          {filteredProducts.map(p => (
            <div key={p._id} style={{ maxWidth: '100%' }}>
              <ProductCard product={p} onClick={setSelectedProduct} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>??</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No portfolio items found.</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or filters.</p>
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
    </>
  );
}

