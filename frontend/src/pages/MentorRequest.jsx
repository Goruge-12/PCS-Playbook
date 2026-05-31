import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MentorRequest() {
  const [installations, setInstallations] = useState([]);
  const [form, setForm] = useState({
    installation_id: '',
    message: ''
  });
  const [message, setMessage] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

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

      setMessage(
        'Mentor request submitted successfully.'
      );

      setForm({
        installation_id: '',
        message: ''
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Request failed.'
      );
    }
  }

  if (!isLoggedIn) {
    return (
      <div
        className="card form-card"
        style={{
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}
        >
          Request a Mentor
        </h2>

        <p
          className="muted"
          style={{
            marginBottom: '2rem'
          }}
        >
          If you would like to request a mentor,
          please login or register for an account.
          Once logged in, you can submit a mentor
          request and connect with Marines at your
          future duty station.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <Link
            className="button"
            to="/login"
          >
            Login
          </Link>

          <Link
            className="button secondary"
            to="/register"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <div
        style={{
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}
        >
          Request a Mentor
        </h2>

        <p
          className="muted"
          style={{
            marginBottom: '1.5rem'
          }}
        >
          Submit a mentorship request for your future
          duty station and connect with Marines who
          have already been there.
        </p>

        {message && (
          <p
            className="success-text"
            style={{
              textAlign: 'center'
            }}
          >
            {message}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <select
          value={form.installation_id}
          onChange={(e) =>
            setForm({
              ...form,
              installation_id: e.target.value
            })
          }
        >
          <option value="">
            Select Duty Station
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

        <textarea
          rows="6"
          placeholder="Explain what kind of PCS help you need..."
          value={form.message}
          onChange={(e) =>
            setForm({
              ...form,
              message: e.target.value
            })
          }
        />

        <button type="submit">
          Submit Request
        </button>
      </form>
    </div>
  );
}

export default MentorRequest;