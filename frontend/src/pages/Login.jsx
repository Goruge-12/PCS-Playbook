import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const emailValid =
    form.email === '' ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!emailValid) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const res = await api.post('/auth/login', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify(res.data.user)
      );

      navigate('/installations');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Login failed.'
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
        Login
      </h2>

      {message && (
        <p className="error">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
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
                marginBottom: '10px',
                fontSize: '0.95rem'
              }}
            >
              Must be a valid email address.
            </p>

            <p
              className="muted"
              style={{
                fontSize: '0.9rem',
                marginTop: '-5px',
                marginBottom: '15px'
              }}
            >
              Please enter an email in the format:
              example@domain.com
            </p>
          </>
        )}

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

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;