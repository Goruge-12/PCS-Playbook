import React from 'react';
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

  const emailValid =
    form.email === '' ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const phoneValid =
    form.phone === '' ||
    /^[0-9()\-.\s]+$/.test(form.phone);

  const passwordLength = form.password.length;
  const passwordIsValid = passwordLength >= 8;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!emailValid) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (!phoneValid) {
      setMessage('Please enter a valid phone number.');
      return;
    }

    if (!passwordIsValid) {
      setMessage('Password must be at least 8 characters.');
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
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}
      >
        Create Account
      </h2>

      {message && (
        <p className="error">
          {message}
        </p>
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
          style={{
            border:
              !emailValid && form.email
                ? '2px solid #c63b4a'
                : ''
          }}
        />

        {!emailValid && form.email && (
          <>
            <p
              style={{
                color: '#c63b4a',
                marginTop: '-10px',
                marginBottom: '10px'
              }}
            >
              Must be a valid email address.
            </p>

            <p
              className="muted"
              style={{
                marginTop: '-5px',
                marginBottom: '15px'
              }}
            >
              Example: marine@usmc.mil
            </p>
          </>
        )}

        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value
            })
          }
          style={{
            border:
              !phoneValid && form.phone
                ? '2px solid #c63b4a'
                : ''
          }}
        />

        {!phoneValid && form.phone && (
          <p
            style={{
              color: '#c63b4a',
              marginTop: '-10px',
              marginBottom: '10px'
            }}
          >
            Enter a valid phone number.
          </p>
        )}

        <select
          value={form.rank}
          onChange={(e) =>
            setForm({
              ...form,
              rank: e.target.value
            })
          }
        >
          <option value="">
            Select Rank
          </option>

          <option value="PVT">
            E-1 Private (PVT)
          </option>

          <option value="PFC">
            E-2 Private First Class (PFC)
          </option>

          <option value="LCpl">
            E-3 Lance Corporal (LCpl)
          </option>

          <option value="Cpl">
            E-4 Corporal (Cpl)
          </option>

          <option value="Sgt">
            E-5 Sergeant (Sgt)
          </option>

          <option value="SSgt">
            E-6 Staff Sergeant (SSgt)
          </option>

          <option value="GySgt">
            E-7 Gunnery Sergeant (GySgt)
          </option>

          <option value="MSgt/1stSgt">
            E-8 Master Sergeant / First Sergeant
          </option>

          <option value="MGySgt/SgtMaj">
            E-9 Master Gunnery Sergeant / Sergeant Major
          </option>
        </select>

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
          style={{
            border:
              !passwordIsValid && form.password
                ? '2px solid #c63b4a'
                : ''
          }}
        />

        <small
          style={{
            color: passwordIsValid
              ? '#2f9e44'
              : '#c63b4a',
            display: 'block',
            marginTop: '-10px',
            marginBottom: '15px'
          }}
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