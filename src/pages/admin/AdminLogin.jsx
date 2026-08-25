import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Zap, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axiosInstance';
import useAdminStore from '../../store/adminStore';
import toast from 'react-hot-toast';
import Seo from '../../components/common/Seo';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAdminStore();
  const navigate    = useNavigate();

  document.title = 'Admin Login -- SuperUi';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      setAuth(data.token, { email: form.email });
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Admin Login" description="SuperUi Admin Panel Login" url="/admin/login" noindex />
      <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,107,0,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 20,
        padding: '48px 44px',
        width: '100%', maxWidth: 420,
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #FF5000, #FF8C33)',
            borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(255,107,0,0.3)',
          }}>
            <Zap size={26} color="white" fill="white" />
          </div>
          <h1 style={{
            fontFamily: 'Space Grotesk', fontWeight: 700,
             fontSize: 24, color: '#1A1A1A',
            marginBottom: 6,
          }}>
            Admin Login
          </h1>
          <p style={{ color: '#666', fontSize: 13 }}>SuperUi Store Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="input-group" style={{ marginBottom: 18 }}>
            <label className="input-label" htmlFor="admin-email">
              <Mail size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="input"
              placeholder="admin@SuperUi.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 28 }}>
            <label className="input-label" htmlFor="admin-password">
              <Lock size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',                   color: '#666', cursor: 'pointer',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 28 }}>
          Authorized personnel only
        </p>
      </div>
    </div>
    </>
  );
}

