import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

const RESOURCE_ICONS = { pdf: '📄', video: '🎥', doc: '📝', link: '🔗' };

function AddResourceModal({ courseId, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', resource_type: 'pdf', url: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await API.post(`/courses/${courseId}/resources/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resource added!');
      onSaved(); onClose();
    } catch { toast.error('Failed to add resource.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Add Resource</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={form.resource_type} onChange={e => setForm({ ...form, resource_type: e.target.value })}>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="doc">Document</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          {form.resource_type === 'link' ? (
            <div className="form-group">
              <label className="form-label">URL</label>
              <input className="form-control" type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Upload File</label>
              <input className="form-control" type="file" onChange={e => setFile(e.target.files[0])} />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Resource'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddAssignmentModal({ courseId, onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', due_date: '', max_score: 100 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);
      await API.post(`/courses/${courseId}/assignments/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment created!');
      onSaved(); onClose();
    } catch { toast.error('Failed to create assignment.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Create Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-control" type="datetime-local" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Max Score</label>
              <input className="form-control" type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Attachment (optional)</label>
            <input className="form-control" type="file" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('resources');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const isTutor = user?.role === 'tutor';

  const load = () => {
    API.get(`/courses/${id}/`).then(r => setCourse(r.data)).catch(() => {});
    API.get(`/courses/${id}/resources/`).then(r => setResources(r.data)).catch(() => {});
    API.get(`/courses/${id}/assignments/`).then(r => setAssignments(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  if (!course) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📘 {course.title}</h1>
        <p className="page-subtitle">{course.description}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-accent">👤 {course.tutor?.username}</span>
          <span className="badge badge-success">🎓 {course.student_count} students</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab${tab === 'resources' ? ' active' : ''}`} onClick={() => setTab('resources')}>Resources ({resources.length})</button>
          <button className={`tab${tab === 'assignments' ? ' active' : ''}`} onClick={() => setTab('assignments')}>Assignments ({assignments.length})</button>
        </div>
        {isTutor && (
          <button className="btn btn-primary btn-sm" onClick={() => tab === 'resources' ? setShowResourceModal(true) : setShowAssignmentModal(true)}>
            + Add {tab === 'resources' ? 'Resource' : 'Assignment'}
          </button>
        )}
      </div>

      {tab === 'resources' && (
        resources.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📂</div><div className="empty-title">No resources yet</div></div>
        ) : resources.map(r => (
          <div key={r.id} className="resource-item">
            <div className="resource-icon">{RESOURCE_ICONS[r.resource_type] || '📁'}</div>
            <div className="resource-info">
              <div className="resource-title">{r.title}</div>
              <div className="resource-type">{r.resource_type}</div>
              {r.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{r.description}</div>}
            </div>
            {r.file && <a href={r.file} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Download</a>}
            {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Open Link</a>}
          </div>
        ))
      )}

      {tab === 'assignments' && (
        assignments.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📝</div><div className="empty-title">No assignments yet</div></div>
        ) : (
          <div className="card-grid">
            {assignments.map(a => {
              const due = new Date(a.due_date);
              const overdue = due < new Date();
              return (
                <div key={a.id} className="assignment-card">
                  <div className="assignment-title">{a.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', margin: '6px 0 12px', lineHeight: 1.5 }}>{a.description}</p>
                  <div className={`due-date${overdue ? ' overdue' : ''}`}>
                    ⏰ Due: {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>Max Score: {a.max_score} pts</div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <a href={`/assignments/${a.id}`} className="btn btn-primary btn-sm">
                      {isTutor ? `View Submissions (${a.submission_count})` : 'Submit Assignment'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showResourceModal && <AddResourceModal courseId={id} onClose={() => setShowResourceModal(false)} onSaved={load} />}
      {showAssignmentModal && <AddAssignmentModal courseId={id} onClose={() => setShowAssignmentModal(false)} onSaved={load} />}
    </div>
  );
}
