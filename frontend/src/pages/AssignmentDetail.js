import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

function GradeModal({ submission, onClose, onSaved }) {
  const [form, setForm] = useState({ score: submission.score || '', feedback: submission.feedback || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.patch(`/submissions/${submission.id}/grade/`, { ...form, status: 'graded' });
      toast.success('Graded successfully!');
      onSaved(); onClose();
    } catch { toast.error('Failed to grade.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Grade: {submission.student?.username}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Score</label>
            <input className="form-control" type="number" value={form.score}
              onChange={e => setForm({ ...form, score: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Feedback</label>
            <textarea className="form-control" value={form.feedback}
              onChange={e => setForm({ ...form, feedback: e.target.value })} placeholder="Add feedback for the student..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Grade'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const isTutor = user?.role === 'tutor';

  const load = () => {
    API.get(`/assignments/${id}/`).then(r => setAssignment(r.data)).catch(() => {});
    API.get(`/assignments/${id}/submissions/`).then(r => setSubmissions(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const mySubmission = submissions.find(s => s.student?.id === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a file.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('note', note);
      await API.post(`/assignments/${id}/submit/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment submitted!');
      setFile(null); setNote('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  if (!assignment) return <div className="loading-screen"><div className="spinner" /></div>;

  const due = new Date(assignment.due_date);
  const overdue = due < new Date();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📝 {assignment.title}</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <span className={`badge ${overdue ? 'badge-danger' : 'badge-warning'}`}>
            ⏰ Due: {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="badge badge-accent">Max Score: {assignment.max_score} pts</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 10 }}>Instructions</h3>
        <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{assignment.description}</p>
        {assignment.attachment && (
          <div style={{ marginTop: 14 }}>
            <a href={assignment.attachment} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📎 Download Attachment</a>
          </div>
        )}
      </div>

      {!isTutor && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
            {mySubmission ? '✅ Your Submission' : '📤 Submit Assignment'}
          </h3>
          {mySubmission ? (
            <div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className={`badge ${mySubmission.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                  {mySubmission.status === 'graded' ? '✅ Graded' : '⏳ Pending Review'}
                </span>
                {mySubmission.status === 'graded' && (
                  <span className="badge badge-accent">Score: {mySubmission.score}/{assignment.max_score}</span>
                )}
              </div>
              {mySubmission.feedback && (
                <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 6 }}>FEEDBACK FROM TUTOR</div>
                  <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>{mySubmission.feedback}</p>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <a href={mySubmission.file} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📎 View Submission</a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Upload Your Work *</label>
                <input className="form-control" type="file" onChange={e => setFile(e.target.files[0])} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note to Tutor (optional)</label>
                <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Any notes about your submission..." />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting || overdue}>
                {submitting ? 'Submitting...' : overdue ? 'Past Due Date' : '📤 Submit Assignment'}
              </button>
            </form>
          )}
        </div>
      )}

      {isTutor && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submissions ({submissions.length})</h3>
          {submissions.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>No submissions yet.</p>
          ) : submissions.map(s => (
            <div key={s.id} className="submission-item">
              <div className="user-avatar" style={{ width: 40, height: 40 }}>{s.student?.username?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.student?.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  Submitted: {new Date(s.submitted_at).toLocaleDateString()}
                </div>
                {s.note && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>"{s.note}"</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {s.status === 'graded' && (
                  <span className="badge badge-success">{s.score}/{assignment.max_score}</span>
                )}
                <a href={s.file} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>
                <button className="btn btn-primary btn-sm" onClick={() => setGradingSubmission(s)}>
                  {s.status === 'graded' ? 'Re-grade' : 'Grade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {gradingSubmission && (
        <GradeModal submission={gradingSubmission} onClose={() => setGradingSubmission(null)} onSaved={load} />
      )}
    </div>
  );
}
