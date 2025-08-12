import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase/firebaseConfig.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

export default function App() {
  const [tab, setTab] = useState('create');
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [editId, setEditId] = useState(null);

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [form, setForm] = useState({
    user: '',
    issues: '',
    date: '',
    hours: '',
    comment: '',
    status: 'Pending',
  });

  // Fetch users and statuses
  useEffect(() => {
    if (tab === 'create') {
      fetchUsers();
      fetchStatuses();
    }
  }, [tab]);

  // Fetch reports
  useEffect(() => {
    if (tab === 'list') {
      fetchReports();
    }
  }, [tab]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(data);
  };

  const fetchReports = async () => {
    const querySnapshot = await getDocs(collection(db, 'reports'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReports(data);
  };

  const fetchStatuses = async () => {
    const querySnapshot = await getDocs(collection(db, 'statuses'));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStatuses(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      user: '',
      issues: '',
      date: '',
      hours: '',
      comment: '',
      status: 'Pending',
    });
    setFormMode('create');
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!form.user || !form.issues || !form.date || !form.hours) {
      return alert('Please fill required fields!');
    }

    try {
      if (formMode === 'create') {
        await addDoc(collection(db, 'reports'), form);
        alert('Report created!');
      } else if (formMode === 'edit' && editId) {
        const reportRef = doc(db, 'reports', editId);
        await updateDoc(reportRef, form);
        alert('Report updated!');
      }
      resetForm();
      setTab('list');
      fetchReports();
    } catch (error) {
      console.error('Error saving document: ', error);
    }
  };

  const handleEdit = (report) => {
    setForm(report);
    setFormMode('edit');
    setEditId(report.id);
    setTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
      alert('Report deleted!');
      fetchReports();
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  // Lọc danh sách theo user và date
  const filteredReports = reports.filter((r) => {
    const matchUser = filterUser ? r.user === filterUser : true;
    const matchDate = filterDate ? r.date === filterDate : true;
    return matchUser && matchDate;
  });

  return (
    <div className="container">
      <h1>Work Report</h1>

      <div className="tabs">
        <button
          className={tab === 'create' ? 'active' : 'createActive'}
          onClick={() => {
            resetForm();
            setTab('create');
          }}
        >
          {formMode === 'edit' ? 'Edit Report' : 'Create'}
        </button>
        <button
          className={tab === 'list' ? 'active' : 'listActive'}
          onClick={() => setTab('list')}
        >
          List
        </button>
      </div>

      {/* CREATE FORM */}
      {tab === 'create' && (
        <div className="card">
          <label>
            User*
            <select name="user" value={form.user} onChange={handleChange}>
              <option value="">-- Select user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Issues*
            <input
              type="text"
              name="issues"
              value={form.issues}
              onChange={handleChange}
              placeholder="Short issues"
            />
          </label>

          <label>
            Date*
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </label>

          <label>
            Estimated Hours*
            <select name="hours" value={form.hours} onChange={handleChange}>
              <option value="">-- Select hours --</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} hour(s)
                </option>
              ))}
            </select>
          </label>

          <label>
            Comment
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Detailed comment"
            />
          </label>

          <label>
            Status*
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="">-- Select status --</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button onClick={handleSubmit} className="btn primary">
              {formMode === 'edit' ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="btn secondary">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* LIST + FILTER */}
      {tab === 'list' && (
        <div className="list-wrapper list-card">
          {/* Bộ lọc */}
          <div className="filters">
            <label>
              Filter by User:
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">All</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Filter by Date:
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </label>
          </div>

          {/* Danh sách có scroll */}
          <div className="list-scroll">
            {filteredReports.length === 0 ? (
              <p>No reports found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Issues</th>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Comment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.user}</td>
                      <td>{r.issues}</td>
                      <td>{r.date}</td>
                      <td>{r.hours}</td>
                      <td>{r.status}</td>
                      <td>{r.comment}</td>
                      <td>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
