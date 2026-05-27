import { useEffect, useState } from 'react';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  async function loadProfile() {
    const res = await api.get('/users/profile');
    setProfile(res.data);
  }

  useEffect(() => {
    loadProfile().catch(() => setMessage('Please login to view your profile.'));
  }, []);

  async function uploadImage(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);
    const res = await api.put('/users/profile/image', formData);
    setMessage(res.data.message);
    loadProfile();
  }

  if (!profile) return <p>{message || 'Loading profile...'}</p>;

  return (
    <section className="card form-card">
      <h2>My Profile</h2>
      {profile.profile_image_url && <img className="profile-img" src={profile.profile_image_url} alt="Profile" />}
      <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      {message && <p className="success">{message}</p>}
      <form onSubmit={uploadImage}>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Upload Profile Image</button>
      </form>
    </section>
  );
}

export default Profile;
