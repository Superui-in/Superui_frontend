import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Maximize2 } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ImageLightboxModal from '../../components/common/ImageLightboxModal';

const emptyForm = { name: '', imgUrl: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [page, setPage]                   = useState(1);
  const [pages, setPages]                 = useState(1);
  const [total, setTotal]                 = useState(0);
  const [pageSize, setPageSize]           = useState(12);
  const [viewMode, setViewMode]           = useState('card');

  document.title = 'Categories -- SuperUi Admin';

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(1);
    load(1, newSize);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setPageSize(mode === 'card' ? 12 : 15);
    setPage(1);
    load(1);
  };

  const load = (p = 1, limit = pageSize) => {
    setLoading(true);
    api.get(`/admin/categories?page=${p}&limit=${limit}`)
      .then(r => {
        const cats = r.data.categories || r.data;
        setCategories(Array.isArray(cats) ? cats : []);
        setTotal(r.data.total || (Array.isArray(cats) ? cats.length : 0));
        setPages(r.data.pages || 1);
        setPage(p);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load categories');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name || '',
      imgUrl: cat.imgUrl || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true
    });
    setEditing(cat._id);
    setShowModal(true);
  };

  const openFullImage = (url, title) => {
    if (!url) return;
    setLightboxImage(url);
    setLightboxTitle(title || 'Category Image');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        imgUrl: form.imgUrl.trim(),
        isActive: Boolean(form.isActive)
      };

      if (editing) {
        await api.put(`/admin/categories/${editing}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      load(page);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error saving category';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      const currentTotal = total - 1;
      const currentPages = Math.max(1, Math.ceil(currentTotal / pageSize));
      if (page > currentPages) {
        load(currentPages);
      } else {
        load(page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= pages) load(p);
  };

  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) pageNumbers.push(i);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="accent-line" />
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>
            Categories <span style={{ color: '#888', fontSize: 18 }}>({total})</span>
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Create and organize product categories for store navigation
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button id="add-category-btn" className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Category
          </button>
          <div style={{ display: 'flex', border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => handleViewModeChange('table')} style={{ padding: '6px 12px', fontSize: 12, background: viewMode === 'table' ? '#FF5000' : '#F5F5F5', color: viewMode === 'table' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Table</button>
            <button onClick={() => handleViewModeChange('card')} style={{ padding: '6px 12px', fontSize: 12, background: viewMode === 'card' ? '#FF5000' : '#F5F5F5', color: viewMode === 'card' ? '#FFF' : '#666', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cards</button>
          </div>
        </div>
      </div>

      {viewMode === 'table' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }} className="admin-table-wrapper">
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E5E5' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 18, color: '#1A1A1A', margin: 0 }}>Categories</h2>
          </div>
          {loading ? (
            <div className="page-loader" style={{ minHeight: 200 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600, scrollBehavior: 'smooth' }}>
              <table className="table" style={{ minWidth: 700 }}>
             <thead>
               <tr>
                 <th>S.No</th>
                 <th>Image (Click to view)</th>
                 <th>Name</th>
                 <th>Slug</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
             </thead>
            <tbody>
              {categories.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 40 }}>No categories found. Click 'Add Category' above.</td></tr>
              )}
              {categories.map((cat, idx) => (
                <tr key={cat._id}>
                  <td style={{ color: '#666', fontWeight: 600 }}>{(page - 1) * 15 + idx + 1}</td>
                  <td>
                    <div
                       style={{ position: 'relative', width: 64, height: 44, cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E5E5', background: '#F5F5F5' }}
                      onClick={() => openFullImage(cat.imgUrl, cat.name)}
                      title="Click to view full image"
                    >
                      <img
                        src={cat.imgUrl}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        onError={e => { e.currentTarget.src = 'https://placehold.co/120x84/1a1a1a/FF5000?text=No+Image'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        <Maximize2 size={12} color="white" />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{cat.name}</td>
                  <td><code style={{ color: '#FF5000', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 180 }}>{cat.slug}</code></td>
                  <td>
                    <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-muted'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => openEdit(cat)} title="Edit Category">
                        <Pencil size={14} />
                      </button>
                      <button className="btn-danger" style={{ padding: '7px 12px', fontSize: 13 }} onClick={() => handleDelete(cat._id, cat.name)} title="Delete Category">
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
      )}

      {viewMode === 'card' && !loading && categories.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }} className="admin-category-cards">
          {categories.map(cat => (
            <div key={cat._id} style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
              <div style={{ position: 'relative', width: '100%', height: 160, background: '#F5F5F5', cursor: 'pointer' }} onClick={() => openFullImage(cat.imgUrl, cat.name)}>
                <img src={cat.imgUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/FF5000?text=No+Image'; }} />
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span className={`badge ${cat.isActive ? 'badge-success' : 'badge-muted'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14, marginBottom: 4 }}>{cat.name}</div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 10, fontFamily: 'monospace' }}>{cat.slug}</div>
                <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F5F5F5', paddingTop: 10 }}>
                  <button className="btn-ghost" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => openEdit(cat)}><Pencil size={13} /> Edit</button>
                  <button className="btn-danger" style={{ flex: 1, padding: '6px 10px', fontSize: 12 }} onClick={() => handleDelete(cat._id, cat.name)}><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'card' && !loading && categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No categories found.</div>
      )}

      {!loading && pages > 1 && (
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
          <button className="btn-ghost" disabled={page === 1} onClick={() => goToPage(page - 1)}>Prev</button>
          {pageNumbers.map(pn => (
            <button
              key={pn}
              className={pn === page ? 'btn-primary' : 'btn-ghost'}
              onClick={() => goToPage(pn)}
              style={{ minWidth: 36 }}
            >
              {pn}
            </button>
          ))}
          <button className="btn-ghost" disabled={page === pages} onClick={() => goToPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
           <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 18, padding: '32px 36px', width: '100%', maxWidth: 480 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#1A1A1A' }}>
                 {editing ? 'Edit Category' : 'New Category'}
               </h2>
               <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                 <X size={20} />
               </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="cat-name">Category Name <span style={{ color: '#FF5000' }}>*</span></label>
                <input
                  id="cat-name"
                  type="text"
                  className="input"
                  placeholder="e.g. Web Applications"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label" htmlFor="cat-imgurl">Image / Icon URL <span style={{ color: '#FF5000' }}>*</span></label>
                <input
                  id="cat-imgurl"
                  type="text"
                  className="input"
                  placeholder="https://images.unsplash.com/... or URL"
                  value={form.imgUrl}
                  onChange={e => setForm(prev => ({ ...prev, imgUrl: e.target.value }))}
                  required
                />
              </div>

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
                      alt="Preview"
                      style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #333' }}
                      onClick={() => openFullImage(form.imgUrl, form.name || 'Category Image Preview')}
                      title="Click to view full size"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                     <span style={{ fontSize: 12, color: '#1A1A1A' }}>Image Preview</span>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => openFullImage(form.imgUrl, form.name || 'Category Image Preview')}
                  >
                    <Maximize2 size={12} /> View Full
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ accentColor: '#FF5000', width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="cat-active" style={{ color: '#666', fontSize: 14, cursor: 'pointer' }}>Active (show in store)</label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={15} /> Save Category</>}
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
          .admin-category-cards {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
            gap: 12px !important;
          }
          .admin-table-wrapper {
            border-radius: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-category-cards {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .admin-table-wrapper {
            border-radius: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

