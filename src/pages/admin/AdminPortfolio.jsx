import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Maximize2, Package, Filter } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ImageLightboxModal from '../../components/common/ImageLightboxModal';

const emptyForm = {
  name: '',
  title: '',
  description: '',
  imgUrl: '',
  category: '',
  actualPrice: '',
  discountPrice: '',
  currency: 'INR',
  projectFileUrl: '',
  projectDocUrl: '',
  isPortfolio: true,
  isActive: true,
};

export default function AdminPortfolio() {
  const [items, setItems]             = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [total, setTotal]             = useState(0);
  const [pageSize, setPageSize]       = useState(12);
  const [viewMode, setViewMode]       = useState('card');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState('newest');

  document.title = 'Portfolio -- SuperUi Admin';

  const parseForm = () => ({
    category:          form.category,
    name:              form.name.trim(),
    title:             form.title.trim() || form.name.trim(),
    description:       form.description.trim() || 'Portfolio project',
    imgUrl:            form.imgUrl.trim(),
    galleryImages:     [],
    actualPrice:       parseFloat(form.actualPrice) || 0,
    discountPrice:     form.discountPrice && !isNaN(parseFloat(form.discountPrice)) ? parseFloat(form.discountPrice) : undefined,
    currency:          form.currency || 'INR',
    websitePreviewUrl: '',
    techStack:         [],
    projectFileUrl:    form.projectFileUrl.trim(),
    projectDocUrl:     form.projectDocUrl?.trim() || '',
    isFeatured:        false,
    isPortfolio:       true,
    isActive:          Boolean(form.isActive),
  });

  const load = async (p = 1, limit = pageSize, search = searchQuery, sort = sortBy) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: limit });
      if (search.trim()) params.set('search', search.trim());
      if (sort === 'price_asc') params.set('sort', 'price_asc');
      else if (sort === 'price_desc') params.set('sort', 'price_desc');
      else if (sort === 'name_asc') params.set('sort', 'name_asc');
      else if (sort === 'name_desc') params.set('sort', 'name_desc');

      const res = await api.get(`/admin/portfolio?${params.toString()}`);
      const data = res.data.products || res.data || [];
      setItems(Array.isArray(data) ? data : []);
      setTotal(res.data.total || (Array.isArray(data) ? data.length : 0));
      setPages(res.data.pages || 1);
      setPage(p);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  useEffect(() => {
    api.get('/admin/categories')
      .then(res => {
        const cList = Array.isArray(res.data) ? res.data : (res.data.categories || []);
        setCategories(cList);
      })
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0]?._id || '' });
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      title: item.title || '',
      description: item.description || '',
      imgUrl: item.imgUrl || '',
      category: item.category?._id || item.category || '',
      actualPrice: item.actualPrice || '',
      discountPrice: item.discountPrice || '',
      currency: item.currency || 'INR',
      projectFileUrl: item.projectFileUrl || '',
      projectDocUrl: item.projectDocUrl || '',
      isPortfolio: true,
      isActive: item.isActive !== false,
    });
    setEditing(item._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.imgUrl) {
      return toast.error('Please enter Name and Image URL');
    }
    if (!form.category) {
      if (categories.length > 0) {
        setForm(prev => ({ ...prev, category: categories[0]._id }));
      } else {
        return toast.error('Please select a category');
      }
    }

    setSaving(true);
    try {
      const payload = parseForm();
      if (editing) {
        await api.put(`/admin/portfolio/${editing}`, payload);
        toast.success('Portfolio item updated successfully!');
      } else {
        await api.post('/admin/portfolio', payload);
        toast.success('Portfolio item created successfully!');
      }
      setShowModal(false);
      load(page, pageSize, searchQuery, sortBy);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to save portfolio item';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete portfolio item "${name}"?`)) return;
    try {
      await api.delete(`/admin/portfolio/${id}`);
      toast.success('Portfolio item deleted');
      load(page, pageSize, searchQuery, sortBy);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
    load(1, newSize, searchQuery, sortBy);
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= pages) load(p, pageSize, searchQuery, sortBy);
  };

  const handleSearch = () => {
    load(1, pageSize, searchQuery, sortBy);
  };

  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) pageNumbers.push(i);

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A', margin: '8px 0 4px' }}>
            Portfolio <span style={{ color: '#888', fontSize: 18 }}>({total})</span>
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Manage portfolio cards displayed on the Portfolio page.
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: '#FF5000',
            color: 'white',
            border: 'none',
            padding: '11px 20px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E05A00'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FF5000'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={18} /> Add Portfolio Card
        </button>
      </div>

      {/* Search + Filters + View Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 360 }}>
          <input
            type="text"
            placeholder="Search portfolio..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              width: '100%', padding: '10px 36px 10px 38px',
              border: '1.5px solid #E5E5E5', borderRadius: 10,
              fontSize: 13, background: '#F7F7F7', color: '#1A1A1A', outline: 'none',
            }}
          />
          <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }} />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); load(1, pageSize, '', sortBy); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); load(1, pageSize, searchQuery, e.target.value); }}
          style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E5E5', background: '#F7F7F7', color: '#444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </select>

        <div style={{ display: 'flex', border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setViewMode('table')} style={{ padding: '8px 14px', fontSize: 12, background: viewMode === 'table' ? '#FF5000' : '#F5F5F5', color: viewMode === 'table' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Table</button>
          <button onClick={() => setViewMode('card')} style={{ padding: '8px 14px', fontSize: 12, background: viewMode === 'card' ? '#FF5000' : '#F5F5F5', color: viewMode === 'card' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cards</button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E5E5' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 18, color: '#1A1A1A', margin: 0 }}>Portfolio Items</h2>
          </div>
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No portfolio items found. Click "Add Portfolio Card" to create one.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._id}>
                      <td style={{ color: '#666', fontWeight: 600 }}>{(page - 1) * pageSize + idx + 1}</td>
                      <td>
                        <div style={{ width: 64, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E5E5', background: '#F5F5F5', cursor: 'pointer' }} onClick={() => openFullImage(item.imgUrl, item.name)} title="Click to view full image">
                          <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = 'https://placehold.co/120x84/1a1a1a/FF5000?text=No+Image'; }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                            <Maximize2 size={12} color="white" />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1A1A1A' }}>{item.name}</td>
                      <td>{item.category?.name || '-'}</td>
                      <td style={{ fontWeight: 700, color: '#111' }}>₹{Number(item.discountPrice || item.actualPrice || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-muted'}`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => openEdit(item)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-danger" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => handleDelete(item._id, item.name)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E5E5' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 18, color: '#1A1A1A', margin: 0 }}>Portfolio Cards</h2>
          </div>
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No portfolio items found. Click "Add Portfolio Card" to create one.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, padding: 24 }}>
              {items.map(item => (
                <div key={item._id} style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                  <div style={{ position: 'relative', width: '100%', height: 180, background: '#F5F5F5', cursor: 'pointer' }} onClick={() => openFullImage(item.imgUrl, item.name)}>
                    <img src={item.imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/FF5000?text=No+Image'; }} />
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span className={`badge ${item.isActive ? 'badge-success' : 'badge-muted'}`}>{item.isActive ? 'Active' : 'Off'}</span>
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ color: '#888', fontSize: 11, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description?.slice(0, 60) || 'Portfolio project'}...</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ color: '#FF5000', fontWeight: 700, fontSize: 16 }}>₹{Number(item.discountPrice || item.actualPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F5F5F5', paddingTop: 10 }}>
                      <button className="btn-ghost" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => openEdit(item)}><Pencil size={13} /> Edit</button>
                      <button className="btn-danger" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => handleDelete(item._id, item.name)}><Trash2 size={13} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <select value={pageSize} onChange={handlePageSizeChange} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
            <option value="12">12 / page</option>
            <option value="15">15 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
          <button className="btn-ghost" disabled={page === 1} onClick={() => goToPage(page - 1)}>Prev</button>
          {pageNumbers.map(pn => (
            <button key={pn} className={pn === page ? 'btn-primary' : 'btn-ghost'} style={{ minWidth: 36 }} onClick={() => goToPage(pn)}>{pn}</button>
          ))}
          <button className="btn-ghost" disabled={page === pages} onClick={() => goToPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 18, padding: '32px 36px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>
                {editing ? 'Edit Portfolio Item' : 'New Portfolio Card'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Name / Title *</label>
                <input className="input" type="text" placeholder="e.g. E-Commerce Website" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, title: e.target.value })} required />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Image URL *</label>
                <input className="input" type="text" placeholder="https://images.unsplash.com/..." value={form.imgUrl} onChange={e => setForm({ ...form, imgUrl: e.target.value })} required />
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Category *</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={{ background: 'white' }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Actual Price (?) *</label>
                  <input className="input" type="number" placeholder="999" value={form.actualPrice} onChange={e => setForm({ ...form, actualPrice: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Discount Price (?)</label>
                  <input className="input" type="number" placeholder="499" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Short Description</label>
                <textarea className="input" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <input type="checkbox" id="port-active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: '#FF5000', width: 16, height: 16, cursor: 'pointer' }} />
                <label htmlFor="port-active" style={{ color: '#666', fontSize: 14, cursor: 'pointer' }}>Active (show on portfolio page)</label>
              </div>
              <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 10, padding: '16px 18px', marginBottom: 8 }}>
                <p style={{ color: '#FF5000', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>?? Gated File URLs (sent only after verified payment)</p>
                <div style={{ marginBottom: 12 }}>
                  <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Project File URL <span style={{ color: '#FF5000' }}>*</span></label>
                  <input className="input" type="text" placeholder="https://drive.google.com/..." value={form.projectFileUrl} onChange={e => setForm({ ...form, projectFileUrl: e.target.value })} required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="input-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#444' }}>Project Guide / Documentation URL (optional)</label>
                  <input className="input" type="text" placeholder="https://docs.google.com/..." value={form.projectDocUrl} onChange={e => setForm({ ...form, projectDocUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E0E0E0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={15} /> Save Portfolio Card</>}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          imageUrl={lightboxImage}
          title={lightboxTitle}
          onClose={() => { setLightboxImage(null); setLightboxTitle(''); }}
        />
      )}
    </div>
  );
}

