import { useState } from 'react';
import { Mail, Phone, MessageSquare, Wrench, Rocket, Send, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import useThemeStore from '../store/themeStore';
import Seo from '../components/common/Seo';

export default function ContactPage() {
  const { darkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState('custom');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [customForm, setCustomForm] = useState({
    name: '',
    email: '',
    phone: '',
    websiteType: '',
    requirements: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    currentWebsite: '',
    hostingProvider: '',
    issues: '',
    timeline: '',
    budget: '',
  });

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact/custom-website', customForm);
      toast.success('Custom website inquiry sent successfully!');
      setCustomForm({ name: '', email: '', phone: '', websiteType: '', requirements: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSending(false);
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/contact/maintenance', maintenanceForm);
      toast.success('Maintenance request sent successfully!');
      setMaintenanceForm({ name: '', email: '', phone: '', company: '', serviceType: '', currentWebsite: '', hostingProvider: '', issues: '', timeline: '', budget: '' });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #E5E5E5', fontSize: 14,
    background: darkMode ? '#1E1E1E' : '#F7F7F7',
    color: darkMode ? '#FFF' : '#1A1A1A', outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13,
    color: darkMode ? '#CCC' : '#444',
  };

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch for custom website development, rediment websites, portfolio templates, maintenance, and deployment services. Response within 24 hours."
        keywords={['contact', 'custom website', 'rediment website', 'portfolio', 'website maintenance', 'deployment', 'web development']}
        url="/contact"
      />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px', fontFamily: "'Inter', system-ui, sans-serif" }} className="contact-page-container">
      <div className="accent-line" style={{ margin: "auto" }} />
      <h1 style={{ fontWeight: 800, fontSize: 32, color: darkMode ? '#FFF' : '#1A1A1A', marginBottom: 8, textAlign: 'center' }}>Contact Us</h1>
      <p style={{ color: darkMode ? '#888' : '#666', fontSize: 14, textAlign: 'center', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
        Choose a service below and fill out the form. Our team will get back to you within 24 hours.
      </p>

      {/* Success Toast */}
      {sent && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          <CheckCircle2 size={20} color="#16A34A" />
          <span style={{ color: '#166534', fontWeight: 700, fontSize: 14 }}>Message sent successfully!</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, justifyContent: 'center' }} className="contact-tabs">
        <button
          onClick={() => setActiveTab('custom')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            border: activeTab === 'custom' ? '2px solid #FF5000' : '1.5px solid #E5E5E5',
            background: activeTab === 'custom' ? '#FFF4EE' : (darkMode ? '#1E1E1E' : '#F7F7F7'),
            color: activeTab === 'custom' ? '#FF5000' : (darkMode ? '#CCC' : '#666'),
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Rocket size={16} /> Custom Website
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            border: activeTab === 'maintenance' ? '2px solid #FF5000' : '1.5px solid #E5E5E5',
            background: activeTab === 'maintenance' ? '#FFF4EE' : (darkMode ? '#1E1E1E' : '#F7F7F7'),
            color: activeTab === 'maintenance' ? '#FF5000' : (darkMode ? '#CCC' : '#666'),
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Wrench size={16} /> Maintenance / Setup / Deployment
        </button>
      </div>

      {/* Custom Website Form */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} style={{
          background: darkMode ? '#1A1A1A' : '#FFFFFF',
          border: '1px solid #E5E5E5', borderRadius: 20, padding: '36px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }} className="contact-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }} className="contact-form-header">
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF4EE', border: '1px solid #FFE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}>
              <Rocket size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: darkMode ? '#FFF' : '#1A1A1A', margin: 0 }}>Custom Website Inquiry</h2>
              <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Tell us about your dream website project</p>
            </div>
           </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="contact-form-grid">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} type="text" required value={customForm.name} onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input style={inputStyle} type="email" required value={customForm.email} onChange={e => setCustomForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input style={inputStyle} type="tel" required value={customForm.phone} onChange={e => setCustomForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={labelStyle}>Website Type *</label>
              <select style={{ ...inputStyle, background: darkMode ? '#1E1E1E' : '#FFF' }} required value={customForm.websiteType} onChange={e => setCustomForm(p => ({ ...p, websiteType: e.target.value }))}>
                <option value="">Select Type</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Business / Corporate">Business / Corporate</option>
                <option value="Blog / Magazine">Blog / Magazine</option>
                <option value="Landing Page">Landing Page</option>
                <option value="SaaS / Web App">SaaS / Web App</option>
                <option value="Educational / LMS">Educational / LMS</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Detailed Requirements *</label>
              <textarea
                rows={6}
                required
                placeholder="Describe your website requirements in detail. Include features, design preferences, target audience, budget range, timeline, and any specific functionality you need..."
                value={customForm.requirements}
                onChange={e => setCustomForm(p => ({ ...p, requirements: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={sending} style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px' }}>
            {sending ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Send size={15} /> Send Inquiry</>}
          </button>
        </form>
      )}

      {/* Maintenance / Setup / Deployment Form */}
      {activeTab === 'maintenance' && (
        <form onSubmit={handleMaintenanceSubmit} style={{
          background: darkMode ? '#1A1A1A' : '#FFFFFF',
          border: '1px solid #E5E5E5', borderRadius: 20, padding: '36px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF4EE', border: '1px solid #FFE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}>
              <Wrench size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: darkMode ? '#FFF' : '#1A1A1A', margin: 0 }}>Website Maintenance / Setup / Deployment</h2>
              <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>Get a detailed analysis and quote for your website needs</p>
            </div>
           </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="contact-form-grid">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} type="text" required value={maintenanceForm.name} onChange={e => setMaintenanceForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input style={inputStyle} type="email" required value={maintenanceForm.email} onChange={e => setMaintenanceForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input style={inputStyle} type="tel" required value={maintenanceForm.phone} onChange={e => setMaintenanceForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={labelStyle}>Company Name</label>
              <input style={inputStyle} type="text" value={maintenanceForm.company} onChange={e => setMaintenanceForm(p => ({ ...p, company: e.target.value }))} placeholder="Your Company (optional)" />
            </div>
            <div>
              <label style={labelStyle}>Service Type *</label>
              <select style={{ ...inputStyle, background: darkMode ? '#1E1E1E' : '#FFF' }} required value={maintenanceForm.serviceType} onChange={e => setMaintenanceForm(p => ({ ...p, serviceType: e.target.value }))}>
                <option value="">Select Service</option>
                <option value="Website Maintenance">Website Maintenance</option>
                <option value="Website Setup">Website Setup</option>
                <option value="Server Deployment">Server Deployment</option>
                <option value="Domain & Hosting Setup">Domain & Hosting Setup</option>
                <option value="SSL & Security Setup">SSL & Security Setup</option>
                <option value="Performance Optimization">Performance Optimization</option>
                <option value="Bug Fixes & Updates">Bug Fixes & Updates</option>
                <option value="Full Website Build">Full Website Build</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Current Website URL</label>
              <input style={inputStyle} type="url" value={maintenanceForm.currentWebsite} onChange={e => setMaintenanceForm(p => ({ ...p, currentWebsite: e.target.value }))} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <label style={labelStyle}>Hosting Provider</label>
              <input style={inputStyle} type="text" value={maintenanceForm.hostingProvider} onChange={e => setMaintenanceForm(p => ({ ...p, hostingProvider: e.target.value }))} placeholder="e.g. AWS, Vercel, GoDaddy" />
            </div>
            <div>
              <label style={labelStyle}>Preferred Timeline</label>
              <input style={inputStyle} type="text" value={maintenanceForm.timeline} onChange={e => setMaintenanceForm(p => ({ ...p, timeline: e.target.value }))} placeholder="e.g. Within 2 weeks" />
            </div>
            <div>
              <label style={labelStyle}>Budget Range (?)</label>
              <input style={inputStyle} type="text" value={maintenanceForm.budget} onChange={e => setMaintenanceForm(p => ({ ...p, budget: e.target.value }))} placeholder="e.g. ?5,000 - ?20,000" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Detailed Analysis / Issues Description *</label>
              <textarea
                rows={6}
                required
                placeholder="Provide a detailed analysis of your current website issues, required updates, deployment needs, or any specific technical requirements. Include error messages, performance issues, feature requests, or anything else that will help us understand your needs..."
                value={maintenanceForm.issues}
                onChange={e => setMaintenanceForm(p => ({ ...p, issues: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={sending} style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px' }}>
            {sending ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <><Send size={15} /> Send Request</>}
          </button>
        </form>
      )}

      {/* Contact Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: darkMode ? '#1C1C1C' : '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF4EE', border: '1px solid #FFE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}><Mail size={20} /></div>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#FFF' : '#1A1A1A' }}>hello@SuperUi.com</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: darkMode ? '#1C1C1C' : '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF4EE', border: '1px solid #FFE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}><Phone size={20} /></div>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#FFF' : '#1A1A1A' }}>+91 98765 43210</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', background: darkMode ? '#1C1C1C' : '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF4EE', border: '1px solid #FFE4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5000' }}><MessageSquare size={20} /></div>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Response Time</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#FFF' : '#1A1A1A' }}>Within 24 Hours</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .contact-form-grid { grid-template-columns: 1fr !important; }
          form[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .contact-page-container {
            padding: 32px 16px 60px !important;
          }
          .contact-form {
            padding: 24px 20px !important;
          }
          .contact-form-header {
            margin-bottom: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .contact-page-container {
            padding: 24px 10px 48px !important;
          }
          .contact-form {
            padding: 20px 14px !important;
            border-radius: 14px !important;
          }
        }
        @media (max-width: 768px) {
          .contact-tabs {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .contact-tabs button {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
    </>
  );
}

