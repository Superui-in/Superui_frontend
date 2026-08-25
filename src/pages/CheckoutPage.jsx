import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useCurrencyStore from '../store/currencyStore';
import useThemeStore from '../store/themeStore';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useSiteContent } from '../hooks/useSiteContent';
import Seo from '../components/common/Seo';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { darkMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const directProduct = location.state?.directProduct || null;

  const CUSTOMER_KEY = 'SuperUi_customer_data';

  const getSavedCustomer = () => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.name && data.email) return data;
      return null;
    } catch { return null; }
  };

  const [form, setForm] = useState(() => {
    const saved = getSavedCustomer();
    return saved
      ? { name: '', email: saved.email, confirmEmail: saved.email, phone: saved.phone || '' }
      : { name: '', email: '', confirmEmail: '', phone: '' };
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedIndicator, setSavedIndicator] = useState(false);
  const total = getTotal();
  const { data: checkoutNotice } = useSiteContent('checkoutNotice');
  const { data: checkoutPage } = useSiteContent('checkoutPage');
  const directTotal = directProduct
    ? (directProduct.discountPrice && directProduct.discountPrice < directProduct.actualPrice ? directProduct.discountPrice : directProduct.actualPrice)
    : 0;
  const effectiveTotal = directProduct ? directTotal : total;
  const cartItems = directProduct ? [directProduct] : items;

  document.title = 'Checkout -- SuperUi';

  useEffect(() => {
    if (directProduct) {
      document.title = `Checkout -- ${directProduct.name}`;
    }
    const saved = getSavedCustomer();
    if (saved) {
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 4000);
    }
  }, [directProduct]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { email, phone } = form;
      if (email) {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ email: email.trim().toLowerCase(), phone: phone.trim() }));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  const validate = () => {
    const e = {};
    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanConfirmEmail = form.confirmEmail.trim().toLowerCase();
    const cleanPhone = form.phone.trim().replace(/[\s+\-]/g, '');

    if (!cleanName || cleanName.length < 2) e.name = 'Please enter your full name';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) e.email = 'Please enter a valid email address';
    if (!cleanConfirmEmail) e.confirmEmail = 'Please confirm your email';
    else if (cleanEmail !== cleanConfirmEmail) e.confirmEmail = 'Email addresses do not match';
    if (!cleanPhone || cleanPhone.length < 7) e.phone = 'Please enter a valid phone number (7-15 digits)';
    else if (!/^\d{7,15}$/.test(cleanPhone)) e.phone = 'Enter digits only (7-15 digits)';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const cartItemIds = directProduct
        ? [directProduct._id]
        : items.map(i => i._id);

      const { data } = await api.post('/checkout', {
        name: form.name.trim(),
        email: cleanEmail,
        phone: form.phone.trim(),
        cartItems: cartItemIds,
      });

      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = res;
          script.onerror = rej;
          document.body.appendChild(script);
        });
      }

      // Payment key comes from backend response -- never hardcode or rely on a frontend env var.
      // Backend reads RAZORPAY_KEY_ID from its .env; frontend stays key-free.
      const activeKey = data.keyId;
      if (!activeKey) {
        toast.error('Payment configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: activeKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: 'SuperUi',
        description: `Order ${data.orderId}`,
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone || '',
        },
        theme: { color: '#FF5000' },
        handler: () => {
          if (!directProduct) clearCart();
          toast.success(`Payment successful! Delivery email sent to ${cleanEmail}`);
          navigate(`/order/${data.orderId}`);
        },
        modal: {
          ondismiss: () => {
            toast('Payment window closed.', { icon: '??' });
            navigate(`/order/${data.orderId}`);
          }
        }
      });

      rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Transaction declined'}`);
      });

      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEmailMatch = form.email.trim() && form.confirmEmail.trim() && form.email.trim().toLowerCase() === form.confirmEmail.trim().toLowerCase();

  if (!directProduct && items.length === 0) {
    return (
      <>
        <Seo title="Checkout" description="Secure checkout for premium digital products. Pay once, download forever with instant email delivery." url="/checkout" />
        <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>??</div>
          <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, color: darkMode ? '#F0F0F0' : '#111', fontSize: 24, marginBottom: 12 }}>
            Nothing to checkout
          </h2>
          <p style={{ color: darkMode ? '#888' : '#666', marginBottom: 28 }}>Your cart is empty. Add products to proceed with checkout.</p>
          <Link to="/" className="btn-primary" style={{ padding: '12px 28px', fontSize: 14, textDecoration: 'none' }}>
            <ShoppingBag size={16} /> Browse Products
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Checkout"
        description="Secure checkout for premium digital products. Pay once, download forever with instant email delivery."
        url="/checkout"
      />
       <div style={{ minHeight: '90vh', background: '#F8F8F8', padding: '24px 24px 60px' }} className="checkout-page-wrapper">
        {/* Breadcrumb */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, color: '#555', fontSize: 13, flexWrap: 'wrap' }} className="checkout-breadcrumb">
        <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>{checkoutPage?.breadcrumbHome || 'Home'}</Link>
        {directProduct ? (
          <>
            <span style={{ color: '#888' }}>/</span>
            <Link to={`/product/${directProduct._id}`} style={{ color: '#555', textDecoration: 'none' }}>Product</Link>
            <span style={{ color: '#888' }}>/</span>
            <span style={{ color: '#FF5000', fontWeight: 700 }}>{checkoutPage?.breadcrumbCheckout || 'Checkout'}</span>
          </>
        ) : (
          <>
            <span style={{ color: '#888' }}>/</span>
            <Link to="/cart" style={{ color: '#555', textDecoration: 'none' }}>{checkoutPage?.breadcrumbCart || 'Cart'}</Link>
            <span style={{ color: '#888' }}>/</span>
            <span style={{ color: '#FF5000', fontWeight: 700 }}>{checkoutPage?.breadcrumbCheckout || 'Checkout'}</span>
          </>
        )}
      </div>

         <div style={{ maxWidth: 1200, margin: '0 auto' }}>
         {/* Header */}
         <div style={{ marginBottom: 32 }} className="checkout-header">
          <div className="accent-line" />
          <h1 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 28, color: '#111', letterSpacing: '-0.5px' }}>
            {directProduct ? (checkoutPage?.quickCheckoutTitle || 'Quick Checkout') : (checkoutPage?.secureCheckoutTitle || 'Secure Checkout')}
          </h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>
            {directProduct ? (checkoutPage?.quickCheckoutSubtitle || 'Complete your purchase for instant access to digital files.') : (checkoutPage?.secureCheckoutSubtitle || 'Complete your purchase to receive instant access to your digital files.')}
          </p>
        </div>

        {savedIndicator && (
          <div style={{
            background: '#F0FFF4', border: '1px solid #BBF7D0',
            borderRadius: 10, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 20, color: '#166534', fontSize: 13, fontWeight: 500,
          }}>
            <CheckCircle2 size={16} color="#22C55E" />
            Welcome back! Your email and phone have been pre-filled. Please enter your name to continue.
          </div>
        )}

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }} className="checkout-layout">
           {/* Form */}
           <form onSubmit={handleSubmit} className="checkout-form">
            <div style={{
              background: '#FFFFFF', border: '1px solid #E5E5E5',
              borderRadius: 20, padding: '32px 30px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 18, color: '#111', marginBottom: 6 }}>
                {checkoutPage?.formTitle || 'Contact & Delivery Details'}
              </h2>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>
                {checkoutPage?.formSubtitle || 'Enter recipient details where files and receipt will be dispatched.'}
              </p>

              {/* Name */}
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label" htmlFor="checkout-name" style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>
                  <User size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#FF5000' }} />
                  Full Name <span style={{ color: '#FF5000' }}>*</span>
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  className="input"
                  placeholder="e.g. John Smith"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ background: '#F5F5F5', border: errors.name ? '1.5px solid #EF4444' : '1.5px solid #E5E5E5', color: '#111' }}
                />
                {errors.name && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label" htmlFor="checkout-email" style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>
                  <Mail size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#FF5000' }} />
                  Email Address <span style={{ color: '#FF5000' }}>*</span>
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  className="input"
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ background: '#F5F5F5', border: errors.email ? '1.5px solid #EF4444' : '1.5px solid #E5E5E5', color: '#111' }}
                />
                {errors.email && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Confirm Email */}
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label" htmlFor="checkout-confirm-email" style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>
                  <Mail size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#FF5000' }} />
                  Confirm Email <span style={{ color: '#FF5000' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="checkout-confirm-email"
                    type="email"
                    className="input"
                    placeholder="Re-enter your email"
                    value={form.confirmEmail}
                    onChange={e => setForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                    required
                    style={{ background: '#F5F5F5', border: errors.confirmEmail ? '1.5px solid #EF4444' : (isEmailMatch ? '1.5px solid #22C55E' : '1.5px solid #E5E5E5'), color: '#111', paddingRight: 36 }}
                  />
                  {isEmailMatch && (
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#22C55E', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                {errors.confirmEmail && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.confirmEmail}</p>}
              </div>



              {/* Phone */}
              <div className="input-group" style={{ marginBottom: 28 }}>
                <label className="input-label" htmlFor="checkout-phone" style={{ color: '#333', fontSize: 13, fontWeight: 600 }}>
                  <Phone size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#FF5000' }} />
                  Phone Number <span style={{ color: '#FF5000' }}>*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  className="input"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ background: '#F5F5F5', border: errors.phone ? '1.5px solid #EF4444' : '1.5px solid #E5E5E5', color: '#111' }}
                />
                {errors.phone && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
              </div>



              <button
                id="pay-now-btn"
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 800, justifyContent: 'center', borderRadius: 14 }}
                disabled={loading}
              >
                {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Processing...</> : <>{checkoutPage?.payButton || 'Proceed to Pay'} {formatPrice(effectiveTotal)} <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>

          {/* Order Summary */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E5E5',
            borderRadius: 20, padding: 28, position: 'sticky', top: 90,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }} className="checkout-summary">
            <h3 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, fontSize: 18, color: '#111', marginBottom: 20 }}>
              <ShoppingBag size={18} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle', color: '#FF5000' }} />
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
              {cartItems.map(item => {
                const price = item.discountPrice && item.discountPrice < item.actualPrice ? item.discountPrice : item.actualPrice;
                return (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #EEEEEE' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#111', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{item.title}</div>
                    </div>
                    <div style={{ color: '#FF5000', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{formatPrice(price)}</div>
                  </div>
                );
              })}
            </div>

            {/* Product Preview - shown below order summary on right side */}
            {cartItems.length > 0 && (
              <div style={{
                marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E5E5',
              }}>
                <p style={{ color: '#666', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  Product Preview
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cartItems.map(item => (
                    <div key={item._id} style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      background: '#FAFAFA',
                      border: '1px solid #EEEEEE',
                      borderRadius: 12,
                      padding: '12px 14px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{item.title}</p>
                      </div>
                      <div style={{ fontWeight: 700, color: '#FF5000', fontSize: 14, flexShrink: 0 }}>
                        {formatPrice(item.discountPrice && item.discountPrice < item.actualPrice ? item.discountPrice : item.actualPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #E5E5E5', marginTop: 16, paddingTop: 18, display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, color: '#111', fontSize: 16 }}>Total Amount</span>
              <span style={{ fontWeight: 800, color: '#FF5000', fontSize: 22 }}>{formatPrice(effectiveTotal)}</span>
            </div>

            {/* {!directProduct && (
              <Link to="/cart" className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '12px 0', textDecoration: 'none' }}>
                ? {checkoutPage?.backToCart || 'Back to Cart'}
              </Link>
            )}
            {directProduct && (
              <Link to={`/product/${directProduct._id}`} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '12px 0', textDecoration: 'none' }}>
                ? {checkoutPage?.backToProduct || 'Back to Product'}
              </Link>
            )} */}


            <div>

            </div>
          </div>
        </div>


        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E5E5',
            borderRadius: 20,
            padding: 28,
            position: 'sticky',
            top: 90,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            marginTop: '20px',
          }}
        >


          {/* Email delivery notice */}
          <div style={{
            background: '#FFF8F4',
            border: '1px solid #FFE4D4',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
            marginBottom: 22
          }}>
            <AlertCircle size={15} color="#FF5000" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ color: '#333', fontSize: 12.5, lineHeight: 1.6 }}>
              <strong style={{ color: '#FF5000' }}>{checkoutNotice?.digitalDeliveryTitle || 'Digital Delivery Guarantee:'}</strong>{' '}
              After successful payment, we will send your project source code, complete documentation, setup guides, and invoice PDF to{' '}
              <strong style={{ color: '#FF5000' }}>{form.email.trim() || 'the email entered above'}</strong>{' '}
              within minutes.
            </div>
          </div>


          {/* Security note */}
          <div style={{
            background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 12,
            padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20,
          }}>
            <ShieldCheck size={18} color="#22C55E" style={{ flexShrink: 0 }} />
            <p style={{ color: '#333', fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
              {checkoutNotice?.securityText || '100% Encrypted Payment via Razorpay. Verified before instant dispatch.'}
            </p>
          </div>

          {/* Email warning */}
          <div style={{
            background: '#FFFBF0', border: '1px solid #FEF3C7',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 24,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>??</span>
            <p style={{ color: '#92400E', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              Please double-check your email address. All project files, documentation links, and invoices will be sent <strong>only</strong> to the email entered above. We are not responsible for delivery failures due to incorrect email addresses.
            </p>
          </div>
        </div>


      </div>

      <style>{`
        @media (max-width: 860px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
          .checkout-summary {
            position: static !important;
          }
        }
        @media (max-width: 768px) {
          .checkout-page-wrapper {
            padding: 16px 16px 40px !important;
          }
          .checkout-breadcrumb {
            font-size: 12px !important;
            margin-bottom: 20px !important;
          }
          .checkout-header {
            margin-bottom: 24px !important;
          }
          .checkout-form > div {
            padding: 20px 16px !important;
          }
          .checkout-summary {
            padding: 20px 16px !important;
          }
        }
        @media (max-width: 480px) {
          .checkout-page-wrapper {
            padding: 12px 10px 32px !important;
          }
          .checkout-form > div {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
          .checkout-summary {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

