import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star, Sparkles, Image, Tag, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  title: '',
  description: 'Premium curated digital product.',
  imgUrl: '',
  category: '',
  actualPrice: 999,
  discountPrice: 499,
  currency: 'INR',
  projectFileUrl: '',
  projectDocUrl: '',
  isFeatured: true,
  isActive: true,
};

export default function AdminFeatured() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts]           = useState([]);
  const [categories, setCategories]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showModal, setShowModal]               = useState(false);
  const [showPickerModal, setShowPickerModal]   = useState(false);
  const [editingProduct, setEditingProduct]     = useState(null);
  const [form, setForm]                         = useState(emptyForm);
  const [saving, setSaving]                     = useState(false);
  const [page, setPage]                         = useState(1);
  const [pages, setPages]                       = useState(1);
  const [pageSize, setPageSize]                 = useState(12);

  document.title = 'Featured Products -- SuperUi Admin';

  const loadData = async (p = 1) => {
    setLoading(true);
    try {
      const [featRes, prodRes, catRes] = await Promise.all([
        api.get(`/admin/products?featured=true&limit=${pageSize}&page=${p}`),
        api.get('/admin/products?limit=100'),
        api.get('/admin/categories'),
      ]);

      const fList = featRes.data.products || featRes.data || [];
      setFeaturedProducts(Array.isArray(fList) ? fList : []);
      setPages(featRes.data.pages || 1);
      setPage(p);

      const pList = prodRes.data.products || prodRes.data || [];
      setAllProducts(Array.isArray(pList) ? pList : []);

      const cList = Array.isArray(catRes.data) ? catRes.data : (catRes.data.categories || []);
      setCategories(cList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(1); }, []);

  const openCreateManual = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category: categories[0]?._id || '',
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || '',
      title: p.title || '',
      description: p.description || '',
      imgUrl: p.imgUrl || '',
      category: p.category?._id || p.category || '',
      actualPrice: p.actualPrice || 999,
      discountPrice: p.discountPrice || '',
      currency: 'INR',
      projectFileUrl: p.projectFileUrl || '',
      projectDocUrl: p.projectDocUrl || '',
      isFeatured: true,
      isActive: p.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.imgUrl) {
      return toast.error('Please enter Title and Image URL');
    }
    if (!form.category) {
      if (categories.length > 0) {
        form.category = categories[0]._id;
      } else {
        return toast.error('Please select a category');
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title || form.name,
        isFeatured: true,
        actualPrice: Number(form.actualPrice) || 999,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        projectFileUrl: form.projectFileUrl.trim(),
        projectDocUrl: form.projectDocUrl?.trim() || '',
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        toast.success('Featured product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Featured product created successfully!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFeatured = async (id) => {
    if (!confirm('Remove this product from the featured list on the home page?')) return;
    try {
      await api.patch(`/admin/products/${id}/featured`, { isFeatured: false });
      toast.success('Removed from featured products');
      loadData();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Permanently delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted permanently');
      loadData();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleFromList = async (product) => {
    try {
      const newStatus = !product.isFeatured;
      await api.patch(`/admin/products/${product._id}/featured`, { isFeatured: newStatus });
      toast.success(newStatus ? 'Marked as featured!' : 'Unmarked from featured');
      loadData();
    } catch (err) {
      toast.error('Failed to toggle featured status');
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#FF5000', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            <Sparkles size={16} /> Home Page Showcase
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>
            Featured Products
          </h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
            Manage the cards displayed in the "Featured Products" showcase section on the homepage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowPickerModal(true)}
            style={{
              background: '#FFF8F4',
              color: '#FF5000',
              border: '1.5px solid #FFD5BE',
              padding: '11px 18px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFEADC'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFF8F4'}
          >
            <Star size={16} /> Pick Existing Product
          </button>

          <button
            onClick={openCreateManual}
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
            <Plus size={18} /> Create Featured Card
          </button>
        </div>
      </div>

      {/* Grid of Featured Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
          <p style={{ color: '#888', marginTop: 16 }}>Loading featured products...</p>
        </div>
      ) : featuredProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
          {featuredProducts.map(p => (
            <div
              key={p._id}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1.5px solid #EAEAEA',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
              }}
            >
              {/* Image with Badge */}
              <div style={{ position: 'relative', width: '100%', height: 180, background: '#F5F5F5' }}>
                <img
                  src={p.imgUrl}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  background: '#FF5000', color: 'white',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 2px 8px rgba(255,107,0,0.4)',
                }}>
                  <Star size={12} fill="white" /> Featured Card
                </div>
                {p.category?.name && (
                  <div style={{
                    position: 'absolute', bottom: 10, left: 10,
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    borderRadius: 6, padding: '3px 8px',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {p.category.name}
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {p.name}
                </h3>
                <p style={{ color: '#666', fontSize: 13, margin: '0 0 14px', flex: 1, lineHeight: 1.5 }}>
                  {p.title || p.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>
                      ₹{Number(p.discountPrice || p.actualPrice || 0).toLocaleString('en-IN')}
                    </span>
                    {p.discountPrice && p.discountPrice < p.actualPrice && (
                      <span style={{ fontSize: 13, color: '#AAA', textDecoration: 'line-through', marginLeft: 8 }}>
                        ₹{Number(p.actualPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: p.isActive ? '#16A34A' : '#DC2626',
                    background: p.isActive ? '#F0FDF4' : '#FEF2F2',
                    padding: '3px 8px', borderRadius: 6,
                  }}>
                    {p.isActive ? '? Active' : '? Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      flex: 1,
                      background: '#F7F7F7',
                      border: '1px solid #E0E0E0',
                      borderRadius: 8,
                      padding: '9px 0',
                      fontSize: 13, fontWeight: 700,
                      color: '#333',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFF4EE'; e.currentTarget.style.borderColor = '#FF5000'; e.currentTarget.style.color = '#FF5000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F7F7F7'; e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#333'; }}
                  >
                    <Pencil size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleRemoveFeatured(p._id)}
                    title="Remove from featured list"
                    style={{
                      background: '#FFF8F4',
                      border: '1px solid #FFD5BE',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 13, fontWeight: 700,
                      color: '#FF5000',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Unfeature
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p._id)}
                    title="Delete permanently"
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 8,
                      padding: '9px 12px',
                      color: '#DC2626',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#FAFAFA', borderRadius: 20, border: '2px dashed #E0E0E0' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FFF4EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#FF5000' }}>
            <Star size={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>No featured products yet</h3>
          <p style={{ color: '#666', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
            Featured products are highlighted on the home page. You can create a new featured card or pick from existing products.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={() => setShowPickerModal(true)}
              style={{ background: '#FFF', border: '1.5px solid #E0E0E0', padding: '11px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
            >
              Pick from Products
            </button>
            <button
              onClick={openCreateManual}
              style={{ background: '#FF5000', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
            >
              + Create Featured Card
            </button>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); loadData(1); }} style={{ padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 6, fontSize: 12, background: '#F5F5F5', color: '#1A1A1A', cursor: 'pointer' }}>
            <option value="12">12 / page</option>
            <option value="15">15 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
          <button className="btn-ghost" disabled={page === 1} onClick={() => loadData(page - 1)} style={{ padding: '8px 14px', fontSize: 12 }}>Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} className={p === page ? 'btn-primary' : 'btn-ghost'} style={{ width: 36, height: 36, padding: 0, fontSize: 13 }} onClick={() => loadData(p)}>{p}</button>
          ))}
          <button className="btn-ghost" disabled={page === pages} onClick={() => loadData(page + 1)} style={{ padding: '8px 14px', fontSize: 12 }}>Next</button>
        </div>
      )}

      {/* -- Modal: Create / Edit Featured Product -- */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 20, maxWidth: 580, width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#111' }}>
                  {editingProduct ? 'Edit Featured Product' : 'Create Featured Card'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>
                  This card will appear on the homepage Featured section.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                  Product Title / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ember Pro E-Commerce Dashboard"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                  Image URL (Thumbnail) *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/thumbnail.png"
                  value={form.imgUrl}
                  onChange={e => setForm({ ...form, imgUrl: e.target.value })}
                  required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {form.imgUrl && (
                  <div style={{ marginTop: 8, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #EAEAEA' }}>
                    <img src={form.imgUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', background: 'white' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                    Price (? INR) *
                  </label>
                  <input
                    type="number"
                    placeholder="999"
                    value={form.discountPrice || form.actualPrice}
                    onChange={e => setForm({ ...form, discountPrice: e.target.value, actualPrice: Number(e.target.value) * 1.5 })}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="A premium e-commerce template crafted with modern tooling..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

               <div>
                 <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                   Download / Source ZIP URL <span style={{ color: '#FF5000' }}>*</span>
                 </label>
                 <input
                   type="text"
                   placeholder="https://drive.google.com/..."
                   value={form.projectFileUrl}
                   onChange={e => setForm({ ...form, projectFileUrl: e.target.value })}
                   required
                   style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                 />
               </div>

               <div>
                 <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                   Project Guide / Documentation URL (optional)
                 </label>
                 <input
                   type="text"
                   placeholder="https://docs.google.com/..."
                   value={form.projectDocUrl}
                   onChange={e => setForm({ ...form, projectDocUrl: e.target.value })}
                   style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                 />
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, borderTop: '1px solid #EEEEEE', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', padding: '11px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: '#FF5000', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Update Card' : 'Create Featured Card')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -- Modal: Pick from Existing Products -- */}
      {showPickerModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 20, maxWidth: 640, width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
            maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#111' }}>
                  Pick Products to Feature
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>
                  Click to add or remove any product from the homepage featured section.
                </p>
              </div>
              <button onClick={() => setShowPickerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allProducts.map(prod => (
                <div
                  key={prod._id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 12,
                    border: prod.isFeatured ? '2px solid #FF5000' : '1px solid #EAEAEA',
                    background: prod.isFeatured ? '#FFF8F4' : '#FAFAFA',
                    gap: 14,
                  }}
                >
                  <img src={prod.imgUrl} alt={prod.name} style={{ width: 50, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{prod.name}</div>
                    <div style={{ fontSize: 12, color: '#777' }}>
                      {prod.category?.name || 'General'} -- ₹{Number(prod.discountPrice || prod.actualPrice || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFromList(prod)}
                    style={{
                      background: prod.isFeatured ? '#FF5000' : '#FFFFFF',
                      color: prod.isFeatured ? 'white' : '#444',
                      border: prod.isFeatured ? 'none' : '1.5px solid #E0E0E0',
                      borderRadius: 8, padding: '7px 14px',
                      fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    {prod.isFeatured ? <><Check size={14} /> Featured</> : '+ Feature'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #EEEEEE', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPickerModal(false)}
                style={{ background: '#FF5000', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

