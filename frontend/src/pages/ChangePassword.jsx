import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const passwordLength = newPassword.length;

  let strength = '';
  let strengthColor = '';

  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const score = [
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  if (passwordLength > 0) {
    if (passwordLength < 8 || score <= 1) {
      strength = 'Weak';
      strengthColor = '#c63b4a';
    } else if (score <= 3) {
      strength = 'Medium';
      strengthColor = '#d97706';
    } else {
      strength = 'Strong';
      strengthColor = '#16a34a';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const passwordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
        newPassword
      );

    if (!passwordValid) {
      setMessage(
        'Password must meet all requirements.'
      );
      return;
    }

    try {
      await api.put('/auth/change-password', {
        newPassword
      });

      const user = JSON.parse(
        localStorage.getItem('user') || '{}'
      );

      user.must_change_password = 0;

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

      navigate('/installations');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Failed to change password.'
      );
    }
  }

  return (
    <div className="card form-card">
      <h2
        style={{
          textAlign: 'center'
        }}
      >
        Change Password
      </h2>

      <p
        className="muted"
        style={{
          textAlign: 'center'
        }}
      >
        Please create a new password before continuing.
      </p>

      {message && (
        <p className="error">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />

        <div
          style={{
            marginTop: '-5px',
            marginBottom: '15px'
          }}
        >
          <p
            style={{
              fontWeight: '600',
              marginBottom: '8px'
            }}
          >
            Password Requirements:
          </p>

          <ul
            style={{
              marginTop: 0,
              paddingLeft: '20px',
              fontSize: '.95rem'
            }}
          >
            <li
              style={{
                color:
                  passwordLength >= 8
                    ? '#16a34a'
                    : '#6b7280'
              }}
            >
              Minimum 8 characters
            </li>

            <li
              style={{
                color:
                  hasUpper
                    ? '#16a34a'
                    : '#6b7280'
              }}
            >
              At least 1 uppercase letter
            </li>

            <li
              style={{
                color:
                  hasLower
                    ? '#16a34a'
                    : '#6b7280'
              }}
            >
              At least 1 lowercase letter
            </li>

            <li
              style={{
                color:
                  hasNumber
                    ? '#16a34a'
                    : '#6b7280'
              }}
            >
              At least 1 number
            </li>

            <li
              style={{
                color:
                  hasSpecial
                    ? '#16a34a'
                    : '#6b7280'
              }}
            >
              At least 1 special character
            </li>
          </ul>
        </div>

        {newPassword && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '15px'
            }}
          >
            <strong>
              Password Strength:{' '}
            </strong>

            <span
              style={{
                color: strengthColor,
                fontWeight: '700'
              }}
            >
              {strength}
            </span>
          </div>
        )}

        <button type="submit">
          Save New Password
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;