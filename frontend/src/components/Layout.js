import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import API from '../api/client';
import {
  MdDashboard, MdMenuBook, MdAssignment, MdNotifications, MdLogout
} from 'react-icons/md';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications/').then(r => {
      setUnread(r.data.filter(n => !n.is_read).length);
    }).catch(() => {});

    const ws = new WebSocket(`ws://${window.location.host}/ws/notifications/`);
    ws.onmessage = () => setUnread(p => p + 1);
    return () => ws.close();
  }, []);

  const titles = {
    '/': 'Dashboard', '/courses': 'Courses',
    '/assignments': 'Assignments', '/notifications': 'Notifications',
  };
  const title = titles[location.pathname] || 'EdTech';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <span className="logo-text">Ed<span>Tech</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <MdDashboard /> Dashboard
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <MdMenuBook /> Courses
            </NavLink>
            <NavLink to="/assignments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <MdAssignment /> Assignments
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <MdNotifications /> Notifications
              {unread > 0 && <span className="nav-badge">{unread}</span>}
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <MdLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Welcome, <strong style={{ color: 'var(--accent)' }}>{user?.first_name || user?.username}</strong>
            </span>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
