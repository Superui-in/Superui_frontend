import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Download, Star, Zap, X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import useThemeStore from '../store/themeStore';
import useCurrencyStore from '../store/currencyStore';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';
import RadarHeroBg from '../components/common/RadarHeroBg';
import { getSocket } from '../hooks/useSocket';


// Returns responsive card count: mobile=4, 768-991=6, 992-1365=8, 1366+=10
function useResponsiveLimit() {
  const getLimit = useCallback(() => {
    const w = window.innerWidth;
    if (w < 768)  return 4;
    if (w < 992)  return 6;
    if (w < 1366) return 8;
    return 10;
  }, []);

  const [limit, setLimit] = useState(getLimit);

  useEffect(() => {
    const handler = () => setLimit(getLimit());
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, [getLimit]);

  return limit;
}

function FaqItem({ question, answer, darkMode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: darkMode ? '#1A1A1A' : '#FAFAFA',
      border: `1px solid ${darkMode ? '#2A2A2A' : '#EEEEEE'}`,
      borderRadius: 14, overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '18px 22px', background: 'transparent', border: 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', color: darkMode ? '#FFF' : '#111',
          fontSize: 15, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif",
          textAlign: 'left', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#242424' : '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span>{question}</span>
        <span style={{
          fontSize: 20, fontWeight: 300, color: '#FF5000', transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s', flexShrink: 0, marginLeft: 16,
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: '0 22px 18px', color: darkMode ? '#AAAAAA' : '#666666', fontSize: 14, lineHeight: 1.7,
          borderTop: `1px solid ${darkMode ? '#2A2A2A' : '#EEEEEE'}`, paddingTop: 14,
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [categories, setCategories]   = useState([]);
  const [featured, setFeatured]       = useState([]);
  const [portfolio, setPortfolio]     = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [lastOrder, setLastOrder]     = useState(null);
  const [showNotif, setShowNotif]     = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [catProducts, setCatProducts] = useState({});
  const [catLoading, setCatLoading]   = useState(false);
  const [showAll, setShowAll]         = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const responsiveLimit = useResponsiveLimit(); // 4 / 6 / 8 / 10 based on viewport
  const shelfRef = useRef(null);
  const catScrollRef = useRef(null);
  const [catScrollLeft, setCatScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { darkMode } = useThemeStore();
  const textMain = darkMode ? '#FFFFFF' : '#111827';
  const textMuted = darkMode ? '#9CA3AF' : '#4B5563';
  const border = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const { formatPrice } = useCurrencyStore();
  const { data: hero } = useSiteContent('hero');
  const { data: trustBadges } = useSiteContent('trustBadges');
  const { data: featuredSection } = useSiteContent('featuredSection');
  const { data: popularTagsData } = useSiteContent('popularTags');
  const popularTags = popularTagsData?.tags || ['Admin Dashboards', 'UI Components', 'Ready-Made Websites', 'SaaS Templates', 'E-commerce'];

  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    document.title = 'SuperUi -- Digital Product Selling Store | Premium Templates & Source Code';
    Promise.all([
      api.get('/public/stats'),
      api.get('/categories'),
      api.get('/products?featured=true&limit=8'),
      api.get('/products?limit=8'),
      api.get('/portfolio?limit=8'),
    ]).then(([statsRes, catRes, featRes, prodRes, portRes]) => {
      const stats = Array.isArray(statsRes.data?.stats) ? statsRes.data.stats : [];
      setStatsData(stats);
      setStatsLoading(false);

      const rawCats = Array.isArray(catRes.data) ? catRes.data : [];
      const webCatIdx = rawCats.findIndex(c =>
        c.name?.toLowerCase().includes('website') ||
        c.slug?.toLowerCase().includes('website') ||
        c.name?.toLowerCase().includes('web') ||
        c.slug?.toLowerCase().includes('web')
      );
      let orderedCats = [...rawCats];
      if (webCatIdx > 0) {
        const [webCat] = orderedCats.splice(webCatIdx, 1);
        orderedCats.unshift(webCat);
      }
      const cats = orderedCats.slice(0, 10);
      setCategories(cats);
      const featList = Array.isArray(featRes.data) ? featRes.data : [];
      setFeatured(featList);
      const portList = Array.isArray(portRes.data) ? portRes.data : [];
      setPortfolio(portList);
      if (cats.length > 0) setActiveCategory(cats[0]);
    }).catch(() => {}).finally(() => {
      setStatsLoading(false);
      setLoading(false);
    });

    try {
      const saved = localStorage.getItem('last_successful_order');
      if (saved) {
        const order = JSON.parse(saved);
        if (order.timestamp && Date.now() - order.timestamp < 86400000) {
          setLastOrder(order);
          setShowNotif(true);
        } else {
          localStorage.removeItem('last_successful_order');
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    const cid = activeCategory._id;
    setShowAll(false); // reset to responsive limit when switching category
    if (catProducts[cid]) return;
    setCatLoading(true);
    api.get(`/products?category=${cid}&limit=10`)
      .then(res => setCatProducts(prev => ({ ...prev, [cid]: res.data })))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, [activeCategory]);

  const dismissNotif = () => {
    setShowNotif(false);
    try { localStorage.removeItem('last_successful_order'); } catch {}
  };

  const handleSearch = () => {
    if (searchQuery.trim()) navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
    else navigate('/category/all');
  };

  useEffect(() => {
    updateCatScrollState();
    const el = catScrollRef.current;
    if (!el) return;
    const onScroll = () => updateCatScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [categories]);

  const scrollShelf = (dir) => {
    if (shelfRef.current) shelfRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const scrollCategories = (dir) => {
    if (catScrollRef.current) {
      const scrollAmount = 260;
      catScrollRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const updateCatScrollState = () => {
    if (catScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = catScrollRef.current;
      setCatScrollLeft(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const badgeText = hero?.badge || ' Instant email delivery';
  const heroSubtitle = hero?.subtitle || 'Source code, templates, tools and more \u2014 pay once, download forever. Verified payment, instant email delivery.';
  const brandName = hero?.brandName || 'SuperUi';
  const iconMap = { Shield, Download, Star, Zap };

  const activeProd = activeCategory ? (catProducts[activeCategory._id] || []) : [];
  const displayedProd = showAll ? activeProd : activeProd.slice(0, responsiveLimit);

  return (
    <>
      <Seo
        title="Premium Digital Products, Rediment Websites & Portfolio Templates"
        description="Buy premium digital products -- rediment websites, portfolio templates, source code, and tools. Pay once, download forever. Verified payment, instant email delivery."
        keywords={['digital products', 'rediment website', 'portfolio template', 'source code', 'website templates', 'digital downloads', 'buy website code', 'premium templates']}
        url="/"
      />
      <div style={{ background: darkMode ? '#0F0F0F' : '#FFFFFF', color: darkMode ? '#F0F0F0' : '#111111', transition: 'background 0.25s' }}>

      {/* ------ Hero ------ */}
      <section className="hero-section" style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        padding: '90px 24px 72px',
        background: darkMode ? '#0F0F0F' : '#FFFFFF',
        minHeight: '70vh',
      }}>
        <RadarHeroBg darkMode={darkMode} />

        <div style={{ position: 'relative', maxWidth: 840, margin: '0 auto', textAlign: 'center', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 18px',
            background: darkMode ? 'rgba(255,80,0,0.12)' : '#FFF0E6',
            border: darkMode ? '1px solid rgba(255,80,0,0.3)' : '1px solid #FFE0CC',
            borderRadius: 100, marginBottom: 28,
            fontSize: 13, fontWeight: 700, color: '#FF5000', letterSpacing: '0.2px',
          }}>
            <span style={{ fontSize: 14 }}>✦</span>⚡ {badgeText}<span style={{ fontSize: 14, opacity: 0.7 }}>›</span>
          </div>

          <h1 style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 'clamp(38px, 5.8vw, 70px)',
            fontWeight: 900, color: darkMode ? '#FFFFFF' : '#111111',
            lineHeight: 1.1, letterSpacing: '-2.5px', marginBottom: 22,
          }}>
            Build 10x faster with{' '}<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF5000 0%, #FF7733 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {brandName}
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 17px)', color: darkMode ? '#AAAAAA' : '#666666',
            lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {heroSubtitle}
          </p>

          <div style={{
            display: 'flex', alignItems: 'center',
            background: darkMode ? '#1A1A1A' : '#FFFFFF',
            border: darkMode ? '1.5px solid #333333' : '1.5px solid #E0E0E0',
            borderRadius: 14, padding: '6px 6px 6px 18px',
            maxWidth: 560, margin: '0 auto 20px',
            boxShadow: darkMode ? '0 6px 24px rgba(0,0,0,0.4)' : '0 6px 24px rgba(0,0,0,0.06)', gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              id="hero-search"
              type="text"
              placeholder="Search templates (e.g. Dashboard, SaaS, Portfolio...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 14.5, color: darkMode ? '#FFF' : '#222', fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: '#FF5000', color: 'white', border: 'none', borderRadius: 10,
                padding: '11px 22px', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s', fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: '0 2px 10px rgba(255,80,0,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E04000'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FF5000'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Explore
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 54 }}>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>{popularTagsData?.title || 'Popular:'}</span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/category/all?q=${encodeURIComponent(tag)}`)}
                style={{
                  background: darkMode ? '#1E1E1E' : '#F7F7F7',
                  border: darkMode ? '1px solid #333' : '1px solid #EAEAEA',
                  borderRadius: 20,
                  padding: '5px 14px', fontSize: 13, fontWeight: 600,
                  color: darkMode ? '#CCC' : '#555', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.color = '#FF5000'; e.currentTarget.style.background = darkMode ? '#2A1F18' : '#FFF0E6'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = darkMode ? '#333' : '#EAEAEA'; e.currentTarget.style.color = darkMode ? '#CCC' : '#555'; e.currentTarget.style.background = darkMode ? '#1E1E1E' : '#F7F7F7'; }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, borderTop: darkMode ? '1px solid #222' : '1px solid #EEEEEE', paddingTop: 32 }} className="home-stats-row">
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#888', fontSize: 14 }}>Loading stats...</div>
            ) : statsData.length > 0 ? (
              statsData.map((stat, i) => (
                <div key={stat.label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? (darkMode ? '1px solid #222' : '1px solid #EEEEEE') : 'none', padding: '0 20px' }}>
                  <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 900, fontSize: 32, color: '#FF5000', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#888', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    {stat.label}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* ------ Trust Badges ------ */}
      <section style={{ padding: '56px 24px', background: darkMode ? '#141414' : '#FAFAFA', borderTop: darkMode ? '1px solid #222' : '1px solid #EEEEEE' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {(trustBadges?.badges || [
            { icon: 'Shield', title: 'Secure Payment', desc: 'Razorpay verified transactions' },
            { icon: 'Download', title: 'Instant Delivery', desc: 'Files sent to email immediately' },
            { icon: 'Star', title: 'Premium Quality', desc: 'Hand-curated digital products' },
            { icon: 'Zap', title: 'Fast & Reliable', desc: 'Always available, always fast' },
          ]).map((badge, idx) => {
            const IconComp = iconMap[badge.icon] || Zap;
            return (
              <div
                key={idx}
                style={{
                  background: darkMode ? '#1C1C1C' : '#FFFFFF',
                  border: darkMode ? '1px solid #2C2C2C' : '1px solid #EAEAEA',
                  borderRadius: 16,
                  padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.25s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,80,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = darkMode ? '#2C2C2C' : '#EAEAEA'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'; }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 12,
                  background: darkMode ? 'rgba(255,80,0,0.12)' : '#FFF0E6',
                  border: darkMode ? '1px solid rgba(255,80,0,0.25)' : '1px solid #FFE0CC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FF5000', flexShrink: 0,
                }}>
                  <IconComp size={24} />
                </div>
                <div>
                  <div style={{ color: darkMode ? '#FFFFFF' : '#111', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{badge.title}</div>
                  <div style={{ color: darkMode ? '#888' : '#777', fontSize: 13, lineHeight: 1.5 }}>{badge.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------ Category Grid ------ */}
      {categories.length > 0 && (
        <section id="categories-section" style={{ padding: '80px 0 60px', background: darkMode ? '#0F0F0F' : '#FFFFFF' }}>
          <div className="home-container" style={{ maxWidth: 1360, margin: '0 auto', padding: '0 36px' }}>
            <div style={{ textAlign: 'center', marginBottom: 52, padding: '0 16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 3, background: 'linear-gradient(90deg, #FF5000, transparent)', borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5000', letterSpacing: '2px', textTransform: 'uppercase' }}>Categories</span>
                <div style={{ width: 36, height: 3, background: 'linear-gradient(270deg, #FF5000, transparent)', borderRadius: 2 }} />
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 900, color: darkMode ? '#FFF' : '#111', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 12, padding: '0 12px' }}>
                Browse by <span style={{ background: 'linear-gradient(135deg, #FF5000 0%, #FF7F33 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic', paddingRight: '6px' }}>Category</span>
              </h2>
              <p style={{ color: darkMode ? '#999999' : '#777777', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Select a category to explore related products from our store
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => scrollCategories(-1)}
                disabled={!canScrollLeft}
                style={{
                  position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: 44, height: 44,
                  background: darkMode ? '#222222' : '#FFFFFF',
                  border: darkMode ? '1.5px solid #383838' : '1.5px solid #E0E0E0',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.18)', color: darkMode ? '#DDD' : '#333',
                  opacity: canScrollLeft ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (canScrollLeft) { e.currentTarget.style.background = '#FF5000'; e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#222222' : '#FFFFFF'; e.currentTarget.style.borderColor = darkMode ? '#383838' : '#E0E0E0'; e.currentTarget.style.color = darkMode ? '#DDD' : '#333'; }}
              >
                <ChevronLeft size={20} />
              </button>

              <div
                ref={catScrollRef}
                onScroll={updateCatScrollState}
                style={{
                  display: 'flex', gap: 20, overflowX: 'auto',
                  scrollbarWidth: 'none', msOverflowStyle: 'none',
                  padding: '10px 4px 14px',
                  scrollBehavior: 'smooth',
                  justifyContent: 'center',
                  scrollSnapType: 'x mandatory',
                }}
              >
                {categories.map(cat => {
                  const isActive = activeCategory?._id === cat._id;
                  return (
                    <div
                      key={cat._id}
                      onClick={() => { setActiveCategory(cat); setShowAll(false); }}
                      style={{
                        flexShrink: 0,
                        width: 220,
                        height: 220,
                        borderRadius: 20,
                        overflow: 'hidden',
                        border: isActive ? '3px solid #FF5000' : (darkMode ? '2px solid #2A2A2A' : '2px solid #EEEEEE'),
                        background: isActive ? (darkMode ? '#241910' : '#FFF4EE') : (darkMode ? '#1A1A1A' : '#FAFAFA'),
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 12px 32px rgba(255,80,0,0.22)' : '0 4px 12px rgba(0,0,0,0.04)',
                        transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                        display: 'flex',
                        flexDirection: 'column',
                        scrollSnapAlign: 'center',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'rgba(255,80,0,0.4)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = darkMode ? '#2A2A2A' : '#EEEEEE';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{
                        padding: '10px 16px',
                        background: isActive ? '#FF5000' : (darkMode ? '#262626' : '#ECECEC'),
                        textAlign: 'center',
                        fontSize: 13.5, fontWeight: 800,
                        color: isActive ? '#FFFFFF' : (darkMode ? '#CCC' : '#444444'),
                        letterSpacing: '0.2px',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        {isActive && <span>✦</span>}
                        {cat.name}
                      </div>

                      <div style={{
                        flex: 1,
                        overflow: 'hidden',
                        background: darkMode ? '#1E1E1E' : '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '10px',
                      }}>
                        {cat.imgUrl ? (
                          <img src={cat.imgUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%', borderRadius: 12,
                            background: darkMode ? '#181818' : '#F3F4F6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 36, color: darkMode ? '#444' : '#9CA3AF',
                          }}>📂</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories(1)}
                disabled={!canScrollRight}
                style={{
                  position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: 44, height: 44,
                  background: darkMode ? '#222222' : '#FFFFFF',
                  border: darkMode ? '1.5px solid #383838' : '1.5px solid #E0E0E0',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'not-allowed',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.18)', color: darkMode ? '#DDD' : '#333',
                  opacity: canScrollRight ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (canScrollRight) { e.currentTarget.style.background = '#FF5000'; e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#222222' : '#FFFFFF'; e.currentTarget.style.borderColor = darkMode ? '#383838' : '#E0E0E0'; e.currentTarget.style.color = darkMode ? '#DDD' : '#333'; }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Products in Active Category Grid */}
            {activeCategory && (
              <div style={{ marginTop: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 5, height: 34, background: 'linear-gradient(180deg, #FF5000, #FF7F33)', borderRadius: 4 }} />
                    <div>
                      <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900, fontSize: 24, color: darkMode ? '#FFF' : '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        {activeCategory.name}
                      </h3>
                      <p style={{ fontSize: 13.5, color: '#888', marginTop: 5 }}>
                        {activeProd.length} product{activeProd.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: '#FF5000', textDecoration: 'none', fontSize: 13.5, fontWeight: 700,
                      padding: '10px 20px', borderRadius: 10,
                      border: darkMode ? '1.5px solid rgba(255,80,0,0.4)' : '1.5px solid rgba(255,80,0,0.3)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,80,0,0.15)' : '#FFF0E6'; e.currentTarget.style.borderColor = '#FF5000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,80,0,0.3)'; }}
                  >
                    View all in {activeCategory.name} <ArrowRight size={14} />
                  </Link>
                </div>

                {catLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
                    <div className="spinner" style={{ width: 38, height: 38 }} />
                  </div>
                ) : activeProd.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }} className="home-product-grid">
                       {displayedProd.map(p => <ProductCard key={p._id} product={p} onClick={setSelectedProduct} />)}
                    </div>

                    {/* View More / Show Less Button */}
                    {activeProd.length > responsiveLimit && (
                      <div style={{ textAlign: 'center', marginTop: 44 }}>
                        <button
                          onClick={() => setShowAll(v => !v)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            background: showAll ? (darkMode ? '#222' : '#F7F7F7') : '#FF5000',
                            color: showAll ? (darkMode ? '#DDD' : '#444') : 'white',
                            border: showAll ? (darkMode ? '1.5px solid #383838' : '1.5px solid #E0E0E0') : 'none',
                            borderRadius: 12, padding: '14px 40px',
                            fontWeight: 800, fontSize: 15,
                            cursor: 'pointer', transition: 'all 0.25s',
                            fontFamily: "'Inter', system-ui, sans-serif",
                            boxShadow: showAll ? 'none' : '0 6px 24px rgba(255,80,0,0.3)',
                            letterSpacing: '-0.2px',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; if (!showAll) e.currentTarget.style.boxShadow = '0 10px 32px rgba(255,80,0,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; if (!showAll) e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,80,0,0.3)'; }}
                        >
                          {showAll ? '↑ Show Less' : `View More Cards (${activeProd.length - responsiveLimit} more) →`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📦</div>
                    <p style={{ fontSize: 16, color: darkMode ? '#AAA' : '#666', fontWeight: 600 }}>No products in this category yet.</p>
                    <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ------ Portfolio Section ------ */}
      {portfolio.length > 0 && (
        <section style={{ padding: '80px 24px 100px', background: darkMode ? '#0F0F0F' : '#FFFFFF', borderTop: darkMode ? '1px solid #222' : '1px solid #EEEEEE' }}>
          <div className="home-container" style={{ maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 3, background: '#FF5000', borderRadius: 2 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5000', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Our Work</span>
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: darkMode ? '#FFF' : '#111', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                  Portfolio
                </h2>
                <p style={{ color: darkMode ? '#888' : '#777', fontSize: 15, marginTop: 6 }}>
                  Real projects delivered with precision and quality
                </p>
              </div>
              <Link
                to="/portfolio"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#FF5000', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  padding: '11px 22px', borderRadius: 10,
                  border: darkMode ? '1.5px solid rgba(255,80,0,0.4)' : '1.5px solid rgba(255,80,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,80,0,0.15)' : '#FFF0E6'; e.currentTarget.style.borderColor = '#FF5000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,80,0,0.3)'; }}
              >
                View All Portfolio <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="home-portfolio-grid">
              {portfolio.slice(0, 8).map(p => (
                <div key={p._id} style={{ maxWidth: '100%' }}>
                  <ProductCard product={p} onClick={setSelectedProduct} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------ Featured Products (Only shown when admin has added featured products) ------ */}
      {featured.length > 0 && (
        <section style={{ padding: '80px 24px 100px', background: darkMode ? '#141414' : '#FAFAFA', borderTop: darkMode ? '1px solid #222' : '1px solid #EEEEEE' }}>
          <div className="home-container" style={{ maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 3, background: '#FF5000', borderRadius: 2 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5000', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {featuredSection?.ctaText || 'Hand-Picked'}
                  </span>
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: darkMode ? '#FFF' : '#111', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                  {featuredSection?.title || 'Featured Products'}
                </h2>
                <p style={{ color: darkMode ? '#888' : '#777', fontSize: 15, marginTop: 6 }}>
                  {featuredSection?.subtitle || 'Hand-picked digital products curated just for you'}
                </p>
              </div>
              <Link
                to="/category/all"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#FF5000', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  padding: '11px 22px', borderRadius: 10,
                  border: darkMode ? '1.5px solid rgba(255,80,0,0.4)' : '1.5px solid rgba(255,80,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = darkMode ? 'rgba(255,80,0,0.15)' : '#FFF0E6'; e.currentTarget.style.borderColor = '#FF5000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,80,0,0.3)'; }}
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }} className="home-product-grid home-featured-grid">
               {featured.map(p => <ProductCard key={p._id} product={p} onClick={setSelectedProduct} />)}
             </div>
          </div>
        </section>
      )}

      {/* ── FAQ Section ── */}
      <section style={{ padding: '80px 24px 100px', background: darkMode ? '#0F0F0F' : '#FFFFFF', borderTop: darkMode ? '1px solid #222' : '1px solid #EEEEEE' }}>
        <div className="home-container faq-container" style={{ margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 3, background: 'linear-gradient(90deg, #FF5000, transparent)', borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#FF5000', letterSpacing: '2px', textTransform: 'uppercase' }}>FAQ</span>
              <div style={{ width: 36, height: 3, background: 'linear-gradient(270deg, #FF5000, transparent)', borderRadius: 2 }} />
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: darkMode ? '#FFF' : '#111', letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: darkMode ? '#888' : '#777', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
              Quick answers to common questions about our products and services
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="faq-list">
            {[
              {
                q: 'How do I receive my purchased products?',
                a: 'After successful payment, all files and download links are instantly sent to your email. Please check your inbox (and spam folder) within minutes of purchase.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'Since our products are digital downloads and delivered instantly, we generally do not offer refunds. Please review product details carefully before purchasing. Contact us if you face any issues.'
              },
              {
                q: 'Can I use the products for commercial projects?',
                a: 'Yes, most of our products come with a commercial license that allows you to use them in client projects and commercial applications. Check the specific license terms for each product.'
              },
              {
                q: 'How do I get support if I need help?',
                a: 'You can reach us through the Contact page, email us at hello@super12.com, or use the contact form on our website. We typically respond within 24 hours.'
              },
              {
                q: 'Are updates included with my purchase?',
                a: 'Yes, one-time purchases include lifetime access to updates for that specific product. You will receive email notifications when new versions are released.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major payment methods through Razorpay including credit/debit cards, UPI, net banking, and popular wallets.'
              },
            ].map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} darkMode={darkMode} />
            ))}
          </div>
        </div>
      </section>

      {/* ------ Success Notification ------ */}
      {showNotif && lastOrder && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 1000,
          background: darkMode ? '#1E1E1E' : '#FFFFFF',
          border: darkMode ? '1px solid #333' : '1px solid #E5E5E5',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '22px 24px',
          maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 15, color: darkMode ? '#FFF' : '#1A1A1A' }}>Purchase Successful!</div>
                <div style={{ fontSize: 12, color: '#888' }}>Order #{lastOrder.orderId}</div>
              </div>
            </div>
            <button
              onClick={dismissNotif}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#333' : '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: darkMode ? '#DDD' : '#1A1A1A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Customer</span>
              <span style={{ fontWeight: 600 }}>{lastOrder.customerName || 'Customer'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>Email</span>
              <span style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastOrder.customerEmail}</span>
            </div>
            {lastOrder.items?.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Product</span>
                <span style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastOrder.items[0].title}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: darkMode ? '1px solid #333' : '1px solid #E5E5E5', paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: '#888', fontWeight: 600 }}>Total Paid</span>
              <span style={{ color: '#22C55E', fontWeight: 800 }}>{formatPrice(lastOrder.totalAmount || 0)}</span>
            </div>
          </div>
          <Link
            to={`/order/${lastOrder.orderId}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#22C55E', color: 'white', padding: '11px 16px', borderRadius: 11,
              textDecoration: 'none', fontWeight: 700, fontSize: 13.5, textAlign: 'center', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            View Order Details
          </Link>
        </div>
      )}

      <style>{`
        .faq-container {
          width: 50% !important;
          max-width: 900px !important;
        }
        @media (max-width: 991.98px) {
          .faq-container {
            width: 100% !important;
          }
        }

        /* 1500px - 1920px+: 5 cards per row */
        @media (min-width: 1500px) {
          .home-product-grid, .home-featured-grid, .home-portfolio-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 24px !important;
          }
          .home-container {
            max-width: 1680px !important;
          }
        }
        /* 1199px - 1499px: 4 cards per row */
        @media (min-width: 1199px) and (max-width: 1499.98px) {
          .home-product-grid, .home-featured-grid, .home-portfolio-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 22px !important;
          }
          .home-container {
            max-width: 1360px !important;
          }
        }
        /* 991px - 1198px: 3 cards per row */
        @media (min-width: 991px) and (max-width: 1198.98px) {
          .home-product-grid, .home-featured-grid, .home-portfolio-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
          .home-container {
            max-width: 1160px !important;
          }
        }
        /* 567px - 990px: 2 cards per row */
        @media (min-width: 567px) and (max-width: 990.98px) {
          .home-product-grid, .home-featured-grid, .home-portfolio-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
        }
        @media (max-width: 768px) {
          .hero-section { padding-top: 60px !important; }
        }
        @media (max-width: 480px) {
          .hero-section { padding-top: 48px !important; }
        }
        /* 320px - 566px: 1 card per row */
        @media (max-width: 566.98px) {
          .hero-section { padding-top: 40px !important; }
          .home-stats-row {
            flex-direction: column !important;
            gap: 18px !important;
            padding-top: 24px !important;
          }
          .home-stats-row > div {
            border-left: none !important;
            border-top: 1px solid ${darkMode ? '#222' : '#EEEEEE'} !important;
            padding: 14px 20px !important;
            flex: none !important;
            width: 100% !important;
          }
          .home-stats-row > div:first-child {
            border-top: none !important;
          }
          .home-cat-card {
            width: 200px !important;
          }
          .home-shelf-arrow {
            display: none !important;
          }
          .home-product-grid, .home-featured-grid, .home-portfolio-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 380px) {
          .home-cat-card {
            width: 170px !important;
          }
        }
        @media (max-width: 768px) {
          .faq-list { gap: 8px !important; }
        }
      `}</style>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Live Buyer Notification Widget */}
      <BuyerNotificationWidget />
    </div>
    </>
  );
}

function BuyerNotificationWidget() {
  const [purchases, setPurchases] = useState([]);
  const [visible, setVisible] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const sock = getSocket();
    socketRef.current = sock;

    const handleNewOrder = (data) => {
      const purchase = {
        id: Date.now() + Math.random(),
        customerName: data.customer?.name || 'Someone',
        email: data.customer?.email || '',
        productNames: data.items?.map(i => i.title || 'Product').join(', ') || 'Products',
        totalAmount: data.totalAmount || 0,
        currency: data.currency || '₹',
        timestamp: new Date()
      };

      setPurchases(prev => [purchase, ...prev].slice(0, 10));
      setVisible(true);

      setTimeout(() => {
        setPurchases(prev => prev.filter(p => p.id !== purchase.id));
      }, 8000);
    };

    sock.on('new_order', handleNewOrder);
    sock.on('payment_success', handleNewOrder);

    return () => {
      sock.off('new_order', handleNewOrder);
      sock.off('payment_success', handleNewOrder);
    };
  }, []);

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible || purchases.length === 0) return null;

  const latest = purchases[0];

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      zIndex: 999,
      maxWidth: 320,
      width: 'calc(100% - 40px)',
      background: '#FFFFFF',
      border: '1px solid #E5E5E5',
      borderRadius: 14,
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      animation: 'slideInLeft 0.4s ease',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        padding: '10px 14px',
        background: '#F0FDF4',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#22C55E',
          animation: 'pulse 1.5s infinite'
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recent Purchase
        </span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#FF5000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', fontWeight: 700, fontSize: 14, flexShrink: 0
          }}>
            {latest.customerName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {latest.customerName}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
              {formatTime(latest.timestamp)}
            </div>
          </div>
        </div>

        <div style={{
          background: '#F5F5F5',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 8,
          fontSize: 12,
          color: '#666',
          lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>Purchased:</div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {latest.productNames}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 0 0',
          borderTop: '1px solid #F5F5F5'
        }}>
          <span style={{ fontSize: 11, color: '#888' }}>{latest.currency} {Number(latest.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: '#ECFDF5', color: '#16A34A', textTransform: 'uppercase'
          }}>
            ✓ Paid
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}


