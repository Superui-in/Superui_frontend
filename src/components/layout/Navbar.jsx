import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Moon, Sun, Menu, X, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import useCurrencyStore, { COUNTRIES } from '../../store/currencyStore';
import { useSiteContent } from '../../hooks/useSiteContent';
import { getLogoHtml } from '../../components/common/Logo';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const { darkMode, toggleDarkMode, initTheme } = useThemeStore();
  const { selectedCountry, setCountry } = useCurrencyStore();
  const items = useCartStore(s => s.items);
  const { data: brandData } = useSiteContent('brand');

  const navigate = useNavigate();
  const currencyRef = useRef(null);

  useEffect(() => {
    initTheme();
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Websites', to: '/category/all' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Contact', to: '/contact' },
  ];

  const accentColor = '#FF5000';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: darkMode ? 'rgba(15, 15, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 1px 10px rgba(0,0,0,0.03)',
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <nav className="site-container" style={{
        height: 66,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24,
      }}>

        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0
          }}
        >
          {getLogoHtml(
            brandData,
            {
              variant: 'navbar',
              darkMode,
              brandName: brandData?.brandName || 'SuperUi'
            }
          )}
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {primaryLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              style={{
                color: darkMode ? '#CCC' : '#444',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: 8,
                transition: 'all 0.15s',
                fontFamily: "'Inter', system-ui, sans-serif",
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = accentColor; }}
              onMouseLeave={e => { e.currentTarget.style.color = darkMode ? '#CCC' : '#444'; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* Currency - visible on desktop + tablet (567px+) */}
          <div ref={currencyRef} style={{ position: 'relative' }} className="currency-wrapper">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              title="Select Country & Currency"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 13px',
                border: currencyOpen ? `1.5px solid ${accentColor}` : (darkMode ? '1px solid #333' : '1px solid #E5E5E5'),
                background: darkMode ? '#1E1E1E' : '#FAFAFA',
                borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                color: darkMode ? '#E0E0E0' : '#333333',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onMouseEnter={e => { if (!currencyOpen) e.currentTarget.style.borderColor = accentColor; }}
              onMouseLeave={e => { if (!currencyOpen) e.currentTarget.style.borderColor = darkMode ? '#333' : '#E5E5E5'; }}
            >
              <img
                src={selectedCountry.flag}
                alt={selectedCountry.name}
                style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2, display: 'inline-block' }}
              />
              <span style={{ color: accentColor, fontWeight: 800 }}>{selectedCountry.symbol}</span>
              <span>{selectedCountry.currency}</span>
              <ChevronDown size={13} style={{ color: '#888', transform: currencyOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {currencyOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: darkMode ? '#1E1E1E' : '#FFFFFF',
                border: darkMode ? '1px solid #333' : '1px solid #EEEEEE',
                borderRadius: 14,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                padding: '8px',
                minWidth: 200,
                zIndex: 250,
                animation: 'fadeInDown 0.18s ease',
              }}>
                <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 800, color: '#888', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Select Currency
                </div>
                {COUNTRIES.map((c, idx) => {
                  const isSelected = selectedCountry.code === c.code;
                  return (
                    <button
                      key={`${c.code}-${idx}`}
                      onClick={() => {
                        setCountry(c.code);
                        setCurrencyOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 8,
                        background: isSelected ? (darkMode ? '#2E2E18' : '#FFF4EE') : 'none',
                        border: 'none',
                        color: isSelected ? accentColor : (darkMode ? '#E0E0E0' : '#333'),
                        fontSize: 13.5, fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = darkMode ? '#262626' : '#F7F7F7'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <img
                          src={c.flag}
                          alt={c.name}
                          style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2 }}
                        />
                        <span>{c.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: isSelected ? accentColor : '#888' }}>{c.symbol} {c.currency}</span>
                        {isSelected && <Check size={14} color={accentColor} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle - hidden on mobile */}
          <button
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 40, height: 40,
              background: darkMode ? '#222222' : '#FAFAFA',
              border: darkMode ? '1px solid #383838' : '1px solid #E5E5E5',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: darkMode ? '#FFB066' : '#555555',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; e.currentTarget.style.background = darkMode ? '#2C2C2C' : '#FFF4EE'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = darkMode ? '#383838' : '#E5E5E5'; e.currentTarget.style.color = darkMode ? '#FFB066' : '#555555'; e.currentTarget.style.background = darkMode ? '#222222' : '#FAFAFA'; }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart button */}
          <button
            id="cart-btn"
            onClick={() => navigate('/cart')}
            title={`Cart (${items.length} items)`}
            style={{
              position: 'relative',
              width: 40, height: 40,
              background: items.length > 0 ? (darkMode ? 'rgba(255,80,0,0.18)' : '#FFF0E6') : (darkMode ? '#222222' : '#FAFAFA'),
              border: `1px solid ${items.length > 0 ? accentColor : (darkMode ? '#383838' : '#E5E5E5')}`,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: items.length > 0 ? accentColor : (darkMode ? '#CCC' : '#555555'),
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = items.length > 0 ? accentColor : (darkMode ? '#383838' : '#E5E5E5'); e.currentTarget.style.color = items.length > 0 ? accentColor : (darkMode ? '#CCC' : '#555555'); }}
          >
            <ShoppingCart size={18} />
            {items.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: accentColor, color: 'white',
                fontSize: 10, fontWeight: 800,
                borderRadius: '50%', width: 19, height: 19,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${darkMode ? '#141414' : '#FFF'}`,
                boxShadow: '0 2px 6px rgba(255,80,0,0.5)',
              }}>
                {items.length}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: darkMode ? '#222' : '#F5F5F5',
              border: darkMode ? '1px solid #383838' : '1px solid #E8E8E8',
              borderRadius: 10,
              color: darkMode ? '#EEE' : '#333',
              cursor: 'pointer',
              width: 40, height: 40,
              display: 'none', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: darkMode ? '#1A1A1A' : '#FFFFFF',
          borderTop: darkMode ? '1px solid #2E2E2E' : '1px solid #F0F0F0',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 6,
          animation: 'fadeInDown 0.2s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {primaryLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                color: darkMode ? '#EEE' : '#1A1A1A',
                textDecoration: 'none',
                fontSize: 15, fontWeight: 600,
                padding: '10px 0',
                borderBottom: darkMode ? '1px solid #2C2C2C' : '1px solid #F5F5F5',
                display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Currency Selector */}
          <div style={{ padding: '12px 0', borderBottom: darkMode ? '1px solid #2E2E2E' : '1px solid #F5F5F5' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Currency</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {COUNTRIES.map((c, idx) => (
                <button
                  key={`${c.code}-${idx}`}
                  onClick={() => { setCountry(c.code); setMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 12px', borderRadius: 8,
                    background: selectedCountry.code === c.code ? accentColor : (darkMode ? '#2A2A2A' : '#F5F5F5'),
                    border: 'none',
                    color: selectedCountry.code === c.code ? 'white' : (darkMode ? '#DDD' : '#444'),
                    fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <img
                    src={c.flag}
                    alt={c.name}
                    style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <span>{c.symbol} {c.currency}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none',
                color: darkMode ? '#FFB066' : '#555',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              style={{
                color: accentColor,
                textDecoration: 'none',
                fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ShoppingCart size={17} />
              Cart ({items.length})
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .currency-wrapper { display: block !important; }
          .dark-mode-toggle { display: none !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 566px) {
          .currency-wrapper { display: none !important; }
        }
      `}</style>
    </header>
  );
}
