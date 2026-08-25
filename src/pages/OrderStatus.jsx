import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RefreshCw, Home, Search } from 'lucide-react';
import api from '../api/axiosInstance';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';
import useThemeStore from '../store/themeStore';

const STATUS_CONFIG = {
  success: {
    icon: <CheckCircle size={64} color="#22C55E" />,
    title: '🎉 Payment Successful!',
    subtitle: 'Your files have been sent to your email. Check your inbox (and spam folder).',
    color: '#22C55E',
  },
  failed: {
    icon: <XCircle size={64} color="#EF4444" />,
    title: 'Payment Failed',
    subtitle: "We couldn't process your payment. No amount was charged.",
    color: '#EF4444',
  },
  pending: {
    icon: <Clock size={64} color="#F59E0B" />,
    title: 'Payment Pending',
    subtitle: 'Your payment is being verified. We\'ll email you once confirmed.',
    color: '#F59E0B',
  },
};

export default function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useThemeStore();

  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [inputOrderId, setInputOrderId] = useState('');
  const pollRef = useRef(null);
  const attempts = useRef(0);
  const { data: orderStatus } = useSiteContent('orderStatus');

  const isLookupMode = orderId === 'status';

  useEffect(() => {
    if (isLookupMode) {
      setLoading(false);
      setPolling(false);
      document.title = 'Track Order -- SuperUi';
      return;
    }

    document.title = `Order ${orderId} -- SuperUi`;

    const fetchStatus = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}/status`);
        setOrder(data);
        if (data.paymentStatus === 'success' || data.paymentStatus === 'failed') {
          setPolling(false);
          clearInterval(pollRef.current);
        }
      } catch {
        setPolling(false);
        clearInterval(pollRef.current);
      } finally {
        setLoading(false);
        attempts.current += 1;
        if (attempts.current >= 20) { // max 2 min polling
          setPolling(false);
          clearInterval(pollRef.current);
        }
      }
    };

    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 6000);
    return () => clearInterval(pollRef.current);
  }, [orderId, isLookupMode]);

  useEffect(() => {
    if (order && order.paymentStatus === 'success') {
      try {
        localStorage.setItem('last_successful_order', JSON.stringify({
          orderId: order.orderId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          currency: order.currency,
          items: order.items,
          timestamp: Date.now()
        }));
      } catch {}
    }
  }, [order]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (inputOrderId.trim()) {
      navigate(`/order/${inputOrderId.trim()}`);
    }
  };

  const accentColor = '#FF5000';
  const textMain = darkMode ? '#FFFFFF' : '#111827';
  const textMuted = darkMode ? '#9CA3AF' : '#4B5563';
  const cardBg = darkMode ? '#1A1A1E' : '#FFFFFF';
  const border = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  if (loading) {
    return (
      <div className="page-loader" style={{ flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p style={{ color: '#888', fontSize: 14 }}>Fetching your order status...</p>
      </div>
    );
  }

  // Render Order Lookup portal when /order/status is hit
  if (isLookupMode) {
    return (
      <>
        <Seo title="Track Order Status" description="Enter your Order ID to verify payment status and download digital files." url="/order/status" />
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '100px 24px 140px', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: darkMode ? 'rgba(255,80,0,0.1)' : '#FFF0E6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', color: accentColor,
            border: `2px solid ${darkMode ? 'rgba(255,80,0,0.2)' : '#FFE0CC'}`,
          }}>
            <Search size={32} />
          </div>

          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 'clamp(24px, 4.5vw, 36px)', color: textMain, marginBottom: 12, letterSpacing: '-0.8px' }}>
            Track Your Order
          </h1>

          <p style={{ color: textMuted, fontSize: 14.5, lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
            Enter the Order ID sent to your email to check transaction verification and get your download links.
          </p>

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: textMain, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order Identification ID
              </label>
              <input
                type="text"
                placeholder="e.g. ORD-20260824-A1B2"
                value={inputOrderId}
                onChange={e => setInputOrderId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1.5px solid ${border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  background: darkMode ? '#1F1F24' : '#F9F9FB',
                  color: textMain,
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: accentColor,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: 6,
                boxShadow: '0 4px 14px rgba(255,80,0,0.25)',
              }}
            >
              Verify & Track Order
            </button>
          </form>

          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 32, fontSize: 13.5, color: accentColor, textDecoration: 'none', fontWeight: 700 }}>
            <Home size={14} /> Back to Homepage
          </Link>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ fontFamily: 'Space Grotesk', color: textMain, fontSize: 26, fontWeight: 800 }}>Order not found</h2>
        <p style={{ color: textMuted, marginTop: 8, fontSize: 14 }}>We couldn't locate any records for Order ID: <strong>{orderId}</strong></p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
          <Link to="/order/status" className="btn-outline" style={{ fontSize: 13.5, textDecoration: 'none', borderRadius: 20 }}>
            Try Another ID
          </Link>
          <Link to="/" className="btn-primary" style={{ fontSize: 13.5, textDecoration: 'none', borderRadius: 20, background: accentColor }}>
            <Home size={14} /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.paymentStatus] || STATUS_CONFIG.pending;
  const seoTitle = `${order.paymentStatus === 'success' ? 'Payment Successful' : order.paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Pending'} -- Order ${order.orderId}`;

  return (
    <>
      <Seo title={seoTitle} description={`Order status for ${orderId}. ${order?.paymentStatus === 'success' ? 'Payment successful! Your files have been sent to your email.' : 'Check your payment status here.'}`} url={`/order/${orderId}`} noindex={!order} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px 100px', textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif" }} className="order-status-container">
        
        {/* Status icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `${config.color}18`,
          border: `2px solid ${config.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          {config.icon}
        </div>

        <h1 style={{
          fontFamily: 'Space Grotesk', fontWeight: 800,
          fontSize: 'clamp(24px, 4.5vw, 32px)',
          color: textMain, marginBottom: 12,
          letterSpacing: '-0.8px',
        }}>
          {config.title}
        </h1>

        <p style={{ color: textMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
          {config.subtitle}
        </p>

        {/* Order details card */}
        <div style={{
          background: cardBg,
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 20, padding: '28px 32px', textAlign: 'left', marginBottom: 28,
          boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        }} className="order-detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: textMuted, fontSize: 13 }}>Order ID</span>
            <span style={{ color: textMain, fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>{order.orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: textMuted, fontSize: 13 }}>Customer</span>
            <span style={{ color: textMain, fontSize: 13 }}>{order.customerName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: textMuted, fontSize: 13 }}>Email</span>
            <span style={{ color: textMain, fontSize: 13 }}>{order.customerEmail}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: textMuted, fontSize: 13 }}>Amount</span>
            <span style={{ color: config.color, fontWeight: 700, fontSize: 16 }}>
              {order.currency} {order.totalAmount?.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: textMuted, fontSize: 13 }}>Status</span>
            <span className={`badge badge-${order.paymentStatus === 'success' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'warning'}`}>
              {order.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Items */}
        {order.items?.length > 0 && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }} className="order-items-card">
            <p style={{ color: textMuted, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Purchased Items</p>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.items.length - 1 ? `1px solid ${border}` : 'none' }}>
                <span style={{ color: textMain, fontSize: 13, fontWeight: 500 }}>{item.title}</span>
                <span style={{ color: accentColor, fontWeight: 700, fontSize: 13 }}>{order.currency} {item.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Polling indicator */}
        {polling && order.paymentStatus === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: textMuted, fontSize: 13, marginBottom: 24 }}>
            <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
            Auto-refreshing status...
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {order.paymentStatus === 'success' && order.invoiceUrl && (
            <a href={`${window.location.origin}${order.invoiceUrl}`} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ fontSize: 14, textDecoration: 'none', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
              📥 Download Invoice
            </a>
          )}
          <Link to="/" className="btn-primary" style={{ fontSize: 14, textDecoration: 'none', background: accentColor, borderRadius: 20 }}>
            <Home size={14} /> {orderStatus?.backToStore || 'Back to Store'}
          </Link>
          {order.paymentStatus === 'failed' && (
            <Link to="/cart" className="btn-outline" style={{ fontSize: 14, textDecoration: 'none', borderRadius: 20 }}>
              {orderStatus?.tryAgain || 'Try Again'}
            </Link>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .order-status-container { padding: 48px 16px 60px !important; }
            .order-detail-card { padding: 20px 16px !important; }
          }
          @media (max-width: 480px) {
            .order-status-container { padding: 32px 10px 48px !important; }
            .order-detail-card { padding: 16px 12px !important; border-radius: 14px !important; }
            .order-items-card { padding: 16px 12px !important; border-radius: 12px !important; }
          }
        `}</style>
      </div>
    </>
  );
}
