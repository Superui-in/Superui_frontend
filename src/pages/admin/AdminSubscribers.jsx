import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Trash2, Search, Users, UserCheck, UserX, Download } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import useAdminStore from '../../store/adminStore';
import { useInvalidateContent } from '../../hooks/useSiteContent';

export default function AdminSubscribers() {
  const invalidateContent = useInvalidateContent();
  const token = useAdminStore(s => s.token);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useSocket(token, (event, data) => {
    if (event === 'new_subscriber' || event === 'subscriber_resubscribed' || event === 'subscriber_removed') {
      loadData();
    }
  });

  document.title = 'Subscribers -- SuperUi Admin';

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await api.get('/admin/subscribers', { params: { search, page, limit } });
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
      if (isManualRefresh) toast.success('Subscribers refreshed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [search, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await api.delete(`/admin/subscribers/${id}`);
      invalidateContent();
      toast.success('Subscriber removed');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ width: '100%', paddingBottom: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="accent-line" />
        <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 26, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
          Newsletter Subscribers
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
          Manage all clients who subscribed to your newsletter from the footer.
        </p>
      </div>

      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E5E5E5',
        borderRadius: 20,
        padding: '28px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#E8F5EE', borderRadius: 20, color: '#16A34A', fontSize: 12, fontWeight: 700 }}>
              <Mail size={14} /> TOTAL SUBSCRIBERS
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{total}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ padding: '9px 14px 9px 36px', border: '1.5px solid #E5E5E5', borderRadius: 10, fontSize: 13, outline: 'none', width: 240, fontFamily: "'Inter', system-ui, sans-serif" }}
              />
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1.5px solid #E0E0E0', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, color: '#333', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 38, height: 38 }} />
          </div>
        ) : subscribers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#666' }}>No subscribers yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>When clients subscribe from the footer, they will appear here.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {subscribers.map((sub) => (
                <div key={sub._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: '#FAFAFA', border: '1px solid #F0F0F0',
                  borderRadius: 12, transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: '#E8F5EE', color: '#16A34A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>{sub.email}</div>
                      <div style={{ fontSize: 11.5, color: '#888', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={12} color="#16A34A" />
                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 8, borderRadius: 8, transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                    title="Remove subscriber"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 28 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 16px', border: '1.5px solid #E5E5E5', borderRadius: 10, background: '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: '#333', opacity: page === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '8px 16px', border: '1.5px solid #E5E5E5', borderRadius: 10, background: '#FFF', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: '#333', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
