import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, X, GripVertical } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useInvalidateContent } from '../../hooks/useSiteContent';

const EMPTY_BRAND = {
  brandName: '',
  logoUrl: '',
  logoAlt: '',
  mode: 'text',
  firstName: '',
  lastName: '',
  lastNameColor: '#FF5000',
  fullLogoUrl: '',
  fullLogoAlt: '',
  navbarWhiteLogoUrl: '',
  navbarDarkLogoUrl: '',
  footerWhiteLogoUrl: '',
  footerDarkLogoUrl: '',
};

const EMPTY_LINK = { to: '', label: '', icon: '', hide: false };
const EMPTY_LINKS_GROUP = { title: '', links: [{ ...EMPTY_LINK }] };
const EMPTY_SOCIAL = { platform: '', url: '', icon: '' };

const TABS = [
  { key: 'brand', label: 'Brand' },
  { key: 'navbar', label: 'Navbar' },
  { key: 'footer', label: 'Footer' },
];

function ArrayField({ items, onChange, fields, itemLabel }) {
  const update = (idx, field, value) => {
    const next = items.map((it, i) => i === idx ? { ...it, [field]: value } : it);
    onChange(next);
  };
  const add = () => onChange([...items, fields.length > 0 ? Object.fromEntries(fields.map(f => [f.key, f.default])) : { ...EMPTY_LINK }]);
  const remove = (idx) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F0F0F0' }}>
          <div style={{ paddingTop: 8, color: '#BBB', cursor: 'grab' }}><GripVertical size={14} /></div>
          {fields.map(f => (
            <input
              key={f.key}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={item[f.key] || ''}
              onChange={e => update(idx, f.key, e.target.value)}
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Inter', system-ui, sans-serif" }}
            />
          ))}
          <button type="button" onClick={() => remove(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4, marginTop: 4 }}>
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #E5E5E5', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#666', fontSize: 13, fontWeight: 600 }}>
        <Plus size={14} /> Add {itemLabel}
      </button>
    </div>
  );
}

function GroupArrayField({ groups, onChange }) {
  const updateGroupTitle = (idx, value) => {
    const next = groups.map((g, i) => i === idx ? { ...g, title: value } : g);
    onChange(next);
  };
  const updateLink = (gIdx, lIdx, field, value) => {
    const next = groups.map((g, i) => i === gIdx ? { ...g, links: g.links.map((l, j) => j === lIdx ? { ...l, [field]: value } : l) } : g);
    onChange(next);
  };
  const addGroup = () => onChange([...groups, { title: '', links: [{ ...EMPTY_LINK }] }]);
  const removeGroup = (idx) => {
    if (groups.length <= 1) return;
    onChange(groups.filter((_, i) => i !== idx));
  };
  const addLink = (gIdx) => {
    const next = groups.map((g, i) => i === gIdx ? { ...g, links: [...g.links, { ...EMPTY_LINK }] } : g);
    onChange(next);
  };
  const removeLink = (gIdx, lIdx) => {
    const g = groups[gIdx];
    if (g.links.length <= 1) return;
    const next = groups.map((gr, i) => i === gIdx ? { ...gr, links: gr.links.filter((_, j) => j !== lIdx) } : gr);
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {groups.map((group, gIdx) => (
        <div key={gIdx} style={{ padding: '12px 14px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Group title (e.g. Store)"
              value={group.title}
              onChange={e => updateGroupTitle(gIdx, e.target.value)}
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}
            />
            <button type="button" onClick={() => removeGroup(gIdx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16, borderLeft: '2px solid #E5E5E5' }}>
            {group.links.map((link, lIdx) => (
              <div key={lIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="text" placeholder="Label" value={link.label} onChange={e => updateLink(gIdx, lIdx, 'label', e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                <input type="text" placeholder="/path" value={link.to} onChange={e => updateLink(gIdx, lIdx, 'to', e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                <button type="button" onClick={() => removeLink(gIdx, lIdx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => addLink(gIdx)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #E5E5E5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#666', fontSize: 12, fontWeight: 600, alignSelf: 'flex-start' }}>
              <Plus size={12} /> Add Link
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addGroup} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #E5E5E5', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#666', fontSize: 13, fontWeight: 600 }}>
        <Plus size={14} /> Add Link Group
      </button>
    </div>
  );
}

export default function AdminPages() {
  const invalidateContent = useInvalidateContent();
  const [activeTab, setActiveTab] = useState('brand');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [brandForm, setBrandForm] = useState(EMPTY_BRAND);
  const [navbarLinks, setNavbarLinks] = useState([{ ...EMPTY_LINK }]);
  const [navbarDropdownLinks, setNavbarDropdownLinks] = useState([{ ...EMPTY_LINK }]);
  const [navbarMoreTitle, setNavbarMoreTitle] = useState('');
  const [navbarMoreLinks, setNavbarMoreLinks] = useState([{ ...EMPTY_LINK }]);
  const [footerForm, setFooterForm] = useState({
    tagline: '',
    linkGroups: [{ title: '', links: [{ ...EMPTY_LINK }] }],
    socialLinks: [{ platform: '', url: '', icon: '' }],
    supportEmail: '',
    copyright: '',
    taglineBottom: '',
    newsletterTitle: '',
    newsletterSubtitle: '',
    newsletterPlaceholder: '',
    newsletterButton: '',
  });

  document.title = 'Pages -- SuperUi Admin';

  const load = async (section) => {
    try {
      const res = await api.get(`/admin/pages/${section}`);
      const data = res.data.content;
      if (data) {
        if (section === 'brand') setBrandForm({ ...EMPTY_BRAND, ...data });
        if (section === 'navbar') {
          setNavbarLinks(data.links?.length ? data.links : [{ ...EMPTY_LINK }]);
          setNavbarDropdownLinks(data.dropdownLinks?.length ? data.dropdownLinks : [{ ...EMPTY_LINK }]);
        }
        if (section === 'navbarMore') {
          setNavbarMoreTitle(data.title || '');
          setNavbarMoreLinks(data.links?.length ? data.links : [{ ...EMPTY_LINK }]);
        }
        if (section === 'footer') setFooterForm(prev => ({ ...prev, ...data }));
      }
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      load('brand'),
      load('navbar'),
      load('navbarMore'),
      load('footer'),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSave = async (section, payload) => {
    setSaving(true);
    try {
      await api.post('/admin/pages', { section, data: payload });
      invalidateContent();
      toast.success('Saved successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMore = async () => {
    setSaving(true);
    try {
      await api.post('/admin/pages', { section: 'navbarMore', data: { title: navbarMoreTitle, links: navbarMoreLinks } });
      invalidateContent();
      toast.success('Saved successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async (section) => {
    if (!window.confirm(`Clear all content for "${section}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/pages/${section}`);
      toast.success('Section cleared');
      if (section === 'brand') setBrandForm(EMPTY_BRAND);
      if (section === 'navbar') {
        setNavbarLinks([{ ...EMPTY_LINK }]);
        setNavbarDropdownLinks([{ ...EMPTY_LINK }]);
      }
      if (section === 'navbarMore') {
        setNavbarMoreTitle('');
        setNavbarMoreLinks([{ ...EMPTY_LINK }]);
      }
      if (section === 'footer') setFooterForm({
        tagline: '',
        linkGroups: [{ title: '', links: [{ ...EMPTY_LINK }] }],
        socialLinks: [{ platform: '', url: '', icon: '' }],
        supportEmail: '',
        copyright: '',
        taglineBottom: '',
        newsletterTitle: '',
        newsletterSubtitle: '',
        newsletterPlaceholder: '',
        newsletterButton: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clear failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: '#1A1A1A' }}>Pages</h1>
        <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Manage brand, navbar, and footer content</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E5E5E5' }} className="admin-page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #FF5000' : '2px solid transparent',
              color: activeTab === tab.key ? '#FF5000' : '#666',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>
      ) : (
         <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 16, padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }} className="admin-page-content">
          {activeTab === 'brand' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Brand Name</label>
                  <input value={brandForm.brandName} onChange={e => setBrandForm({ ...brandForm, brandName: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="SuperUi" />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Logo URL</label>
                  <input value={brandForm.logoUrl} onChange={e => setBrandForm({ ...brandForm, logoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="https://..." />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Logo Alt Text</label>
                  <input value={brandForm.logoAlt} onChange={e => setBrandForm({ ...brandForm, logoAlt: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="SuperUi Logo" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Logo Mode</label>
                  <select value={brandForm.mode} onChange={e => setBrandForm({ ...brandForm, mode: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FFF' }}>
                    <option value="both">Both (Image & Text)</option>
                    <option value="text">Text Only</option>
                    <option value="image">Image Only</option>
                    <option value="image-variant">Image Variant (dark/light)</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>First Name</label>
                  <input value={brandForm.firstName} onChange={e => setBrandForm({ ...brandForm, firstName: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="Super" />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Last Name</label>
                  <input value={brandForm.lastName} onChange={e => setBrandForm({ ...brandForm, lastName: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="12" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Last Name Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="color" value={brandForm.lastNameColor} onChange={e => setBrandForm({ ...brandForm, lastNameColor: e.target.value })} style={{ width: 44, height: 40, border: '1px solid #E5E5E5', borderRadius: 10, cursor: 'pointer', padding: 2 }} />
                    <input value={brandForm.lastNameColor} onChange={e => setBrandForm({ ...brandForm, lastNameColor: e.target.value })} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="#FF5000" />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Full Logo URL</label>
                  <input value={brandForm.fullLogoUrl} onChange={e => setBrandForm({ ...brandForm, fullLogoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="https://..." />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Full Logo Alt</label>
                  <input value={brandForm.fullLogoAlt} onChange={e => setBrandForm({ ...brandForm, fullLogoAlt: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} placeholder="SuperUi Logo" />
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Navbar Logo Variants</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Navbar White Logo URL</label>
                  <input value={brandForm.navbarWhiteLogoUrl} onChange={e => setBrandForm({ ...brandForm, navbarWhiteLogoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Navbar Dark Logo URL</label>
                  <input value={brandForm.navbarDarkLogoUrl} onChange={e => setBrandForm({ ...brandForm, navbarDarkLogoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Footer Logo Variants</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Footer White Logo URL</label>
                  <input value={brandForm.footerWhiteLogoUrl} onChange={e => setBrandForm({ ...brandForm, footerWhiteLogoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Footer Dark Logo URL</label>
                  <input value={brandForm.footerDarkLogoUrl} onChange={e => setBrandForm({ ...brandForm, footerDarkLogoUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => handleSave('brand', brandForm)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#FF5000', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  <Save size={15} /> Save
                </button>
                <button onClick={() => handleClear('brand')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'none', border: '1px solid #E5E5E5', borderRadius: 10, cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: 13 }}>
                  <Trash2 size={15} /> Clear
                </button>
              </div>
            </div>
          )}

          {activeTab === 'navbar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>Nav Links</label>
                <ArrayField items={navbarLinks} onChange={setNavbarLinks} fields={[
                  { key: 'to', placeholder: '/path' },
                  { key: 'label', placeholder: 'Label' },
                  { key: 'icon', placeholder: 'lucide icon (optional)' },
                ]} itemLabel="link" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>Dropdown Links</label>
                <ArrayField items={navbarDropdownLinks} onChange={setNavbarDropdownLinks} fields={[
                  { key: 'to', placeholder: '/path' },
                  { key: 'label', placeholder: 'Label' },
                  { key: 'icon', placeholder: 'lucide icon (optional)' },
                ]} itemLabel="dropdown link" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>More Section Title</label>
                <input value={navbarMoreTitle} onChange={e => setNavbarMoreTitle(e.target.value)} placeholder="e.g. More" style={{ width: '100%', maxWidth: 300, padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>More Links</label>
                <ArrayField items={navbarMoreLinks} onChange={setNavbarMoreLinks} fields={[
                  { key: 'to', placeholder: '/path' },
                  { key: 'label', placeholder: 'Label' },
                  { key: 'icon', placeholder: 'lucide icon (optional)' },
                ]} itemLabel="more link" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleSave('navbar', { links: navbarLinks, dropdownLinks: navbarDropdownLinks })} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#FF5000', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  <Save size={15} /> Save Nav Links
                </button>
                <button onClick={handleSaveMore} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#FF5000', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  <Save size={15} /> Save More Links
                </button>
                <button onClick={() => handleClear('navbar')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'none', border: '1px solid #E5E5E5', borderRadius: 10, cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: 13 }}>
                  <Trash2 size={15} /> Clear Nav
                </button>
                <button onClick={() => handleClear('navbarMore')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'none', border: '1px solid #E5E5E5', borderRadius: 10, cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: 13 }}>
                  <Trash2 size={15} /> Clear More
                </button>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Tagline</label>
                  <textarea value={footerForm.tagline} onChange={e => setFooterForm({ ...footerForm, tagline: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Support Email</label>
                  <input value={footerForm.supportEmail} onChange={e => setFooterForm({ ...footerForm, supportEmail: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Copyright</label>
                  <input value={footerForm.copyright} onChange={e => setFooterForm({ ...footerForm, copyright: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' }}>Tagline Bottom</label>
                <input value={footerForm.taglineBottom} onChange={e => setFooterForm({ ...footerForm, taglineBottom: e.target.value })} style={{ width: '100%', maxWidth: 400, padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>Link Groups</label>
                <GroupArrayField groups={footerForm.linkGroups} onChange={val => setFooterForm({ ...footerForm, linkGroups: val })} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>Social Links</label>
                <ArrayField items={footerForm.socialLinks} onChange={val => setFooterForm({ ...footerForm, socialLinks: val })} fields={[
                  { key: 'platform', placeholder: 'Platform (e.g. GitHub)' },
                  { key: 'url', placeholder: 'URL' },
                  { key: 'icon', placeholder: 'lucide icon name' },
                ]} itemLabel="social link" />
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 8 }}>Newsletter</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Title</label>
                  <input value={footerForm.newsletterTitle} onChange={e => setFooterForm({ ...footerForm, newsletterTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 2, minWidth: 300 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Subtitle</label>
                  <textarea value={footerForm.newsletterSubtitle} onChange={e => setFooterForm({ ...footerForm, newsletterSubtitle: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Placeholder</label>
                  <input value={footerForm.newsletterPlaceholder} onChange={e => setFooterForm({ ...footerForm, newsletterPlaceholder: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, display: 'block' }}>Button Text</label>
                  <input value={footerForm.newsletterButton} onChange={e => setFooterForm({ ...footerForm, newsletterButton: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => handleSave('footer', footerForm)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#FF5000', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  <Save size={15} /> Save
                </button>
                <button onClick={() => handleClear('footer')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'none', border: '1px solid #E5E5E5', borderRadius: 10, cursor: 'pointer', color: '#EF4444', fontWeight: 600, fontSize: 13 }}>
                  <Trash2 size={15} /> Clear
                </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-page-tabs {
            flex-wrap: wrap !important;
          }
          .admin-page-content {
            padding: 20px 16px !important;
            border-radius: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .admin-page-content {
            padding: 16px 12px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </div>
      )}
    </div>
  );
}

