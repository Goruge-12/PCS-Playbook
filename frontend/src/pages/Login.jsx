import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [sendingTempPassword, setSendingTempPassword] = useState(false);

  const navigate = useNavigate();

  const emailValid =
    form.email === '' ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const forgotEmailValid =
    forgotEmail === '' ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);

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
      window.dispatchEvent(new Event('profileUpdated'));
      if (Number(res.data.user.must_change_password) === 1) {
  navigate('/change-password');
} else if (res.data.user.role === 'admin') {
  navigate('/admin');
} else if (res.data.user.role === 'mentor') {
  navigate('/mentor-dashboard');
} else if (res.data.user.role === 'mentee') {
  navigate('/mentee-dashboard');
} else {
  navigate('/');
}
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Login failed.'
      );
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    if (!forgotEmail || !forgotEmailValid) {
      setPopupMessage('Please enter a valid email address.');
      return;
    }

    try {
      setSendingTempPassword(true);
      setPopupMessage('Sending temporary password...');

      const res = await api.post('/auth/forgot-password', {
        email: forgotEmail
      });

      setPopupMessage(
        res.data.message ||
          'A temporary password has been sent to your email.'
      );
    } catch (error) {
      setPopupMessage(
        error.response?.data?.message ||
          'Failed to send temporary password.'
      );
    } finally {
      setSendingTempPassword(false);
    }
  }

  function closeForgotPopup() {
    setShowForgotPopup(false);
    setForgotEmail('');
    setPopupMessage('');
  }

  return (
    <>
      {showForgotPopup && (
        <div className="modal-backdrop">
          <div
            className="modal-card"
            style={{
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={closeForgotPopup}
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

            <h3>Reset Password</h3>

            <p className="muted">
              Enter your account email. PCS Playbook will send you a temporary password.
            </p>

            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) =>
                  setForgotEmail(e.target.value)
                }
                style={{
                  border:
                    !forgotEmailValid && forgotEmail
                      ? '2px solid #c63b4a'
                      : ''
                }}
              />

              {!forgotEmailValid && forgotEmail && (
                <p
                  style={{
                    color: '#c63b4a',
                    marginTop: '-5px',
                    fontSize: '0.9rem'
                  }}
                >
                  Please enter a valid email address.
                </p>
              )}

              {popupMessage && (
                <p
                  className={
                    popupMessage.includes('Failed') ||
                    popupMessage.includes('valid') ||
                    popupMessage.includes('No account')
                      ? 'error'
                      : 'success'
                  }
                >
                  {popupMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={sendingTempPassword}
              >
                {sendingTempPassword
                  ? 'Sending...'
                  : 'Send Temporary Password'}
              </button>

              <button
                type="button"
                className="ghost"
                onClick={closeForgotPopup}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

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

          <button
            type="button"
            onClick={() => setShowForgotPopup(true)}
            style={{
              background: 'transparent',
              color: '#0b3d91',
              padding: 0,
              textAlign: 'right',
              fontWeight: '600',
              alignSelf: 'flex-end'
            }}
          >
            Forgot Password?
          </button>

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;