import { useEffect, useState } from 'react';
import api from '../services/api';

function MentorRequest() {
  const [installations, setInstallations] = useState([]);
  const [form, setForm] = useState({
    installation_id: '',
    message: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/installations')
      .then((res) => setInstallations(res.data))
      .catch(() => setInstallations([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post('/mentor-requests', form);
      setMessage('Mentor request submitted successfully.');
      setForm({ installation_id: '', message: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Request failed.');
    }
  }

  return (
    <div className="card form-card">
      <h2>Request a Mentor</h2>

      {message && <p className="success-text">{message}</p>}

      <form onSubmit={handleSubmit}>
        <select
          value={form.installation_id}
          onChange={(e) =>
            setForm({ ...form, installation_id: e.target.value })
          }
        >
          <option value="">Select Duty Station</option>

          {installations.map((installation) => (
            <option
              key={installation.installation_id}
              value={installation.installation_id}
            >
              {installation.installation_name}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Explain what kind of PCS help you need..."
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default MentorRequest;