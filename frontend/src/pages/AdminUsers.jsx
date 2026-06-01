import React from 'react';
import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
    loadInstallations();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  function generatePassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';

    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setEditingUser({
      ...editingUser,
      password
    });

    openPopup('Password Generated', `New password: ${password}`);
  }

  async function loadUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load users.');
    }
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/installations');
      setInstallations(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load installations.');
    }
  }

  async function updateRole(userId, role) {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role });

      openPopup('Success', res.data.message || 'User role updated.');
      loadUsers();
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.message || 'Failed to update role.'
      );
    }
  }

  async function saveUser() {
    try {
      const res = await api.put(`/admin/users/${editingUser.user_id}`, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
        phone: editingUser.phone,
        rank: editingUser.rank,
        assigned_installation_id: editingUser.assigned_installation_id,
        password: editingUser.password || ''
      });

      openPopup('Success', res.data.message || 'User information updated.');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update user.'
      );
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
      {showPopup && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: '#111',
                fontSize: '1.25rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              ×
            </button>

            <h3>{popupTitle}</h3>
            <p>{message}</p>

            <button onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          gap: '1rem'
        }}
      >
        <button onClick={() => window.history.back()}>
          Go Back
        </button>

        <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>
          Admin User Management
        </h2>

        <div style={{ width: '110px' }} />
      </div>

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
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.rank}</td>
                <td>{displayRole(user.role)}</td>

                <td>
                  <select
                    value={dropdownRole(user.role)}
                    onChange={(e) => updateRole(user.user_id, e.target.value)}
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
            <button
              onClick={() => setEditingUser(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: '#111',
                fontSize: '1.25rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              ×
            </button>

            <h3>Edit User</h3>

            <input
              placeholder="First Name"
              value={editingUser.first_name || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, first_name: e.target.value })
              }
            />

            <input
              placeholder="Last Name"
              value={editingUser.last_name || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, last_name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={editingUser.email || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              value={editingUser.phone || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone: e.target.value })
              }
            />

            <select
  value={editingUser.rank || ''}
  onChange={(e) =>
    setEditingUser({
      ...editingUser,
      rank: e.target.value
    })
  }
>
  <option value="">Select Rank</option>

  <option value="E-1 Private (PVT)">
    E-1 Private (PVT)
  </option>

  <option value="E-2 Private First Class (PFC)">
    E-2 Private First Class (PFC)
  </option>

  <option value="E-3 Lance Corporal (LCpl)">
    E-3 Lance Corporal (LCpl)
  </option>

  <option value="E-4 Corporal (Cpl)">
    E-4 Corporal (Cpl)
  </option>

  <option value="E-5 Sergeant (Sgt)">
    E-5 Sergeant (Sgt)
  </option>

  <option value="E-6 Staff Sergeant (SSgt)">
    E-6 Staff Sergeant (SSgt)
  </option>

  <option value="E-7 Gunnery Sergeant (GySgt)">
    E-7 Gunnery Sergeant (GySgt)
  </option>

  <option value="E-8 Master Sergeant (MSgt)">
    E-8 Master Sergeant (MSgt)
  </option>

  <option value="E-8 First Sergeant (1stSgt)">
    E-8 First Sergeant (1stSgt)
  </option>

  <option value="E-9 Master Gunnery Sergeant (MGySgt)">
    E-9 Master Gunnery Sergeant (MGySgt)
  </option>

  <option value="E-9 Sergeant Major (SgtMaj)">
    E-9 Sergeant Major (SgtMaj)
  </option>
</select>

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
              type="text"
              placeholder="New Password"
              value={editingUser.password || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
            />

            <button type="button" onClick={generatePassword}>
              Auto Generate Password
            </button>

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