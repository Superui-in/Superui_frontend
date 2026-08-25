import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useCurrencyStore from '../store/currencyStore';
import useThemeStore from '../store/themeStore';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const W = {
    bg: '#FFFFFF',
    border: '#E5E5E5',
    text: '#111111',
    sub: '#666666',
    shadow: '0 4px 20px rgba(0,0,0,0.08)',
    inputBg: '#F5F5F5',
  };

  document.title = 'Your Cart -- SuperUi';

  const total = getTotal();
  const { data: cartUpsell } = useSiteContent('cartUpsell');
  const { data: cartPage } = useSiteContent('cartPage');

  if (items.length === 0) {
    return (
      <>
        <Seo title="Your Cart" description="Your shopping cart is empty. Browse premium digital products, rediment websites, and portfolio templates." url="/cart" />
        <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>??</div>
        <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, color: W.text, fontSize: 24, marginBottom: 12 }}>
          {cartPage?.emptyTitle || 'Your cart is empty'}
        </h2>
        <p style={{ color: W.sub, marginBottom: 28 }}>{cartPage?.emptySubtitle || 'Browse our products and add something awesome!'}</p>
        <Link to="/" className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
          <ShoppingBag size={16} /> {cartPage?.emptyButton || 'Shop Now'}
        </Link>
      </div>
      </>
    );
  }

  return (
    <>
      <Seo title="Your Cart" description={`Your shopping cart with ${items.length} item${items.length !== 1 ? 's' : ''}. Proceed to checkout for instant delivery.`} url="/cart" />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 100px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Cart Upsell Banner */}
      {cartUpsell?.title && (
        <div style={{
          background: '#FFF8F4',
          border: '1px solid #FFE4D4',
          borderRadius: 16, padding: '20px 24px',
          marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#FFF4EE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FF5000', flexShrink: 0,
          }}>
            <ShoppingBag size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: '#111', margin: 0 }}>
              {cartUpsell.title}
            </h3>
            {cartUpsell.subtitle && (
              <p style={{ color: '#666', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>
                {cartUpsell.subtitle}
              </p>
            )}
          </div>
          <Link to="/checkout" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 13, padding: '10px 18px' }}>
            {cartUpsell.secureCheckoutText || 'Secure Checkout'} <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div className="accent-line" />
        <h1 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 28, color: '#111' }}>
          Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }} className="cart-layout">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="cart-items-col">
          {items.map(item => {
            const price = item.discountPrice && item.discountPrice < item.actualPrice
              ? item.discountPrice : item.actualPrice;
            return (
              <div key={item._id} style={{
                background: '#FFFFFF',
                border: '1px solid #EAEAEA',
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex', gap: 18, alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }} className="cart-item-row">
                <img
                  src={item.imgUrl}
                  alt={item.name}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/160x108/1a1a1a/FF5000?text=No+Image'; }}
                  style={{ width: 80, height: 54, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }} className="cart-item-text">
                  <p style={{ fontWeight: 700, color: '#111', fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ color: '#666', fontSize: 13 }}>{item.title}</p>
                  <div className="tags-row" style={{ marginTop: 8 }}>
                    {item.techStack?.slice(0, 3).map(t => <span key={t} className="badge badge-muted" style={{ fontSize: 11 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }} className="cart-item-price">
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#FF5000' }}>
                    {formatPrice(price)}
                  </div>
                  {item.discountPrice && item.discountPrice < item.actualPrice && (
                    <div style={{ fontSize: 12, color: '#888', textDecoration: 'line-through' }}>
                      {formatPrice(item.actualPrice)}
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(item._id)}
                    style={{
                      marginTop: 10, background: 'none', border: 'none',
                      color: '#888', cursor: 'pointer', padding: 6, borderRadius: 6,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: 16, padding: 24, position: 'sticky', top: 90,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }} className="cart-summary">
          <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 20 }}>
            Order Summary
          </h3>

          {items.map(item => {
            const p = item.discountPrice && item.discountPrice < item.actualPrice ? item.discountPrice : item.actualPrice;
            return (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: '#666', flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <span style={{ color: '#222', fontWeight: 600, flexShrink: 0 }}>{formatPrice(p)}</span>
              </div>
            );
          })}

          <div style={{ borderTop: '1px solid #EEEEEE', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>Total</span>
            <span style={{ fontWeight: 800, color: '#FF5000', fontSize: 20 }}>{formatPrice(total)}</span>
          </div>

          <Link to="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px 0' }}>
            {cartPage?.checkoutButton || 'Proceed to Checkout'} <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10, fontSize: 13 }}>
            {cartPage?.continueShopping || 'Continue Shopping'}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
          .cart-summary {
            position: static !important;
          }
        }
        @media (max-width: 768px) {
          .cart-item-row {
            flex-wrap: wrap !important;
          }
          .cart-item-row img {
            width: 64px !important;
            height: 44px !important;
          }
          .cart-item-text {
            flex: 1 1 60% !important;
            min-width: 0 !important;
          }
          .cart-item-price {
            text-align: left !important;
            margin-top: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .cart-item-row {
            gap: 12px !important;
          }
          .cart-item-row img {
            width: 56px !important;
            height: 38px !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

