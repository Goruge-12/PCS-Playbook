import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
    loadInstallations();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/installations');
      setInstallations(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateRole(userId, role) {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });

      setMessage('User role updated.');
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update role.');
    }
  }

  async function saveUser() {
    try {
      await api.put(`/admin/users/${editingUser.user_id}`, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
        phone: editingUser.phone,
        rank: editingUser.rank,
        assigned_installation_id: editingUser.assigned_installation_id,
        password: editingUser.password || ''
      });

      setMessage('User information updated.');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update user.');
    }
  }

  function displayRole(role) {
    if (role === 'mentee') return 'Marine';
    return role;
  }

  function dropdownRole(role) {
    if (role === 'mentee') return 'marine';
    return role;
  }

  return (
    <section>
      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    gap: '1rem'
  }}
>

  <button
    onClick={() => window.history.back()}
  >
    Go Back
  </button>

  <h2
    style={{
      flex: 1,
      textAlign: 'center',
      margin: 0
    }}
  >
    Admin User Management
  </h2>

  <div style={{ width: '110px' }} />

</div>

{message && (
  <p
    className="success"
    style={{
      textAlign: 'center'
    }}
  >
    {message}
  </p>
)}

      <div className="card request-table-card">
        <table className="request-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rank</th>
              <th>Role</th>
              <th>Change Role</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>

                <td>{user.email}</td>

                <td>{user.rank}</td>

                <td>{displayRole(user.role)}</td>

                <td>
                  <select
                    value={dropdownRole(user.role)}
                    onChange={(e) =>
                      updateRole(user.user_id, e.target.value)
                    }
                  >
                    <option value="marine">Marine</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button
                    onClick={() =>
                      setEditingUser({
                        ...user,
                        password: ''
                      })
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Edit User</h3>

            <input
              placeholder="First Name"
              value={editingUser.first_name || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  first_name: e.target.value
                })
              }
            />

            <input
              placeholder="Last Name"
              value={editingUser.last_name || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  last_name: e.target.value
                })
              }
            />

            <input
              placeholder="Email"
              value={editingUser.email || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  email: e.target.value
                })
              }
            />

            <input
              placeholder="Phone"
              value={editingUser.phone || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  phone: e.target.value
                })
              }
            />

            <input
              placeholder="Rank"
              value={editingUser.rank || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  rank: e.target.value
                })
              }
            />

            <select
              value={editingUser.assigned_installation_id || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  assigned_installation_id: e.target.value
                })
              }
            >
              <option value="">Select Installation</option>

              {installations.map((installation) => (
                <option
                  key={installation.installation_id}
                  value={installation.installation_id}
                >
                  {installation.installation_name}
                </option>
              ))}
            </select>

            <input
              type="password"
              placeholder="New Password"
              value={editingUser.password || ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  password: e.target.value
                })
              }
            />

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '1rem'
              }}
            >
              <button onClick={saveUser}>
                Save Changes
              </button>

              <button
                className="danger"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUsers;