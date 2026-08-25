import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Maximize2, Package, Tag, DollarSign, Sparkles, Filter } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ImageLightboxModal from '../../components/common/ImageLightboxModal';

const emptyForm = {
  category: '', name: '', description: '',
  imgUrl: '', galleryImages: '', actualPrice: '', discountPrice: '',
  currency: 'INR', websitePreviewUrl: '', techStack: '',
  projectFileUrl: '', projectDocUrl: '',
  projectFiles: [],   // [{ label, url, fileType }]
  projectGuides: [],  // [{ label, url }]
  isActive: true
};

export default function AdminProducts() {
  const [products, setProducts]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage]                   = useState(1);
  const [pages, setPages]                 = useState(1);
  const [total, setTotal]                 = useState(0);
  const [pageSize, setPageSize]           = useState(12);
  const [viewMode, setViewMode]           = useState('card');

  document.title = 'Products -- SuperUi Admin';

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
    load(categoryFilter, 1, newSize);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setPageSize(mode === 'card' ? 12 : 15);
    setPage(1);
    load(categoryFilter, 1);
  };

  const load = (cat = categoryFilter, p = page, limit = pageSize) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: limit });
    if (cat) params.append('category', cat);

      Promise.all([
        api.get(`/admin/products?${params}`),
        api.get('/admin/categories')
      ])
        .then(([pRes, cRes]) => {
          const productsData = pRes.data.products || pRes.data;
          setProducts(Array.isArray(productsData) ? productsData : []);
          setTotal(pRes.data.total || (Array.isArray(productsData) ? productsData.length : 0));
          setPages(pRes.data.pages || 1);
          const cats = Array.isArray(cRes.data) ? cRes.data : (cRes.data.categories || []);
          setCategories(cats);
          setCategoriesTotal(cRes.data.total || cats.length);
        })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      category: p.category?._id || '',
      name: p.name || '',
      description: p.description || '',
      imgUrl: p.imgUrl || '',
      galleryImages: (p.galleryImages || []).join(', '),
      actualPrice: p.actualPrice !== undefined ? String(p.actualPrice) : '',
      discountPrice: p.discountPrice !== undefined ? String(p.discountPrice) : '',
      currency: p.currency || 'INR',
      websitePreviewUrl: p.websitePreviewUrl || '',
      techStack: (p.techStack || []).join(', '),
      projectFileUrl: p.projectFileUrl || '',
      projectDocUrl: p.projectDocUrl || '',
      projectFiles:  p.projectFiles  || [],
      projectGuides: p.projectGuides || [],
      isActive: p.isActive !== undefined ? p.isActive : true,
    });
    setEditing(p._id);
    setShowModal(true);
  };

  const openFullImage = (url, title) => {
    if (!url) return;
    setLightboxImage(url);
    setLightboxTitle(title || 'Product Image Preview');
  };

  const parseForm = () => ({
    category:          form.category,
    name:              form.name.trim(),
    title:             form.name.trim(),
    description:       form.description.trim(),
    imgUrl:            form.imgUrl.trim(),
    galleryImages:     form.galleryImages ? form.galleryImages.split(',').map(s => s.trim()).filter(Boolean) : [],
    actualPrice:       parseFloat(form.actualPrice) || 0,
    discountPrice:     form.discountPrice && !isNaN(parseFloat(form.discountPrice)) ? parseFloat(form.discountPrice) : undefined,
    currency:          form.currency || 'INR',
    websitePreviewUrl: form.websitePreviewUrl?.trim() || '',
    techStack:         form.techStack ? form.techStack.split(',').map(s => s.trim()).filter(Boolean) : [],
    projectFileUrl:    form.projectFileUrl.trim(),
    projectDocUrl:     form.projectDocUrl?.trim() || '',
    projectFiles:      (form.projectFiles || []).filter(f => f.label?.trim() && f.url?.trim()),
    projectGuides:     (form.projectGuides || []).filter(g => g.label?.trim() && g.url?.trim()),
    isActive:          Boolean(form.isActive),
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = parseForm();
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully!');
      }
      setShowModal(false);
      load(categoryFilter, page);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error saving product';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted successfully');
      load(categoryFilter, page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const galleryList = form.galleryImages ? form.galleryImages.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Summary card metrics
  const activeProductsCount = (products || []).filter(p => p.isActive).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
            Products
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Manage software, digital downloads, prices, and assets
          </p>
        </div>
        <button id="add-product-btn" className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* 3 Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Total Products */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 20, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Total Products</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,107,0,0.1)', color: '#FF5000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
            {total}
          </div>
          <div style={{ fontSize: 12, color: '#22C55E', marginTop: 4 }}>
            {activeProductsCount} Active in store
          </div>
        </div>

        {/* Card 2: Total Categories */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, padding: 20, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Total Categories</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,107,0,0.1)', color: '#FF5000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
            {categoriesTotal}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Organized store categories
          </div>
        </div>
      </div>

      {/* Category Filter + Active Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16, color: '#1A1A1A',
          padding: '8px 16px', background: '#F5F5F5', borderRadius: 8, border: '1px solid #E5E5E5'
        }}>
          {categoryFilter ? `Showing: ${categories.find(c => c._id === categoryFilter)?.name || 'Filtered'} Products` : 'Showing: All Products'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="#666" />
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); load(e.target.value, 1); }}
            style={{
              padding: '8px 14px', border: '1.5px solid #E5E5E5', borderRadius: 8,
              fontSize: 13, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div style={{ display: 'flex', border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => handleViewModeChange('table')} style={{ padding: '6px 12px', fontSize: 12, background: viewMode === 'table' ? '#FF5000' : '#F5F5F5', color: viewMode === 'table' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Table</button>
            <button onClick={() => handleViewModeChange('card')} style={{ padding: '6px 12px', fontSize: 12, background: viewMode === 'card' ? '#FF5000' : '#F5F5F5', color: viewMode === 'card' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cards</button>
          </div>
        </div>
      </div>

      {viewMode === 'table' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }} className="admin-table-wrapper">
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600, scrollBehavior: 'smooth' }}>
              <table className="table" style={{ minWidth: 950 }}>
               <thead>
                 <tr>
                    <th>S.No</th>
                    <th>Image (Click to view)</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Tech</th>
                    <th>Status</th>
                    <th>Files</th>
                    <th>Actions</th>
                 </tr>
               </thead>
              <tbody>
                {products.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 40 }}>No products yet. Click 'Add Product' above.</td></tr>
                )}
                {products.map((p, idx) => {
                  const price = p.discountPrice && p.discountPrice < p.actualPrice ? p.discountPrice : p.actualPrice;
                  return (
                    <tr key={p._id}>
                       <td style={{ color: '#666', fontWeight: 600 }}>{(page - 1) * 15 + idx + 1}</td>
                      <td>
                        <div
                           style={{ position: 'relative', width: 64, height: 44, cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E5E5', background: '#F5F5F5' }}
                          onClick={() => openFullImage(p.imgUrl, p.name)}
                          title="Click to view full image"
                        >
                          <img
                            src={p.imgUrl}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                            onError={e => { e.currentTarget.src = 'https://placehold.co/120x84/1a1a1a/FF5000?text=No+Image'; }}
                          />
                          <div
                             style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                             onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                             onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                             <Maximize2 size={12} color="white" />
                           </div>
                        </div>
                      </td>
                      <td>
                         <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{p.name}</div>
                         <div style={{ color: '#888', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{p.description?.slice(0, 55)}...</div>
                       </td>
                       <td><span className="badge badge-muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{p.category?.name || '--'}</span></td>
                      <td>
                        <div style={{ color: '#FF5000', fontWeight: 700, fontSize: 13 }}>{p.currency} {price?.toFixed(2)}</div>
                         {p.discountPrice && <div style={{ color: '#888', fontSize: 11, textDecoration: 'line-through' }}>{p.currency} {p.actualPrice?.toFixed(2)}</div>}
                      </td>
                      <td>
                        <div className="tags-row">
                          {(p.techStack || []).slice(0, 2).map(t => <span key={t} className="badge badge-muted" style={{ fontSize: 10 }}>{t}</span>)}
                           {p.techStack?.length > 2 && <span style={{ color: '#888', fontSize: 10 }}>+{p.techStack.length - 2}</span>}
                        </div>
                      </td>
                       <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-muted'}`}>{p.isActive ? 'Active' : 'Off'}</span></td>
                       <td>
                         <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                           {p.projectFileUrl && (
                             <a href={p.projectFileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                               ?? Project
                             </a>
                           )}
                           {p.projectDocUrl && (
                             <a href={p.projectDocUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                               ?? Docs
                             </a>
                           )}
                           {!p.projectFileUrl && !p.projectDocUrl && <span style={{ color: '#999', fontSize: 11 }}>--</span>}
                         </div>
                       </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-ghost" style={{ padding: '7px 10px' }} onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                          <button className="btn-danger" style={{ padding: '7px 10px' }} onClick={() => handleDelete(p._id, p.name)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'card' && !loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }} className="admin-product-cards">
          {products.map(p => {
            const price = p.discountPrice && p.discountPrice < p.actualPrice ? p.discountPrice : p.actualPrice;
            return (
              <div key={p._id} style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                <div style={{ position: 'relative', width: '100%', height: 180, background: '#F5F5F5', cursor: 'pointer' }} onClick={() => openFullImage(p.imgUrl, p.name)}>
                  <img src={p.imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/FF5000?text=No+Image'; }} />
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-muted'}`}>{p.isActive ? 'Active' : 'Off'}</span>
                  </div>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description?.slice(0, 60)}...</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ color: '#FF5000', fontWeight: 700, fontSize: 16 }}>{p.currency} {price?.toFixed(2)}</span>
                    {p.discountPrice && <span style={{ color: '#888', fontSize: 11, textDecoration: 'line-through' }}>{p.currency} {p.actualPrice?.toFixed(2)}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span className="badge badge-muted" style={{ fontSize: 10 }}>{p.category?.name || '--'}</span>
                    {(p.techStack || []).slice(0, 2).map(t => <span key={t} className="badge badge-muted" style={{ fontSize: 10 }}>{t}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {p.projectFileUrl && <a href={p.projectFileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#FF5000', textDecoration: 'none', background: '#FFF5EE', padding: '2px 8px', borderRadius: 4 }}>?? Project</a>}
                    {p.projectDocUrl && <a href={p.projectDocUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#FF5000', textDecoration: 'none', background: '#FFF5EE', padding: '2px 8px', borderRadius: 4 }}>?? Docs</a>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F5F5F5', paddingTop: 10 }}>
                    <button className="btn-ghost" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => openEdit(p)}><Pencil size={13} /> Edit</button>
                    <button className="btn-danger" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => handleDelete(p._id, p.name)}><Trash2 size={13} /> Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'card' && !loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No products found.</div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <select value={pageSize} onChange={handlePageSizeChange} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
            {viewMode === 'card' ? (
              <>
                <option value="12">12 / page</option>
                <option value="15">15 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </>
            ) : (
              <>
                <option value="15">15 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </>
            )}
          </select>
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} disabled={page === 1} onClick={() => { setPage(page - 1); load(categoryFilter, page - 1); }}>Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} className={p === page ? 'btn-primary' : 'btn-ghost'} style={{ width: 36, height: 36, padding: 0, fontSize: 13 }} onClick={() => { setPage(p); load(categoryFilter, p); }}>{p}</button>
          ))}
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} disabled={page === pages} onClick={() => { setPage(page + 1); load(categoryFilter, page + 1); }}>Next</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 300, overflowY: 'auto', padding: 24 }}>
           <div style={{ maxWidth: 700, margin: '40px auto', background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 18, padding: '32px 36px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
               <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>
                 {editing ? 'Edit Product' : 'New Product'}
               </h2>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave}>
              {/* Category select */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-cat">Category <span style={{ color: '#FF5000' }}>*</span></label>
                <select
                  id="prod-cat"
                  className="input"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Name & Currency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="prod-name">Product Name <span style={{ color: '#FF5000' }}>*</span></label>
                  <input
                    id="prod-name"
                    type="text"
                    className="input"
                    placeholder="e.g. Next.js SaaS Template"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="prod-currency">Currency <span style={{ color: '#FF5000' }}>*</span></label>
                  <select
                    id="prod-currency"
                    className="input"
                    value={form.currency}
                    onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                    style={{ cursor: 'pointer' }}
                  >
                    {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-desc">Description <span style={{ color: '#FF5000' }}>*</span></label>
                <textarea
                  id="prod-desc"
                  className="input"
                  placeholder="Detailed product description..."
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Prices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="prod-actual">Actual Price <span style={{ color: '#FF5000' }}>*</span></label>
                  <input
                    id="prod-actual"
                    type="number"
                    className="input"
                    placeholder="999"
                    value={form.actualPrice}
                    onChange={e => setForm(prev => ({ ...prev, actualPrice: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="prod-discount">Discount Price</label>
                  <input
                    id="prod-discount"
                    type="number"
                    className="input"
                    placeholder="699 (optional)"
                    value={form.discountPrice}
                    onChange={e => setForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                  />
                </div>
              </div>

              {/* Main Image URL */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-imgurl">Main Image URL <span style={{ color: '#FF5000' }}>*</span></label>
                <input
                  id="prod-imgurl"
                  type="url"
                  className="input"
                  placeholder="https://..."
                  value={form.imgUrl}
                  onChange={e => setForm(prev => ({ ...prev, imgUrl: e.target.value }))}
                  required
                />
              </div>

              {/* Main image preview */}
              {form.imgUrl && (
                <div
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                     background: '#F5F5F5',
                     padding: '8px 12px',
                     borderRadius: 8,
                     border: '1px solid #E5E5E5'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <img
                       src={form.imgUrl}
                       alt="Main Preview"
                       style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #333' }}
                       onClick={() => openFullImage(form.imgUrl, form.name || 'Main Product Image')}
                       title="Click to view full image"
                       onError={e => { e.currentTarget.src = 'https://placehold.co/120x84/1a1a1a/FF5000?text=No+Image'; }}
                     />
                     <span style={{ fontSize: 12, color: '#1A1A1A' }}>Main Image Preview (Click to zoom)</span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => openFullImage(form.imgUrl, form.name || 'Main Product Image')}
                  >
                    <Maximize2 size={12} /> View Full
                  </button>
                </div>
              )}

              {/* Gallery Images */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-gallery">Gallery Images (comma-separated URLs)</label>
                <input
                  id="prod-gallery"
                  type="text"
                  className="input"
                  placeholder="https://img1.com, https://img2.com"
                  value={form.galleryImages}
                  onChange={e => setForm(prev => ({ ...prev, galleryImages: e.target.value }))}
                />
              </div>

              {/* Gallery previews */}
              {galleryList.length > 0 && (
                <div style={{ marginBottom: 16, background: '#F5F5F5', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E5E5' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Gallery Images Preview ({galleryList.length}): Click any image to view full size</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {galleryList.map((img, idx) => (
                      <div
                        key={idx}
                         style={{ position: 'relative', width: 64, height: 44, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E5E5E5' }}
                        onClick={() => openFullImage(img, `${form.name || 'Product'} -- Screenshot ${idx + 1}`)}
                        title="Click to zoom screenshot"
                      >
                        <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                         <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                          <Maximize2 size={12} color="white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview URL */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-preview">Live Preview URL (optional)</label>
                <input
                  id="prod-preview"
                  type="url"
                  className="input"
                  placeholder="https://demo.yourdomain.com"
                  value={form.websitePreviewUrl}
                  onChange={e => setForm(prev => ({ ...prev, websitePreviewUrl: e.target.value }))}
                />
              </div>

              {/* Tech Stack */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="prod-tech">Tech Stack (comma-separated)</label>
                <input
                  id="prod-tech"
                  type="text"
                  className="input"
                  placeholder="React, Node.js, MongoDB, Tailwind"
                  value={form.techStack}
                  onChange={e => setForm(prev => ({ ...prev, techStack: e.target.value }))}
                />
              </div>

              {/* Gated Files section */}
              <div style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
                <p style={{ color: '#FF5000', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>🔒 Gated Files (sent only after verified payment)</p>

                {/* ── Project Files ── */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>📥 Download Files</label>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, projectFiles: [...(prev.projectFiles||[]), { label: '', url: '', fileType: 'zip' }] }))}
                      style={{ fontSize: 11, color: '#FF5000', background: 'none', border: '1px dashed #FF5000', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>+ Add File</button>
                  </div>
                  {(form.projectFiles || []).length === 0 && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 6 }}>No files added — use legacy URL below or click + Add File</div>
                  )}
                  {(form.projectFiles || []).map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                      <input type="text" placeholder="Label (e.g. Project File)" value={f.label}
                        onChange={e => setForm(prev => ({ ...prev, projectFiles: prev.projectFiles.map((x,i) => i===idx ? {...x, label: e.target.value} : x) }))}
                        style={{ flex: 1, fontSize: 12, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                      <input type="text" placeholder="https://drive.google.com/..." value={f.url}
                        onChange={e => setForm(prev => ({ ...prev, projectFiles: prev.projectFiles.map((x,i) => i===idx ? {...x, url: e.target.value} : x) }))}
                        style={{ flex: 2, fontSize: 12, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                      <select value={f.fileType || 'zip'}
                        onChange={e => setForm(prev => ({ ...prev, projectFiles: prev.projectFiles.map((x,i) => i===idx ? {...x, fileType: e.target.value} : x) }))}
                        style={{ fontSize: 12, padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 6 }}>
                        {['zip','pdf','doc','mp4','other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, projectFiles: prev.projectFiles.filter((_,i) => i!==idx) }))}
                        style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  {/* Legacy fallback */}
                  <label style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginTop: 6, marginBottom: 4 }}>Legacy single file URL (fallback when Files list is empty)</label>
                  <input type="text" className="input" placeholder="https://drive.google.com/..."
                    value={form.projectFileUrl}
                    onChange={e => setForm(prev => ({ ...prev, projectFileUrl: e.target.value }))} />
                </div>

                {/* ── Project Guides ── */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>📖 Guides / Documentation</label>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, projectGuides: [...(prev.projectGuides||[]), { label: '', url: '' }] }))}
                      style={{ fontSize: 11, color: '#1d4ed8', background: 'none', border: '1px dashed #1d4ed8', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>+ Add Guide</button>
                  </div>
                  {(form.projectGuides || []).length === 0 && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 6 }}>No guides added — use legacy URL below or click + Add Guide</div>
                  )}
                  {(form.projectGuides || []).map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                      <input type="text" placeholder="Label (e.g. Installation Guide)" value={g.label}
                        onChange={e => setForm(prev => ({ ...prev, projectGuides: prev.projectGuides.map((x,i) => i===idx ? {...x, label: e.target.value} : x) }))}
                        style={{ flex: 1, fontSize: 12, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                      <input type="text" placeholder="https://docs.google.com/..." value={g.url}
                        onChange={e => setForm(prev => ({ ...prev, projectGuides: prev.projectGuides.map((x,i) => i===idx ? {...x, url: e.target.value} : x) }))}
                        style={{ flex: 2, fontSize: 12, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, projectGuides: prev.projectGuides.filter((_,i) => i!==idx) }))}
                        style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                  <label style={{ fontSize: 11, color: '#9CA3AF', display: 'block', marginTop: 6, marginBottom: 4 }}>Legacy single doc URL (fallback when Guides list is empty)</label>
                  <input type="text" className="input" placeholder="https://docs.google.com/..."
                    value={form.projectDocUrl}
                    onChange={e => setForm(prev => ({ ...prev, projectDocUrl: e.target.value }))} />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <input
                  type="checkbox"
                  id="prod-active"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ accentColor: '#FF5000', width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="prod-active" style={{ color: '#666', fontSize: 14, cursor: 'pointer' }}>Active (visible on store)</label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={15} /> Save Product</>}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Full View */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage}
        title={lightboxTitle}
        onClose={() => setLightboxImage(null)}
      />

      <style>{`
        @media (max-width: 768px) {
          .admin-product-cards {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-product-cards {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 768px) {
          .admin-table-wrapper {
            border-radius: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

