import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';

export default function Assignments() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    API.get('/courses/').then(async r => {
      const withAssignments = await Promise.all(r.data.map(async c => {
        const res = await API.get(`/courses/${c.id}/assignments/`);
        return { ...c, assignments: res.data };
      }));
      setCourses(withAssignments.filter(c => c.assignments.length > 0));
    }).catch(() => {});
  }, []);

  const allAssignments = courses.flatMap(c => c.assignments.map(a => ({ ...a, course: c })));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Assignments</h1>
        <p className="page-subtitle">All assignments across your courses</p>
      </div>

      {allAssignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-title">No assignments yet</div>
          <div className="empty-desc">Assignments will appear here once added to your courses.</div>
        </div>
      ) : (
        <div className="card-grid">
          {allAssignments.map(a => {
            const due = new Date(a.due_date);
            const overdue = due < new Date();
            return (
              <div key={a.id} className="assignment-card">
                <div style={{ marginBottom: 6 }}>
                  <span className="badge badge-accent" style={{ fontSize: 11 }}>📘 {a.course.title}</span>
                </div>
                <div className="assignment-title">{a.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', margin: '6px 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.description}
                </p>
                <div className={`due-date${overdue ? ' overdue' : ''}`}>
                  ⏰ {overdue ? 'Was due' : 'Due'}: {due.toLocaleDateString()}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>Max: {a.max_score} pts</div>
                <div style={{ marginTop: 14 }}>
                  <Link to={`/assignments/${a.id}`} className="btn btn-primary btn-sm">View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
