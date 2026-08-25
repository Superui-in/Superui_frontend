import { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingBag, Clock, Package,
  CheckCircle2, AlertCircle, Bell, ArrowRight, Activity, CircleDot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Seo from '../../components/common/Seo';
import { useSocket } from '../../hooks/useSocket';
import useAdminStore from '../../store/adminStore';

export default function AdminDashboard() {
  const token = useAdminStore(s => s.token);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useSocket(token, (event, data) => {
    if (event === 'payment_success' || event === 'payment_failed' || event === 'payment_pending') {
      api.get('/admin/orders/stats').then(res => setStats(res.data)).catch(() => {});
      api.get('/admin/orders?limit=8').then(res => setRecentOrders(res.data?.orders || [])).catch(() => {});
    }
    if (event === 'new_order') {
      api.get('/admin/orders?limit=8').then(res => setRecentOrders(res.data?.orders || [])).catch(() => {});
    }
  });

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    Promise.all([
      api.get('/admin/orders/stats'),
      api.get('/admin/orders?limit=8')
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data?.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Revenue', value: `₹ ${stats.totalRevenue?.toFixed(2) || '0.00'}`, icon: <TrendingUp size={22} />, color: '#FF5000' },
    { label: 'Total Orders',  value: stats.successOrders || 0, icon: <ShoppingBag size={22} />, color: '#22C55E' },
    { label: 'Pending',       value: stats.pendingOrders || 0, icon: <Clock size={22} />,        color: '#F59E0B' },
    { label: 'Total Products', value: stats.totalProducts || 0, icon: <Package size={22} />,      color: '#3B82F6' },
  ] : [];

  // Order distribution calculation for Chart
  const successCount = stats?.successOrders || 0;
  const pendingCount = stats?.pendingOrders || 0;
  const failedCount  = stats?.failedOrders  || 0;
  const totalChartOrders = successCount + pendingCount + failedCount;

  const successPct = totalChartOrders > 0 ? ((successCount / totalChartOrders) * 100).toFixed(1) : '0';
  const pendingPct = totalChartOrders > 0 ? ((pendingCount / totalChartOrders) * 100).toFixed(1) : '0';
  const failedPct  = totalChartOrders > 0 ? ((failedCount  / totalChartOrders) * 100).toFixed(1) : '0';

  // SVG Donut Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const successOffset = 0;
  const successDash = totalChartOrders > 0 ? (successCount / totalChartOrders) * circumference : 0;
  const pendingOffset = -successDash;
  const pendingDash = totalChartOrders > 0 ? (pendingCount / totalChartOrders) * circumference : 0;
  const failedOffset = -(successDash + pendingDash);
  const failedDash = totalChartOrders > 0 ? (failedCount / totalChartOrders) * circumference : 0;

  return (
    <>
      <Seo title="Dashboard -- SuperUi Admin" noindex />
      <div style={{ width: '100%', paddingBottom: 40 }} className="admin-dashboard-wrapper">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="accent-line" />
        <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 26, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          Overview of store performance, orders distribution, and real-time activity.
        </p>
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 38, height: 38 }} />
        </div>
      ) : (
        <>
          {/* Top 4 Stat Cards */}
          <div style={{ display: 'grid', gap: 20, marginBottom: 32 }} className="admin-stat-cards">
            {statCards.map(({ label, value, icon, color }) => (
              <div key={label} style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 16,
                padding: '22px 24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${color}16`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color,
                  }}>
                    {icon}
                  </div>
                  <span style={{ color: '#666', fontSize: 13, fontWeight: 600 }}>{label}</span>
                </div>
                <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 30, color: '#1A1A1A' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* -- NEW SECTION: CHART GRAPH (LEFT) & NOTIFICATIONS (RIGHT) -- */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }} className="dashboard-grid-charts">

            {/* Left: Orders Status Chart Graph */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: 20,
              padding: '26px 28px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#F5F5F5', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 6 }}>
                    <Activity size={12} color="#FF5000" /> ORDER ANALYTICS
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 19, color: '#1A1A1A' }}>
                    Order Status Breakdown
                  </h2>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>
                  Total: <span style={{ color: '#111' }}>{totalChartOrders}</span>
                </div>
              </div>

              {/* Donut Chart Visual */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 0',
                position: 'relative',
              }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle
                    cx="90" cy="90" r={radius}
                    fill="transparent"
                    stroke="#F3F4F6"
                    strokeWidth="16"
                  />
                  {totalChartOrders > 0 ? (
                    <>
                      {/* Success Segment */}
                      {successDash > 0 && (
                        <circle
                          cx="90" cy="90" r={radius}
                          fill="transparent"
                          stroke="#22C55E"
                          strokeWidth="16"
                          strokeDasharray={`${successDash} ${circumference}`}
                          strokeDashoffset={successOffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      )}
                      {/* Pending Segment */}
                      {pendingDash > 0 && (
                        <circle
                          cx="90" cy="90" r={radius}
                          fill="transparent"
                          stroke="#F59E0B"
                          strokeWidth="16"
                          strokeDasharray={`${pendingDash} ${circumference}`}
                          strokeDashoffset={pendingOffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      )}
                      {/* Failed Segment */}
                      {failedDash > 0 && (
                        <circle
                          cx="90" cy="90" r={radius}
                          fill="transparent"
                          stroke="#EF4444"
                          strokeWidth="16"
                          strokeDasharray={`${failedDash} ${circumference}`}
                          strokeDashoffset={failedOffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      )}
                    </>
                  ) : (
                    <circle
                      cx="90" cy="90" r={radius}
                      fill="transparent"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                    />
                  )}
                </svg>

                {/* Center Label */}
                <div style={{
                  position: 'absolute',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 26, color: '#111' }}>
                    {totalChartOrders}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Orders
                  </div>
                </div>
              </div>

              {/* Progress Bars & Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                {/* Success Orders */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
                      <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Success Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: '#22C55E' }}>{successCount}</span>
                      <span style={{ fontSize: 12, color: '#888', minWidth: 42, textAlign: 'right' }}>{successPct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#F0FDF4', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${successPct}%`, height: '100%', background: '#22C55E', borderRadius: 10, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Pending Orders */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                      <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Pending Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: '#F59E0B' }}>{pendingCount}</span>
                      <span style={{ fontSize: 12, color: '#888', minWidth: 42, textAlign: 'right' }}>{pendingPct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#FFFBEB', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${pendingPct}%`, height: '100%', background: '#F59E0B', borderRadius: 10, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* Failed Orders */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                      <span style={{ fontWeight: 600, color: '#1A1A1A' }}>Failed Orders</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, color: '#EF4444' }}>{failedCount}</span>
                      <span style={{ fontSize: 12, color: '#888', minWidth: 42, textAlign: 'right' }}>{failedPct}%</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#FEF2F2', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${failedPct}%`, height: '100%', background: '#EF4444', borderRadius: 10, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Notifications & Recent Activity Stream */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: 20,
              padding: '26px 28px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#F0FDF4', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    LIVE ACTIVITY
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 19, color: '#1A1A1A' }}>
                    Notifications & Orders
                  </h2>
                </div>
                <Link
                  to="/admin/orders"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12.5, fontWeight: 700, color: '#FF5000',
                    textDecoration: 'none',
                  }}
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {/* Notification / Activity List */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                maxHeight: 380,
                overflowY: 'auto',
                paddingRight: 4,
              }}>
                {recentOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p style={{ fontSize: 14 }}>No recent notifications yet.</p>
                  </div>
                ) : (
                  recentOrders.map(order => {
                    const isSuccess = order.paymentStatus === 'success';
                    const isPending = order.paymentStatus === 'pending';
                    const isFailed  = order.paymentStatus === 'failed';

                    const badgeBg = isSuccess ? '#ECFDF5' : isPending ? '#FFFBEB' : '#FEF2F2';
                    const badgeColor = isSuccess ? '#059669' : isPending ? '#D97706' : '#DC2626';
                    const statusText = isSuccess ? 'Success' : isPending ? 'Pending' : 'Failed';

                    return (
                      <div
                        key={order._id || order.orderId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '12px 14px',
                          background: '#FAFAFA',
                          border: '1px solid #EEEEEE',
                          borderRadius: 12,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: badgeBg, color: badgeColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {isSuccess ? <CheckCircle2 size={18} /> : isPending ? <Clock size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {order.customer?.name || 'Customer'}
                              </span>
                              <span style={{
                                fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                                background: badgeBg, color: badgeColor, textTransform: 'uppercase',
                              }}>
                                {statusText}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: '#777', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span>#{order.orderId}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: isSuccess ? '#22C55E' : '#1A1A1A' }}>
                            ₹{Number(order.totalAmount || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Best Selling Products Table */}
          {stats?.bestSelling?.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 20, padding: '26px 28px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 19, color: '#1A1A1A' }}>
                    🏆 Best Selling Products
                  </h2>
                  <p style={{ color: '#777', fontSize: 13, marginTop: 2 }}>
                    Top performing digital templates & tools ranked by sales volume.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 500, scrollBehavior: 'smooth', borderRadius: 12, border: '1px solid #E5E5E5' }}>
                <table className="table" style={{ minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Sales Count</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bestSelling.map((item, i) => (
                      <tr key={item._id}>
                        <td style={{ color: '#FF5000', fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#111' }}>{item.title || 'Unknown'}</td>
                        <td><span className="badge badge-primary">{item.count} sales</span></td>
                        <td style={{ color: '#22C55E', fontWeight: 700 }}>₹ {item.revenue?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .admin-stat-cards {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (min-width: 1100px) {
          .admin-stat-cards {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 567px) and (max-width: 1099px) {
          .admin-stat-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 566px) {
          .admin-stat-cards {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @media (max-width: 960px) {
          .dashboard-grid-charts {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .admin-dashboard-wrapper {
            padding-bottom: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-dashboard-wrapper {
            padding-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

