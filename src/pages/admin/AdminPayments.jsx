import { useEffect, useState } from 'react';
import { RefreshCw, Eye, Search, CreditCard, CheckCircle2, XCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#22C55E', icon: <CheckCircle2 size={13} /> },
  failed:  { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#EF4444', icon: <XCircle size={13} /> },
  pending: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', color: '#EAB308', icon: <Clock size={13} /> },
};

export default function AdminPayments() {
  const [payments, setPayments]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('success');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [pageSize, setPageSize]     = useState(15);
  const [selected, setSelected]     = useState(null);

  document.title = 'Payments -- SuperUi Admin';

  const loadData = (p = page, s = statusFilter, q = search, limit = pageSize) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: limit });
    if (s) params.append('status', s);
    if (q) params.append('search', q);

    Promise.all([
      api.get(`/admin/orders?${params}`),
      api.get('/admin/orders/stats')
    ])
      .then(([ordersRes, statsRes]) => {
        setPayments(ordersRes.data.orders);
        setTotal(ordersRes.data.total);
        setPages(ordersRes.data.pages);
        setStats(statsRes.data);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to fetch payments data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    loadData(1, newStatus, search);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
    loadData(1, statusFilter, search, newSize);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadData(1, statusFilter, searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
    loadData(1, statusFilter, '');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
             Payments & Transactions <span style={{ color: '#888', fontSize: 18 }}>({payments.length})</span>
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Monitor real-time customer payments, verification state, and gateway transactions
          </p>
        </div>

        <button className="btn-ghost" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => loadData(page, statusFilter, search)}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 18, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Revenue</div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: '#FF5000', marginTop: 4 }}>
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 18, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22C55E', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <CheckCircle2 size={14} /> Successful Payments
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: '#1A1A1A', marginTop: 4 }}>
            {stats?.successOrders || 0}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 18, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EAB308', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <Clock size={14} /> Pending Payments
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: '#1A1A1A', marginTop: 4 }}>
            {stats?.pendingOrders || 0}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 18, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <XCircle size={14} /> Failed Payments
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: '#1A1A1A', marginTop: 4 }}>
            {stats?.failedOrders || 0}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        {/* Status buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: '', label: 'All Payments' },
            { key: 'success', label: 'Success' },
            { key: 'pending', label: 'Pending' },
            { key: 'failed', label: 'Failed' },
          ].map(s => (
            <button
              key={s.key}
              className={statusFilter === s.key ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '8px 16px', fontSize: 12 }}
              onClick={() => handleFilterChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, flex: '1 1 280px', maxWidth: 400 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="input"
              style={{ paddingLeft: 36, paddingRight: 32, fontSize: 13, height: 42, background: '#FFFFFF', border: '2px solid #E5E5E5', color:'black' }}
              placeholder="Search by Order ID, Email, Payment ID..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
            {searchInput && (
              <button
                type="button"
                onClick={handleSearchClear}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#FF5000', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
              >
                ×
              </button>
            )}
          </div>
          <button type="submit" className="btn-ghost" style={{ padding: '0 18px', fontSize: 12, height: 42 }}>
            Search
          </button>
        </form>
      </div>

      {/* Active Filter Title */}
      {(() => {
        const labels = { '': 'All Payments', success: 'Successful Payments', pending: 'Pending Payments', failed: 'Failed Payments' };
        return <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16, color: '#1A1A1A', marginBottom: 16, padding: '8px 16px', background: '#F5F5F5', borderRadius: 8, border: '1px solid #E5E5E5', display: 'inline-block' }}>Showing: {labels[statusFilter] || 'All Payments'}</div>;
      })()}

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
        {loading ? (
          <div className="page-loader" style={{ minHeight: 200 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600, scrollBehavior: 'smooth' }}>
              <table className="table" style={{ minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Products</th>
                    <th>Gateway Payment ID</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Amount Verified</th>
                    <th>Date & Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
               <tbody>
                 {payments.length === 0 && (
                   <tr>
                     <td colSpan={11} style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                       No payment records found matching your filters.
                     </td>
                   </tr>
                 )}
                  {payments.map((p, idx) => {
                   const cfg = STATUS_CONFIG[p.paymentStatus] || STATUS_CONFIG.pending;
                   return (
                      <tr key={p._id}>
                       <td style={{ color: '#666', fontWeight: 600 }}>{(page - 1) * 15 + idx + 1}</td>
                       <td>
                         <code style={{ color: '#FF5000', fontSize: 12, fontWeight: 600 }}>{p.orderId}</code>
                       </td>
                       <td>
                         <div style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 500 }}>{p.customer?.name}</div>
                         <div style={{ color: '#888', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{p.customer?.email}</div>
                       </td>
                       <td>
                         <div style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 500 }}>{p.customer?.phone || '--'}</div>
                       </td>
                       <td>
                         <div style={{ fontSize: 12, maxWidth: 260, overflow: 'hidden' }}>
                           {p.items?.map((item, i) => (
                             <div key={i} style={{ marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                               <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{item.title}</span>
                               {item.categoryName && (
                                 <span style={{ color: '#888', fontSize: 11, marginLeft: 6, background: '#F5F5F5', padding: '1px 6px', borderRadius: 4 }}>{item.categoryName}</span>
                               )}
                             </div>
                           ))}
                         </div>
                        </td>
                       <td>
                         {p.paymentGatewayPaymentId ? (
                           <code style={{ color: '#888', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 220 }}>{p.paymentGatewayPaymentId}</code>
                         ) : (
                           <span style={{ color: '#888', fontSize: 12 }}>--</span>
                         )}
                       </td>
                       <td>
                         <div style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 13 }}>
                           {p.currency} {p.totalAmount?.toFixed(2)}
                         </div>
                       </td>
                       <td>
                         <span
                           style={{
                             display: 'inline-flex',
                             alignItems: 'center',
                             gap: 5,
                             padding: '4px 10px',
                             borderRadius: 6,
                             fontSize: 12,
                             fontWeight: 600,
                             background: cfg.bg,
                             border: `1px solid ${cfg.border}`,
                             color: cfg.color,
                             textTransform: 'capitalize'
                           }}
                         >
                           {cfg.icon} {p.paymentStatus}
                         </span>
                       </td>
                      <td>
                        {p.amountVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22C55E', fontSize: 12, fontWeight: 500 }}>
                            <ShieldCheck size={15} /> Verified
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 12 }}>
                            <ShieldAlert size={15} /> Unverified
                          </span>
                        )}
                      </td>
                      <td style={{ color: '#666', fontSize: 12 }}>
                        {new Date(p.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          className="btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                          onClick={() => setSelected(p)}
                          title="View Payment Detail"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <select value={pageSize} onChange={handlePageSizeChange} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
            <option value="15">15 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
          <button className="btn-ghost" disabled={page === 1} onClick={() => { setPage(page - 1); loadData(page - 1, statusFilter, search); }}>Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={p === page ? 'btn-primary' : 'btn-ghost'}
              style={{ minWidth: 36 }}
              onClick={() => { setPage(p); loadData(p, statusFilter, search); }}
            >
              {p}
            </button>
          ))}
          <button className="btn-ghost" disabled={page === pages} onClick={() => { setPage(page + 1); loadData(page + 1, statusFilter, search); }}>Next</button>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 300, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 600, margin: '40px auto', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 18, padding: '32px 36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,107,0,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Transaction Details</h2>
                  <p style={{ color: '#666', fontSize: 12 }}>Order ID: {selected.orderId}</p>
                </div>
              </div>
               <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 24 }}>×</button>
            </div>

            <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
              {[
                ['Order ID', selected.orderId],
                ['Customer Name', selected.customer?.name],
                ['Customer Email', selected.customer?.email],
                ['Customer Phone', selected.customer?.phone],
                ['Total Amount', `${selected.currency} ${selected.totalAmount?.toFixed(2)}`],
                ['Payment Status', selected.paymentStatus?.toUpperCase()],
                ['Amount Match Verified', selected.amountVerified ? '? Yes (Server Verified)' : '?? Pending / Mismatch'],
                ['Gateway Order ID', selected.paymentGatewayOrderId || '--'],
                ['Gateway Payment ID', selected.paymentGatewayPaymentId || '--'],
                ['Delivery Email Sent', selected.deliveryEmailSent ? '? Yes' : '? Not Sent / Failed'],
                ['Created At', new Date(selected.createdAt).toLocaleString('en-IN')],
                ['Updated At', new Date(selected.updatedAt).toLocaleString('en-IN')],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #E5E5E5' }}>
                  <span style={{ color: '#666' }}>{label}</span>
                  <span style={{ color: '#1A1A1A', textAlign: 'right', wordBreak: 'break-all', fontWeight: label === 'Total Amount' ? 700 : 400 }}>{val}</span>
                </div>
              ))}
            </div>

             {selected.items?.length > 0 && (
               <div style={{ marginTop: 20 }}>
                 <p style={{ color: '#666', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>Purchased Products</p>
                 <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 10, padding: 12 }}>
                   {selected.items.map((item, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', color: '#1A1A1A', fontSize: 13 }}>
                       <div>
                         <span style={{ fontWeight: 500 }}>{item.title}</span>
                         {item.categoryName && (
                           <span style={{ color: '#888', fontSize: 11, marginLeft: 8, background: '#FFFFFF', padding: '1px 6px', borderRadius: 4, border: '1px solid #E5E5E5' }}>{item.categoryName}</span>
                         )}
                       </div>
                       <span style={{ color: '#FF5000', fontWeight: 600 }}>{selected.currency} {item.price?.toFixed(2)}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

            <button className="btn-ghost" style={{ width: '100%', marginTop: 24 }} onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

