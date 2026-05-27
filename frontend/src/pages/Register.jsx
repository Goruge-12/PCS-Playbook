import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [installations, setInstallations] = useState([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    rank: '',
    assigned_installation_id: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/installations')
      .then((res) => setInstallations(res.data))
      .catch(() => setInstallations([]));
  }, []);

  const passwordLength = form.password.length;
  const passwordIsValid = passwordLength >= 8;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!passwordIsValid) {
      setMessage(
        'Password must be at least 8 characters.'
      );
      return;
    }

    try {
      await api.post('/auth/register', form);

      navigate('/login');

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Registration failed.'
      );
    }
  }

  return (
    <div className="card form-card">
      <h2>Create Account</h2>

      {message && (
        <p className="error">{message}</p>
      )}

      <form onSubmit={handleSubmit}>

        <input
          placeholder="First name"
          value={form.first_name}
          onChange={(e) =>
            setForm({
              ...form,
              first_name: e.target.value
            })
          }
        />

        <input
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) =>
            setForm({
              ...form,
              last_name: e.target.value
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
        />

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value
            })
          }
        />

        <input
          placeholder="Rank"
          value={form.rank}
          onChange={(e) =>
            setForm({
              ...form,
              rank: e.target.value
            })
          }
        />

        <select
          value={form.assigned_installation_id}
          onChange={(e) =>
            setForm({
              ...form,
              assigned_installation_id: e.target.value
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

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        <small
          className={
            passwordIsValid
              ? 'success-text'
              : 'helper-text'
          }
        >
          Password must be at least 8 characters.
          Current: {passwordLength}
        </small>

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default Register;