import { useEffect, useState } from 'react';
import {
  ShoppingBag, Users, FolderOpen, Star, Briefcase, Package,
  Save, CheckCircle2, Database, Eye, Sparkles, RefreshCw
} from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useInvalidateContent } from '../../hooks/useSiteContent';

export default function AdminCounts() {
  const invalidateContent = useInvalidateContent();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [creatorsValue, setCreatorsValue] = useState('');

  const [dbCounts, setDbCounts] = useState({
    totalProducts: 0,
    totalCategories: 0,
    happyClients: 0,
    portfolioCount: 0,
  });

  document.title = 'Counts -- SuperUi Admin';

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await api.get('/admin/counts');
      if (data.stats && Array.isArray(data.stats) && data.stats.length > 0) {
        const creatorsStat = data.stats.find(s => s.label === 'CREATORS');
        if (creatorsStat) setCreatorsValue(creatorsStat.value);
      }
      if (data.dbCounts) {
        setDbCounts(data.dbCounts);
      }
      if (isManualRefresh) {
        toast.success('Database counts refreshed!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load count data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const stats = [
        { label: 'PRODUCTS', value: `${dbCounts.totalProducts}+`, icon: 'ShoppingBag' },
        { label: 'CREATORS', value: creatorsValue || '0', icon: 'Users' },
        { label: 'CATEGORIES', value: `${dbCounts.totalCategories}+`, icon: 'FolderOpen' },
        { label: 'HAPPY CLIENTS', value: `${dbCounts.happyClients >= 1000 ? (dbCounts.happyClients / 1000).toFixed(0) + 'K' : dbCounts.happyClients}+`, icon: 'Star' },
      ];
      const { data } = await api.put('/admin/counts', { stats });
      if (data.stats) invalidateContent();
      toast.success('Homepage counts updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save counts');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 38, height: 38 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="accent-line" />
        <h1 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 28, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
          Count Settings & Statistics
        </h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          Edit the custom stats displayed on your homepage and monitor live counts from your database.
        </p>
      </div>

       {/* -- SECTION 1: MANUAL EDITABLE STATS -- */}
       <div style={{
         background: '#FFFFFF',
         border: '1.5px solid #E5E5E5',
         borderRadius: 20,
         padding: '28px 32px',
         boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
         marginBottom: 40,
       }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
           <div>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#FFF4EE', borderRadius: 20, color: '#FF5000', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
               <Eye size={14} /> MANUAL EDITABLE STAT
             </div>
             <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>
               Creators Count
             </h2>
             <p style={{ color: '#777', fontSize: 13, marginTop: 2 }}>
               Only this value is manually set. Products, Categories, and Happy Clients are computed from the database.
             </p>
           </div>

           <button
             onClick={handleSave}
             disabled={saving}
             style={{
               display: 'flex', alignItems: 'center', gap: 8,
               background: '#FF5000', color: 'white',
               border: 'none', borderRadius: 10,
               padding: '10px 22px', fontSize: 14, fontWeight: 700,
               cursor: saving ? 'not-allowed' : 'pointer',
               boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
               transition: 'all 0.2s',
             }}
             onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#E05A00'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
             onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = '#FF5000'; e.currentTarget.style.transform = 'translateY(0)'; } }}
           >
             {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Save size={16} /> Save Changes</>}
           </button>
         </div>

         {/* Creators Input Card */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
           <div style={{
             background: '#FAFAFA',
             border: '1.5px solid #EBEBEB',
             borderRadius: 16,
             padding: '20px 18px',
             transition: 'all 0.2s',
           }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
               <div style={{
                 width: 38, height: 38, borderRadius: 10,
                 background: '#FFF4EE', color: '#FF5000',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
               }}>
                 <Users size={20} />
               </div>
             </div>

             <div>
               <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                 Creators Count Value
               </label>
               <input
                 type="text"
                 value={creatorsValue}
                 onChange={e => setCreatorsValue(e.target.value)}
                 placeholder="e.g. 50+"
                 style={{
                   width: '100%', padding: '9px 12px',
                   borderRadius: 10, border: '1.5px solid #E0E0E0',
                   fontSize: 18, fontWeight: 800,
                   fontFamily: "'Space Grotesk', system-ui, sans-serif",
                   color: '#FF5000', background: '#FFFFFF',
                   outline: 'none', transition: 'border-color 0.2s',
                 }}
                 onFocus={e => e.currentTarget.style.borderColor = '#FF5000'}
                 onBlur={e => e.currentTarget.style.borderColor = '#E0E0E0'}
               />
             </div>
           </div>
         </div>

         {/* Live Preview Strip */}
         <div style={{
           marginTop: 28,
           padding: '20px 24px',
           background: '#141414',
           borderRadius: 14,
           border: '1px solid #282828',
         }}>
           <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
             <CheckCircle2 size={13} color="#22C55E" /> Live Homepage Preview
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
             <div style={{ textAlign: 'center', minWidth: 100, padding: '6px 12px' }}>
               <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900, fontSize: 26, color: '#FF5000', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4 }}>
                 {dbCounts.totalProducts}+
               </div>
               <div style={{ fontSize: 11, color: '#AAA', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>PRODUCTS</div>
             </div>
             <div style={{ textAlign: 'center', minWidth: 100, padding: '6px 12px' }}>
               <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900, fontSize: 26, color: '#FF5000', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4 }}>
                 {creatorsValue || '--'}
               </div>
               <div style={{ fontSize: 11, color: '#AAA', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>CREATORS</div>
             </div>
             <div style={{ textAlign: 'center', minWidth: 100, padding: '6px 12px' }}>
               <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900, fontSize: 26, color: '#FF5000', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4 }}>
                 {dbCounts.totalCategories}+
               </div>
               <div style={{ fontSize: 11, color: '#AAA', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>CATEGORIES</div>
             </div>
             <div style={{ textAlign: 'center', minWidth: 100, padding: '6px 12px' }}>
               <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 900, fontSize: 26, color: '#FF5000', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4 }}>
                 {dbCounts.happyClients >= 1000 ? (dbCounts.happyClients / 1000).toFixed(0) + 'K' : dbCounts.happyClients}+
               </div>
               <div style={{ fontSize: 11, color: '#AAA', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>HAPPY CLIENTS</div>
             </div>
           </div>
         </div>
       </div>

      {/* -- SECTION 2: LIVE DATABASE COUNTS -- */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #E5E5E5',
        borderRadius: 20,
        padding: '28px 32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#F0FDF4', borderRadius: 20, color: '#16A34A', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              <Database size={14} /> LIVE DATABASE COUNTS (ACTUAL SYSTEM DATA)
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>
              Original Database Records
            </h2>
            <p style={{ color: '#777', fontSize: 13, marginTop: 2 }}>
              Real-time exact counts fetched directly from MongoDB collections. Read-only.
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: '#FFFFFF', border: '1.5px solid #E0E0E0',
              borderRadius: 10, padding: '10px 18px',
              fontSize: 13, fontWeight: 700, color: '#333',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.color = '#16A34A'; } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#333'; } }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh DB Counts'}
          </button>
        </div>

        {/* 4 DB Count Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {/* Card 1: Total Products */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #3B82F6',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 16px rgba(59,130,246,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#3B82F6', background: '#EFF6FF', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                Live DB
              </span>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#EFF6FF', color: '#3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Package size={22} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 36, color: '#1E293B', lineHeight: 1 }}>
              {Number(dbCounts.totalProducts || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Products
            </div>
            <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
              From Product collection in DB
            </div>
          </div>

          {/* Card 2: Categories Count */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #8B5CF6',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 16px rgba(139,92,246,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#8B5CF6', background: '#F5F3FF', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                Live DB
              </span>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#F5F3FF', color: '#8B5CF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <FolderOpen size={22} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 36, color: '#1E293B', lineHeight: 1 }}>
              {Number(dbCounts.totalCategories || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Categories Count
            </div>
            <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
              Active product categories
            </div>
          </div>

          {/* Card 3: Happy Clients (Paid Orders) */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #10B981',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 16px rgba(16,185,129,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                Live DB
              </span>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#ECFDF5', color: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Users size={22} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 36, color: '#1E293B', lineHeight: 1 }}>
              {Number(dbCounts.happyClients || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Happy Clients
            </div>
            <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
              Verified successful orders in DB
            </div>
          </div>

          {/* Card 4: Portfolio Count */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #FF5000',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 4px 16px rgba(255,107,0,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#FF5000', background: '#FFF4EE', padding: '3px 8px', borderRadius: 12, textTransform: 'uppercase' }}>
                Live DB
              </span>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: '#FFF4EE', color: '#FF5000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Briefcase size={22} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 800, fontSize: 36, color: '#1E293B', lineHeight: 1 }}>
              {Number(dbCounts.portfolioCount || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FF5000', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Portfolio Count
            </div>
            <div style={{ fontSize: 11.5, color: '#888', marginTop: 4 }}>
              Portfolio projects in database
            </div>
          </div>
        </div>
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

