import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, Star, ShoppingBag, CreditCard, MailCheck, LogOut, Zap, Menu, Search, Bell, ChevronDown, Home, User, FileText, Briefcase, Users, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../hooks/useSiteContent';
import { getLogoHtml } from '../../components/common/Logo';
import Seo from '../../components/common/Seo';
import { useSocket } from '../../hooks/useSocket';
import { useNotifications } from '../../contexts/NotificationContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/pages', label: 'Pages', icon: <FileText size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <Tag size={18} /> },
  { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { to: '/admin/featured', label: 'Featured', icon: <Star size={18} /> },
  { to: '/admin/portfolio', label: 'Portfolio', icon: <Briefcase size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  { to: '/admin/counts', label: 'Counts', icon: <Users size={18} /> },
  { to: '/admin/subscribers', label: 'Subscribers', icon: <Mail size={18} /> },
  { to: '/admin/payments', label: 'Payments', icon: <CreditCard size={18} /> },
  { to: '/admin/email-deliveries', label: 'Email Deliveries', icon: <MailCheck size={18} /> },
];

export default function AdminLayout() {
  const { logout } = useAdminStore();
  const navigate = useNavigate();
  const { data: brandData } = useSiteContent('brand');
  const token = useAdminStore(s => s.token);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const [adminProfile, setAdminProfile] = useState({ username: '', email: '', role: '' });

  useSocket(token, (event, data) => {
    addNotification(event, data);
    toast.success(`${event.replace(/_/g, ' ')} -- check notifications`);
  });

  useEffect(() => {
     const fetchProfile = async () => {
       try {
         const res = await api.get('/admin/profile');
         if (res.data) {
            const prof = {
               username: res.data.username || res.data.name || 'Admin',
               email: res.data.email || 'admin@SuperUi.com',
               role: res.data.role || 'Administrator',
            };
           setAdminProfile(prof);
         }
       } catch (err) {
         console.warn('Profile fetch failed:', err.message);
       }
     };
     fetchProfile();

     const handleProfileUpdate = (e) => {
       if (e.detail) {
         setAdminProfile(prev => ({ ...prev, ...e.detail }));
       }
     };
     window.addEventListener('admin-profile-updated', handleProfileUpdate);
     return () => window.removeEventListener('admin-profile-updated', handleProfileUpdate);
   }, []);

  const handleLogout = async () => {
    try { await api.post('/admin/logout'); } catch {}
    logout();
    navigate('/admin/login');
    toast.success('Logged out');
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleDateString('en-IN');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarLetter = adminProfile.username ? adminProfile.username.charAt(0).toUpperCase() : 'A';

  const Sidebar = () => (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#FFFFFF',
      borderRight: '1px solid #E5E5E5',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '20px 20px', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', gap: 8 }}>
        {getLogoHtml(brandData, { variant: 'navbar', darkMode: false, fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: "'Space Grotesk', sans-serif" })}
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px',
              borderRadius: 10,
              marginBottom: 4,
              textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              color: isActive ? '#22C55E' : '#666',
              background: isActive ? '#22C55E18' : 'transparent',
              transition: 'all 0.2s',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255,107,0,0.06)';
                e.currentTarget.style.color = '#FF5000';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            {icon} {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid #E5E5E5' }}>
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '11px 14px',
            background: 'none', border: 'none',
            borderRadius: 10, cursor: 'pointer',
            color: '#666', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <Seo title="Admin -- SuperUi" description="SuperUi Admin Panel" noindex />
      <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF' }}>
      <div className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 1 }}><Sidebar /></div>
        </div>
      )}

      <div className="admin-body-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="admin-navbar" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', borderBottom: '1px solid #E5E5E5', gap: 16,
          background: '#FFFFFF',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 600 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="admin-hamburger"
              style={{ display: 'none', background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; e.currentTarget.style.color = '#FF5000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666'; }}
            >
              <Menu size={22} />
            </button>
            <div ref={searchRef} style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate('/admin/products');
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {}}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1.5px solid #E5E5E5', borderRadius: 10,
                  fontSize: 13, background: '#F5F5F5', color: '#1A1A1A', outline: 'none',
                  transition: 'all 0.2s',
                }}
              />
              {showSuggestions && searchQuery.trim() && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden',
                }}>
                  {navItems
                    .filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(item => (
                      <div
                        key={item.to}
                        onMouseDown={e => {
                          e.preventDefault();
                          navigate(item.to);
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', cursor: 'pointer',
                          borderBottom: '1px solid #F5F5F5',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF5EE'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                      >
                        <span style={{ color: '#FF5000', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{item.label}</span>
                      </div>
                    ))}
                  {navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div style={{ padding: '12px 14px', fontSize: 13, color: '#999' }}>No matching pages found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAllRead(); }}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  padding: 8, borderRadius: 8, cursor: 'pointer',
                  color: '#666', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; e.currentTarget.style.color = '#FF5000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666'; }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: '#EF4444', color: 'white',
                    fontSize: 10, fontWeight: 700,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 360, maxHeight: 420,
                  background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '14px 16px', borderBottom: '1px solid #E5E5E5',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14 }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#FF5000', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>No new notifications</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{
                          padding: '12px 16px', borderBottom: '1px solid #F5F5F5',
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                          background: notif.read ? '#FFF' : '#FFFBF7',
                        }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                            background: notif.type === 'success' ? '#22C55E' : notif.type === 'warning' ? '#EAB308' : notif.type === 'error' ? '#EF4444' : '#FF5000',
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{notif.title}</div>
                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{notif.message}</div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{formatTime(notif.timestamp)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => window.open('/', '_blank')}
              style={{
                background: 'none', border: 'none', padding: 8, borderRadius: 8,
                cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; e.currentTarget.style.color = '#FF5000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666'; }}
              title="Open Store"
            >
              <Home size={20} />
            </button>

            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', padding: '4px 8px',
                  borderRadius: 8, cursor: 'pointer', color: '#1A1A1A', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#FF5000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, fontSize: 13,
                }}>{avatarLetter}</div>
                <span className="admin-navbar-username" style={{ fontSize: 13, fontWeight: 500 }}>{adminProfile.username}</span>
                <ChevronDown size={14} />
              </button>

              {showProfile && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220, background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5' }}>
                    <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14 }}>{adminProfile.username}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{adminProfile.email}</div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setShowProfile(false); }}
                    style={{
                      width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                      borderTop: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 8,
                      cursor: 'pointer', color: '#EF4444', fontSize: 13, textAlign: 'left',
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <main style={{ flex: 1, padding: '28px 28px', overflow: 'auto' }} className="admin-main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 240px;
          z-index: 100;
        }
        .admin-body-container {
          padding-left: 240px;
        }
        @media (max-width: 900px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-body-container { padding-left: 0 !important; }
          .admin-navbar { display: flex !important; }
          .admin-hamburger { display: flex !important; }
          .admin-navbar-username { display: none !important; }
        }
        @media (max-width: 768px) {
          .admin-navbar {
            padding: 10px 16px !important;
          }
          .admin-main-content {
            padding: 20px 16px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-navbar {
            padding: 8px 10px !important;
          }
          .admin-main-content {
            padding: 14px 10px !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

