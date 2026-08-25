import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Send, AlertTriangle, CheckCircle2, Clock, FileText, Download, ShieldCheck, XCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import useAdminStore from '../../store/adminStore';

export default function AdminEmailDeliveries() {
  const token = useAdminStore(s => s.token);
  const [activeTab, setActiveTab]       = useState('pending');
  const [undelivered, setUndelivered]   = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [logsTotal, setLogsTotal]       = useState(0);
  const [logsPage, setLogsPage]         = useState(1);
  const [logsPages, setLogsPages]       = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(15);
  const [loading, setLoading]           = useState(true);
  const [resendingId, setResendingId]   = useState(null);
  const [resendingAll, setResendingAll] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendOrderId, setResendOrderId] = useState(null);
  const [resendEmail, setResendEmail] = useState('');

  useSocket(token, (event, data) => {
    if (event === 'email_dispatched' || event === 'batch_email_dispatched') {
      loadUndelivered();
    }
  });

  const [pendingPage, setPendingPage]   = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingPageSize, setPendingPageSize] = useState(15);

  document.title = 'Document Deliveries -- SuperUi Admin';

  const loadUndelivered = () => {
    setLoading(true);
    api.get('/admin/orders/undelivered-emails')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setUndelivered(data);
        setPendingTotal(data.length);
        setPendingPages(Math.ceil(data.length / pendingPageSize));
        if (pendingPage > Math.ceil(data.length / pendingPageSize)) {
          setPendingPage(1);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load pending document deliveries');
      })
      .finally(() => setLoading(false));
  };

  const loadLogs = (page = 1, limit = logsPageSize) => {
    setLoading(true);
    api.get(`/admin/orders/email-logs?page=${page}&limit=${limit}`)
      .then(res => {
        setLogs(res.data.logs);
        setLogsTotal(res.data.total);
        setLogsPages(res.data.pages);
        setLogsPage(res.data.page);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load email logs');
      })
      .finally(() => setLoading(false));
  };

  const handlePendingPageSizeChange = (e) => {
    setPendingPageSize(Number(e.target.value));
    setPendingPage(1);
  };

  const handleLogsPageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setLogsPageSize(newSize);
    setLogsPage(1);
    loadLogs(1, newSize);
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      loadUndelivered();
    } else {
      loadLogs(logsPage);
    }
  }, [activeTab]);

  const handleResendSingle = async (orderId, customEmail) => {
    setResendingId(orderId);
    try {
      const payload = {};
      if (customEmail && customEmail.trim()) {
        payload.email = customEmail.trim();
      }
      const res = await api.post(`/admin/orders/${orderId}/resend-email`, payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Delivery email dispatched!');
      } else {
        toast.error(res.data.message || 'Delivery failed');
      }
      setShowResendModal(false);
      setResendOrderId(null);
      setResendEmail('');
      loadUndelivered();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending delivery email');
    } finally {
      setResendingId(null);
    }
  };

  const openResendModal = (orderId, currentEmail) => {
    setResendOrderId(orderId);
    setResendEmail(currentEmail || '');
    setShowResendModal(true);
  };

  const handleResendAll = async () => {
    if (undelivered.length === 0) return;
    if (!window.confirm(`Attempt to dispatch documents & invoices for all ${undelivered.length} pending orders?`)) return;

    setResendingAll(true);
    try {
      const res = await api.post('/admin/orders/resend-all-undelivered');
      toast.success(res.data.message);
      loadUndelivered();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Batch delivery failed');
    } finally {
      setResendingAll(false);
    }
  };

  const paginatedPending = undelivered.slice((pendingPage - 1) * pendingPageSize, pendingPage * pendingPageSize);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
            Email & Document Deliveries
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Manage digital product delivery emails, track dispatch failures, and retry document transmissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'pending' && undelivered.length > 0 && (
            <button
              className="btn-primary"
              onClick={handleResendAll}
              disabled={resendingAll}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', fontSize: 13 }}
            >
              {resendingAll ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={14} />}
              Dispatch All Pending ({undelivered.length})
            </button>
          )}

          <button
            className="btn-ghost"
            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => activeTab === 'pending' ? loadUndelivered() : loadLogs(logsPage)}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid #E5E5E5', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: activeTab === 'pending' ? 'rgba(255,107,0,0.12)' : 'transparent',
            border: activeTab === 'pending' ? '1px solid rgba(255,107,0,0.4)' : '1px solid transparent',
             color: activeTab === 'pending' ? '#FF5000' : '#666',
            padding: '10px 18px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <AlertTriangle size={15} color={activeTab === 'pending' ? '#FF5000' : '#666'} />
          Pending / Undelivered Documents
          {undelivered.length > 0 && (
            <span style={{
              background: '#EF4444',
              color: 'white',
              borderRadius: '999px',
              padding: '2px 7px',
              fontSize: 11,
              fontWeight: 700
            }}>
              {undelivered.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          style={{
            background: activeTab === 'logs' ? 'rgba(255,107,0,0.12)' : 'transparent',
            border: activeTab === 'logs' ? '1px solid rgba(255,107,0,0.4)' : '1px solid transparent',
             color: activeTab === 'logs' ? '#FF5000' : '#666',
            padding: '10px 18px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <Mail size={15} color={activeTab === 'logs' ? '#FF5000' : '#666'} />
          All Email Logs History
        </button>
      </div>

      {/* Tab 1: Pending & Undelivered */}
      {activeTab === 'pending' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}>
              <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
          ) : undelivered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(34,197,94,0.1)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, color: '#1A1A1A', marginBottom: 6 }}>All Documents Dispatched!</h3>
              <p style={{ color: '#666', fontSize: 13, maxWidth: 420, margin: '0 auto' }}>
                There are no paid orders waiting for email delivery. All successful customers have received their digital product files and invoices.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 500, scrollBehavior: 'smooth' }}>
              <div style={{ padding: '16px 20px', background: 'rgba(234,179,8,0.06)', borderBottom: '1px solid rgba(234,179,8,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={16} color="#EAB308" />
                <span style={{ fontSize: 13, color: '#EAB308', fontWeight: 500 }}>
                  These verified paid orders have not had their confirmation email & download links sent. Click <strong>Dispatch Files</strong> to deliver.
                </span>
              </div>

              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16, color: '#1A1A1A', marginBottom: 16, padding: '8px 16px', background: '#F5F5F5', borderRadius: 8, border: '1px solid #E5E5E5', display: 'inline-block' }}>
                Showing: Pending / Undelivered Documents
              </div>
              <table className="table" style={{ minWidth: 900 }}>
                 <thead>
                   <tr>
                     <th>S.No</th>
                     <th>Order ID</th>
                     <th>Customer</th>
                     <th>Items Purchased</th>
                     <th>Amount Paid</th>
                     <th>Payment Status</th>
                     <th>Order Date</th>
                     <th>Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {paginatedPending.map((order, idx) => (
                     <tr key={order._id}>
                       <td style={{ color: '#666', fontWeight: 600 }}>{(pendingPage - 1) * pendingPageSize + idx + 1}</td>
                      <td>
                        <code style={{ color: '#FF5000', fontSize: 12, fontWeight: 600 }}>{order.orderId}</code>
                      </td>
                      <td>
                        <div style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 500 }}>{order.customer?.name}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>{order.customer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: '#1A1A1A' }}>
                          {order.items?.map((it, idx) => (
                            <div key={idx}>• {it.title}</div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 13 }}>
                          {order.currency} {order.totalAmount?.toFixed(2)}
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: 11, fontWeight: 600 }}>
                          <ShieldCheck size={12} /> PAID
                        </span>
                      </td>
                      <td style={{ color: '#666', fontSize: 12 }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td>
                          <button
                            className="btn-primary"
                            style={{ padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => openResendModal(order.orderId, order.customer?.email)}
                            disabled={resendingId === order.orderId}
                          >
                            {resendingId === order.orderId ? (
                              <div className="spinner" style={{ width: 12, height: 12 }} />
                            ) : (
                              <Send size={12} />
                            )}
                            Dispatch Files
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

               {/* Pending pagination */}
                {pendingPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderTop: '1px solid #E5E5E5', flexWrap: 'wrap' }}>
                    <select value={pendingPageSize} onChange={handlePendingPageSizeChange} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
                      <option value="15">15 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                    </select>
                    <button className="btn-ghost" disabled={pendingPage === 1} onClick={() => setPendingPage(pendingPage - 1)}>Prev</button>
                   {Array.from({ length: pendingPages }, (_, i) => i + 1).map(p => (
                     <button
                       key={p}
                       className={p === pendingPage ? 'btn-primary' : 'btn-ghost'}
                       style={{ minWidth: 34 }}
                       onClick={() => setPendingPage(p)}
                     >
                       {p}
                     </button>
                   ))}
                   <button className="btn-ghost" disabled={pendingPage === pendingPages} onClick={() => setPendingPage(pendingPage + 1)}>Next</button>
                 </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Email Logs */}
      {activeTab === 'logs' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}>
              <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 500, scrollBehavior: 'smooth' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16, color: '#1A1A1A', marginBottom: 16, padding: '8px 16px', background: '#F5F5F5', borderRadius: 8, border: '1px solid #E5E5E5', display: 'inline-block' }}>
                Showing: Email Logs History
              </div>
                <table className="table" style={{ minWidth: 1000 }}>
                 <thead>
                   <tr>
                     <th>S.No</th>
                     <th>Time</th>
                     <th>Order ID</th>
                     <th>Recipient</th>
                     <th>Type</th>
                     <th>Subject</th>
                     <th>Status</th>
                     <th>Details</th>
                   </tr>
                 </thead>
                 <tbody>
                   {logs.length === 0 && (
                     <tr>
                       <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                        No email transmission logs recorded yet.
                       </td>
                     </tr>
                   )}
                   {logs.map((log, idx) => (
                     <tr key={log._id}>
                       <td style={{ color: '#666', fontWeight: 600 }}>{(logsPage - 1) * 15 + idx + 1}</td>
                      <td style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(log.sentAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td>
                        <code style={{ color: '#FF5000', fontSize: 12 }}>
                          {log.orderId || log.order?.orderId || '--'}
                        </code>
                      </td>
                      <td style={{ color: '#1A1A1A', fontSize: 12 }}>
                        {log.recipient || log.order?.customer?.email || '--'}
                      </td>
                      <td>
                        <span className={`badge ${log.type === 'success' ? 'badge-success' : log.type === 'failed' ? 'badge-danger' : 'badge-muted'}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ color: '#1A1A1A', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.subject || (log.type === 'success' ? 'Order Confirmation & Files' : 'Payment Notification')}
                      </td>
                      <td>
                        {log.status === 'sent' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
                            <CheckCircle2 size={13} /> Sent
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                            <XCircle size={13} /> Failed
                          </span>
                        )}
                      </td>
                      <td style={{ color: log.errorMessage ? '#EF4444' : '#666', fontSize: 11, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.errorMessage || 'Delivered successfully via SMTP'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

               {/* Logs pagination */}
                {logsPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, borderTop: '1px solid #E5E5E5', flexWrap: 'wrap' }}>
                    <select value={logsPageSize} onChange={handleLogsPageSizeChange} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
                      <option value="15">15 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                    </select>
                    <button className="btn-ghost" disabled={logsPage === 1} onClick={() => loadLogs(logsPage - 1)}>Prev</button>
                   {Array.from({ length: logsPages }, (_, i) => i + 1).map(p => (
                     <button
                       key={p}
                       className={p === logsPage ? 'btn-primary' : 'btn-ghost'}
                       style={{ minWidth: 34 }}
                       onClick={() => loadLogs(p)}
                     >
                       {p}
                     </button>
                   ))}
                   <button className="btn-ghost" disabled={logsPage === logsPages} onClick={() => loadLogs(logsPage + 1)}>Next</button>
                 </div>
               )}
            </div>
          )}
         </div>
       )}

      {/* Resend email modal */}
      {showResendModal && resendOrderId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 18, padding: '28px 32px', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>Dispatch Documents</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Enter the recipient email address. Leave blank to send to the customer email on file.</p>
            <input
              type="email"
              placeholder="customer@example.com"
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none', marginBottom: 20, fontFamily: "'Inter', system-ui, sans-serif" }}
              onFocus={e => { e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" style={{ padding: '10px 20px' }} onClick={() => { setShowResendModal(false); setResendOrderId(null); setResendEmail(''); }}>Cancel</button>
              <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => handleResendSingle(resendOrderId, resendEmail)} disabled={resendingId === resendOrderId}>
                {resendingId === resendOrderId ? 'Sending...' : 'Dispatch Files'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

