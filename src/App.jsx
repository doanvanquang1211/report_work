import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase/firebaseConfig.js'; // Import Firestore config
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function App() {
  const [tab, setTab] = useState('create');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]); // danh sách user từ Firestore
    const [statuses, setStatuses] = useState([]);

  const [form, setForm] = useState({
    user: '',
    issues: '',
    date: '',
    hours: '',
    comment: '',
    status: 'Pending',
  });

  // Lấy danh sách users khi mở tab create
  useEffect(() => {
    if (tab === 'create') {
      fetchUsers();
       fetchStatuses();
    }
  }, [tab]);

  // Lấy dữ liệu từ Firestore khi mở tab list
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
    console.log("data",data);
    
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
    const querySnapshot = await getDocs(collection(db, "statuses"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setStatuses(data);
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.user || !form.issues || !form.date || !form.hours) {
      return alert('Please fill required fields!');
    }

    try {
      await addDoc(collection(db, 'reports'), form);
      alert('Report created!');
      setForm({
        user: '',
        issues: '',
        date: '',
        hours: '',
        comment: '',
        status: 'Pending',
      });
      setTab('list');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className="container">
      <h1>Work Report</h1>

      <div className="tabs">
        <button
          className={tab === 'create' ? 'active' : ''}
          onClick={() => setTab('create')}
        >
          Create
        </button>
        <button
          className={tab === 'list' ? 'active' : ''}
          onClick={() => setTab('list')}
        >
          List
        </button>
      </div>

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
              Create
            </button>
            <button
              onClick={() =>
                setForm({
                  user: '',
                  issues: '',
                  date: '',
                  hours: '',
                  comment: '',
                  status: 'Pending',
                })
              }
              className="btn secondary"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="card list-card">
          {reports.length === 0 ? (
            <p>No reports yet.</p>
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
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.user}</td>
                    <td>{r.issues}</td>
                    <td>{r.date}</td>
                    <td>{r.hours}</td>
                    <td>{r.status}</td>
                    <td>{r.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
