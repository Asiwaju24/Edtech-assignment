import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

function CourseModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/courses/', form);
      toast.success('Course created!');
      onSaved();
      onClose();
    } catch { toast.error('Failed to create course.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Create New Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input className="form-control" placeholder="e.g. Introduction to Python" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" placeholder="What will students learn?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [tab, setTab] = useState('mine');
  const [showModal, setShowModal] = useState(false);
  const isTutor = user?.role === 'tutor';

  const load = () => {
    API.get('/courses/').then(r => setCourses(r.data)).catch(() => {});
    if (!isTutor) API.get('/courses/all/').then(r => setAllCourses(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleEnroll = async (id) => {
    try {
      await API.post(`/courses/${id}/enroll/`);
      toast.success('Enrolled successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Already enrolled.');
    }
  };

  const display = tab === 'mine' ? courses : allCourses.filter(c => !c.is_enrolled);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">{isTutor ? 'Manage your courses' : 'Browse and enroll in courses'}</p>
        </div>
        {isTutor && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Course</button>
        )}
      </div>

      {!isTutor && (
        <div className="tabs">
          <button className={`tab${tab === 'mine' ? ' active' : ''}`} onClick={() => setTab('mine')}>My Courses</button>
          <button className={`tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>Discover</button>
        </div>
      )}

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">{tab === 'mine' ? 'No courses yet' : 'No more courses to discover'}</div>
          <div className="empty-desc">
            {isTutor ? 'Create your first course to get started.' : 'Switch to Discover to find courses.'}
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {display.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-thumb">📘</div>
              <div className="course-body">
                <div className="course-title">{course.title}</div>
                <div className="course-desc">{course.description}</div>
                <div className="course-meta">
                  <span>👤 <span className="course-tutor">{course.tutor?.username}</span></span>
                  <span>🎓 {course.student_count} students</span>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  {(isTutor || course.is_enrolled) ? (
                    <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">Open Course</Link>
                  ) : (
                    <button className="btn btn-success btn-sm" onClick={() => handleEnroll(course.id)}>Enroll Now</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CourseModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}
