import { useEffect, useState } from 'react';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [installations, setInstallations] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    assigned_installation_id: '',
    password: ''
  });

  async function loadProfile() {
    const res = await api.get('/users/profile');

    setProfile(res.data);

    setForm({
      first_name: res.data.first_name || '',
      last_name: res.data.last_name || '',
      email: res.data.email || '',
      phone: res.data.phone || '',
      assigned_installation_id:
        res.data.assigned_installation_id || '',
      password: ''
    });
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/installations');
      setInstallations(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadProfile().catch(() =>
      setMessage('Please login to view your profile.')
    );

    loadInstallations();
  }, []);

  async function saveProfile() {
    try {
      const res = await api.put('/users/profile', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        assigned_installation_id:
          form.assigned_installation_id,
        password: form.password
      });

      setMessage(
        res.data.message ||
          'Profile updated successfully.'
      );

      loadProfile();
    } catch {
      setMessage('Failed to update profile.');
    }
  }

  async function uploadImage(e) {
    e.preventDefault();

    if (!image) {
      setMessage('Please select an image.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await api.put(
        '/users/profile/image',
        formData
      );

      setMessage(
        res.data.message ||
          'Profile image updated successfully.'
      );

      setPreview('');
      setImage(null);
      loadProfile();
    } catch {
      setMessage('Failed to upload image.');
    }
  }

  const fieldStyle = {
    width: '100%',
    maxWidth: '500px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '.4rem',
    fontWeight: '600',
    textAlign: 'center'
  };

  const inputStyle = {
    width: '100%',
    textAlign: 'center'
  };

  if (!profile) {
    return (
      <section className="card form-card">
        <p>{message || 'Loading profile...'}</p>
      </section>
    );
  }

  return (
    <>
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}
      >
        My Profile
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <section
          className="card form-card"
          style={{
            width: '100%',
            maxWidth: '850px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}
          >
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt="Profile"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #0b3d91'
                }}
              />
            ) : (
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  border: '4px solid #0b3d91',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                No Photo
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}
          >
            <div style={fieldStyle}>
              <label style={labelStyle}>First Name</label>

              <input
                style={inputStyle}
                value={form.first_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    first_name: e.target.value
                  })
                }
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Last Name</label>

              <input
                style={inputStyle}
                value={form.last_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    last_name: e.target.value
                  })
                }
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>

              <input
                style={inputStyle}
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number</label>

              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value
                  })
                }
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Installation</label>

              <select
                style={inputStyle}
                value={form.assigned_installation_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assigned_installation_id:
                      e.target.value
                  })
                }
              >
                <option value="">
                  Select Installation
                </option>

                {installations.map((installation) => (
                  <option
                    key={installation.installation_id}
                    value={installation.installation_id}
                  >
                    {installation.installation_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Change Password</label>

              <input
                style={inputStyle}
                type="password"
                value={form.password}
                placeholder="Leave blank to keep current password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={saveProfile}
              style={{
                width: '500px',
                maxWidth: '100%'
              }}
            >
              Save Profile Changes
            </button>
          </div>

          <hr />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              marginTop: '1rem'
            }}
          >
            <p>
              <strong>Rank:</strong>{' '}
              {profile.rank || 'Not Assigned'}
            </p>

            <p>
              <strong>Role:</strong> {profile.role}
            </p>
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

          <form
            onSubmit={uploadImage}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}
          >
            <label
              style={{
                fontWeight: '600',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Profile Picture
            </label>

            <input
              type="file"
              accept="image/*"
              style={{
                width: 'auto',
                margin: '0 auto'
              }}
              onChange={(e) => {
                const file = e.target.files[0];

                setImage(file);

                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #0b3d91'
                }}
              />
            )}

            <button
              type="submit"
              style={{
                width: '500px',
                maxWidth: '100%',
                margin: '0 auto'
              }}
            >
              Upload Profile Image
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

export default Profile;