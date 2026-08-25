import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import { useSiteContent } from '../../hooks/useSiteContent';
import { getLogoHtml } from '../../components/common/Logo';
import api from '../../api/axiosInstance';

export default function Footer() {
  const { darkMode } = useThemeStore();
  const { data: footerContent } = useSiteContent('footer');
  const { data: brandData } = useSiteContent('brand');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [submitting, setSubmitting] = useState(false);

  const brandName = brandData?.brandName || 'SuperUi';
  const tagline = footerContent?.tagline || 'Premium digital products, ready-made websites, and UI components built to ship faster.';
  const supportEmail = footerContent?.supportEmail || 'hello@superui.in';

  const linkGroups = footerContent?.linkGroups?.length ? footerContent.linkGroups : [
    {
      title: 'Menu',
      links: [
        { label: 'Home', to: '/' },
        { label: 'Websites', to: '/category/all' },
        { label: 'Portfolio', to: '/portfolio' },
        { label: 'Contact', to: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Customer Portal', to: '/order/status' },
        { label: 'Track Order', to: '/order/status' },
        { label: 'Privacy Policy', to: '/contact' },
        { label: 'Terms of Service', to: '/contact' },
      ],
    },
    {
      title: 'Top Categories',
      links: [
        { label: 'Admin Dashboards', to: '/category/all?q=Dashboard' },
        { label: 'UI Components', to: '/category/all?q=UI' },
        { label: 'SaaS Templates', to: '/category/all?q=SaaS' },
        { label: 'E-commerce', to: '/category/all?q=E-commerce' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Custom Designs', to: '/contact' },
        { label: 'Custom Portfolio Design', to: '/contact' },
        { label: 'Service Support (Changes)', to: '/contact' },
        { label: 'Paid Hosting Support', to: '/contact' },
      ],
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const { data } = await api.post('/subscribe', { email: email.trim() });
      setStatus({ type: 'success', msg: data.message || 'Thank you for subscribing!' });
      setEmail('');
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Subscription failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bg = darkMode ? '#0A0A0C' : '#FAFAFA';
  const border = darkMode ? '#1F1F24' : '#E5E5EB';
  const textMain = darkMode ? '#FFFFFF' : '#111827';
  const textMuted = darkMode ? '#9CA3AF' : '#4B5563';
  const accentColor = '#FF5000';

  return (
    <footer
      style={{
        background: bg,
        borderTop: `1px solid ${border}`,
        padding: '80px 0 50px',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      <div className="site-container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Top Footer Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `1.5fr ${Array(linkGroups.length + 1).fill('1fr').join(' ')}`,
            gap: 48,
            marginBottom: 60,
          }}
          className="footer-grid"
        >
          {/* Brand & Newsletter Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              {getLogoHtml(brandData, { variant: 'footer', darkMode, fontSize: 20, fontWeight: 800 })}
            </Link>

            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: textMuted, margin: 0, maxWidth: 320 }}>
              {tagline}
            </p>

            {/* Newsletter Input Form */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: textMain, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                Subscribe to Newsletter
              </div>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: `1.5px solid ${border}`,
                    background: darkMode ? '#151518' : '#FFFFFF',
                    color: textMain,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = border)}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: accentColor,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {submitting ? (
                    <div style={{ width: 14, height: 14, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <ArrowRight size={15} />
                  )}
                </button>
              </form>

              {/* Status Message */}
              {status.msg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    marginTop: 8,
                    color: status.type === 'success' ? '#22C55E' : '#EF4444',
                    fontWeight: 600,
                  }}
                >
                  {status.type === 'success' && <CheckCircle size={13} />}
                  <span>{status.msg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links Columns */}
          {linkGroups.map((group, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4
                style={{
                  color: textMain,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 13.5,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {group.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {group.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.to}
                    style={{
                      color: textMuted,
                      textDecoration: 'none',
                      fontSize: 13.5,
                      fontWeight: 500,
                      transition: 'color 0.2s, padding-left 0.2s',
                      width: 'fit-content',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = accentColor;
                      e.currentTarget.style.paddingLeft = '3px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = textMuted;
                      e.currentTarget.style.paddingLeft = '0px';
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Social Media Links Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4
              style={{
                color: textMain,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 13.5,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Follow Us
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <a
                href={footerContent?.socialLinks?.[0]?.url || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: darkMode ? '#1A1A1E' : '#EFEFEF',
                  color: textMuted,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? '#1A1A1E' : '#EFEFEF'; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
              </a>
              <a
                href={footerContent?.socialLinks?.[1]?.url || "https://x.com"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: darkMode ? '#1A1A1E' : '#EFEFEF',
                  color: textMuted,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? '#1A1A1E' : '#EFEFEF'; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: darkMode ? '#1A1A1E' : '#EFEFEF',
                  color: textMuted,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? '#1A1A1E' : '#EFEFEF'; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: darkMode ? '#1A1A1E' : '#EFEFEF',
                  color: textMuted,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? '#1A1A1E' : '#EFEFEF'; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: darkMode ? '#1A1A1E' : '#EFEFEF',
                  color: textMuted,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? '#1A1A1E' : '#EFEFEF'; e.currentTarget.style.color = textMuted; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider Border Line */}
        <div style={{ height: 1, background: border, width: '100%', marginBottom: 30 }} />

        {/* Bottom Footer Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
          className="footer-bottom"
        >
          <div style={{ fontSize: 13, color: textMuted }}>
            © {new Date().getFullYear()} {brandName}. Built with 🧡 for professional developers.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13 }}>
            <a
              href={`mailto:${supportEmail}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: textMuted,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
            >
              <Mail size={14} />
              <span>{supportEmail}</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 500px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}
