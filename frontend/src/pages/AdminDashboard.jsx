import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedMentors, setSelectedMentors] = useState({});
  const [message, setMessage] = useState('');

  async function loadRequests() {
    const requestRes = await api.get('/admin/requests');
    setRequests(requestRes.data);

    const mentorRes = await api.get('/admin/mentors');
    setMentors(mentorRes.data);
  }

  useEffect(() => {
    loadRequests().catch(() =>
      setMessage('Admin login required.')
    );

    const interval = setInterval(() => {
      loadRequests().catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id, status) {
    await api.put(`/admin/requests/${id}/status`, { status });
    setMessage('Request updated.');
    loadRequests();
  }

  async function assignMentor(requestId) {
    if (!selectedMentors[requestId]) {
      setMessage('Please select a mentor.');
      return;
    }

    await api.put(`/admin/requests/${requestId}/assign`, {
      mentor_user_id: selectedMentors[requestId]
    });

    setMessage('Mentor assigned successfully.');
    loadRequests();
  }

  return (
    <section>
      <div style={{ textAlign: 'center' }}>
        <h2>Admin Dashboard</h2>

        {message && <p className="success">{message}</p>}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <Link className="button" to="/admin/users">
            Manage Users
          </Link>

          <Link className="button" to="/admin/content">
            Manage Content
          </Link>

         <Link className="button" to="/admin/installations">
  Add / Remove Installations
</Link>
        </div>
      </div>

      <h3 style={{ textAlign: 'center' }}>
        Mentorship Requests
      </h3>

      <div className="card request-table-card">
        <table className="request-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Marine</th>
              <th>Installation</th>
              <th>Status</th>
              <th>Topic</th>
              <th>Mentor</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {[...requests]
              .sort(
                (a, b) =>
                  new Date(b.created_at) -
                  new Date(a.created_at)
              )
              .map((request) => {
                const matchingMentors = mentors.filter(
                  (mentor) =>
                    Number(mentor.installation_id) ===
                    Number(request.installation_id)
                );

                return (
                  <tr key={request.request_id}>
                    <td>
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>{request.mentee_name}</td>

                    <td>{request.installation_name}</td>

                    <td>{request.status}</td>

                    <td>{request.message}</td>

                    <td>
                      <select
                        value={
                          selectedMentors[
                            request.request_id
                          ] || ''
                        }
                        onChange={(e) =>
                          setSelectedMentors({
                            ...selectedMentors,
                            [request.request_id]:
                              e.target.value
                          })
                        }
                      >
                        <option value="">
                          Select Mentor
                        </option>

                        {matchingMentors.map((mentor) => (
                          <option
                            key={mentor.user_id}
                            value={mentor.user_id}
                          >
                            {mentor.first_name}{' '}
                            {mentor.last_name}
                          </option>
                        ))}
                      </select>

                      {matchingMentors.length === 0 && (
                        <p className="muted">
                          No mentors available
                        </p>
                      )}
                    </td>

                    <td className="request-action">
                      <button
                        onClick={() =>
                          assignMentor(
                            request.request_id
                          )
                        }
                      >
                        Assign
                      </button>

                      <button
                        className="danger"
                        onClick={() =>
                          updateStatus(
                            request.request_id,
                            'closed'
                          )
                        }
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminDashboard;