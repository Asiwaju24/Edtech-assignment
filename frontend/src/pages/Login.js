import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ margin: '0 auto 12px', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>🎓</div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your EdTech account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" type="text" placeholder="Enter username"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Enter password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </p>
      </div>
    </div>
  );
}
