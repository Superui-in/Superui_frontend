import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

// Public layout + pages
import Navbar        from './components/layout/Navbar';
import Footer        from './components/layout/Footer';
import Home          from './pages/Home';
import CategoryPage  from './pages/CategoryPage';
import ProductPage   from './pages/ProductPage';
import CartPage      from './pages/CartPage';
import CheckoutPage  from './pages/CheckoutPage';
import OrderStatus   from './pages/OrderStatus';
import ContactPage   from './pages/ContactPage';
import PortfolioPage from './pages/PortfolioPage';

// Admin pages
import AdminLogin          from './pages/admin/AdminLogin';
import AdminLayout         from './pages/admin/AdminLayout';
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminPages          from './pages/admin/AdminPages';
import AdminCategories     from './pages/admin/AdminCategories';
import AdminProducts       from './pages/admin/AdminProducts';
import AdminFeatured       from './pages/admin/AdminFeatured';
import AdminPortfolio      from './pages/admin/AdminPortfolio';
import AdminOrders         from './pages/admin/AdminOrders';
import AdminCounts         from './pages/admin/AdminCounts';
import AdminSubscribers    from './pages/admin/AdminSubscribers';
import AdminPayments       from './pages/admin/AdminPayments';
import AdminEmailDeliveries from './pages/admin/AdminEmailDeliveries';
import ErrorBoundary from './components/common/ErrorBoundary';

// Admin route guard + notifications
import useAdminStore from './store/adminStore';
import { NotificationProvider } from './contexts/NotificationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAdmin({ children }) {
  const token = useAdminStore(s => s.token);
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

// Public layout wrapper
function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E1E1E',
              color: '#F0F0F0',
              border: '1px solid #2A2A2A',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#FF5000', secondary: '#fff' } },
          }}
        />
        <ErrorBoundary>
          <Routes>
          {/* Public routes */}
          <Route path="/"               element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
          <Route path="/product/:id"    element={<PublicLayout><ProductPage /></PublicLayout>} />
          <Route path="/cart"           element={<PublicLayout><CartPage /></PublicLayout>} />
          <Route path="/checkout"       element={<PublicLayout><CheckoutPage /></PublicLayout>} />
          <Route path="/order/:orderId" element={<PublicLayout><OrderStatus /></PublicLayout>} />
          <Route path="/contact"        element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/portfolio"      element={<PublicLayout><PortfolioPage /></PublicLayout>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><NotificationProvider><AdminLayout /></NotificationProvider></RequireAdmin>}>
            <Route index                   element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"        element={<AdminDashboard />} />
            <Route path="pages"            element={<AdminPages />} />
            <Route path="categories"       element={<AdminCategories />} />
            <Route path="products"         element={<AdminProducts />} />
            <Route path="featured"         element={<AdminFeatured />} />
            <Route path="portfolio"        element={<AdminPortfolio />} />
            <Route path="orders"           element={<AdminOrders />} />
            <Route path="counts"           element={<AdminCounts />} />
            <Route path="subscribers"      element={<AdminSubscribers />} />
            <Route path="payments"         element={<AdminPayments />} />
            <Route path="email-deliveries" element={<AdminEmailDeliveries />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div style={{ textAlign: 'center', padding: '120px 20px' }}>
                <h1 style={{ fontSize: 72, color: '#FF5000', fontFamily: 'Space Grotesk' }}>404</h1>
                <p style={{ color: '#888', marginTop: 8 }}>Page not found</p>
              </div>
            </PublicLayout>
          } />
        </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
