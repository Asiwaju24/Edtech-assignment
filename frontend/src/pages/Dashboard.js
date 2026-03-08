import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, assignments: 0, submissions: 0, notifications: 0 });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get('/courses/'),
      API.get('/notifications/'),
    ]).then(([courses, notifs]) => {
      const courseList = courses.data;
      setRecentCourses(courseList.slice(0, 3));
      const unread = notifs.data.filter(n => !n.is_read).length;
      setStats(s => ({ ...s, courses: courseList.length, notifications: unread }));
    }).catch(() => {});
  }, []);

  const isTutor = user?.role === 'tutor';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {isTutor ? '👨‍🏫' : '🎒'} Good day, {user?.first_name || user?.username}!
        </h1>
        <p className="page-subtitle">
          {isTutor ? 'Manage your courses, resources, and assignments.' : 'Track your courses and assignments.'}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.courses}</div>
          <div className="stat-label">{isTutor ? 'My Courses' : 'Enrolled Courses'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.assignments}</div>
          <div className="stat-label">Assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.submissions}</div>
          <div className="stat-label">{isTutor ? 'Submissions' : 'Submitted'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-value">{stats.notifications}</div>
          <div className="stat-label">Unread Notifications</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 8 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Recent Courses</h3>
            <Link to="/courses" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentCourses.length === 0
            ? <p style={{ color: 'var(--text2)', fontSize: 14 }}>No courses yet.</p>
            : recentCourses.map(c => (
              <Link to={`/courses/${c.id}`} key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📘</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.student_count} students</div>
                </div>
              </Link>
            ))
          }
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/courses" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📚 {isTutor ? 'Create a Course' : 'Browse Courses'}
            </Link>
            <Link to="/assignments" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📝 View Assignments
            </Link>
            <Link to="/notifications" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🔔 Check Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
