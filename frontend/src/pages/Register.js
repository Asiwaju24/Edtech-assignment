import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data;
      toast.error(typeof msg === 'object' ? Object.values(msg)[0]?.[0] : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join EdTech as a tutor or student</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" type="text" placeholder="John"
                value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" type="text" placeholder="Doe"
                value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" type="text" placeholder="username"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="you@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {['student', 'tutor'].map(r => (
                <label key={r} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: form.role === r ? 'rgba(79,142,247,0.1)' : 'var(--bg3)', border: `1px solid ${form.role === r ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, textTransform: 'capitalize', color: form.role === r ? 'var(--accent)' : 'var(--text2)' }}>
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={e => setForm({ ...form, role: e.target.value })} style={{ display: 'none' }} />
                  {r === 'student' ? '🎒' : '👨‍🏫'} {r}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
