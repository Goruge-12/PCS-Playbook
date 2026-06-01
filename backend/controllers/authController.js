const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendTemporaryPassword } = require('../utils/emailService');

function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex');
}

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      rank,
      assigned_installation_id
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !phone ||
      !rank ||
      !assigned_installation_id
    ) {
      return res.status(400).json({
        message: 'Please fill in all required fields.'
      });
    }

    const [existing] = await pool.query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
      (first_name, last_name, email, password, phone, rank, assigned_installation_id, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        phone,
        rank,
        assigned_installation_id,
        'mentee'
      ]
    );

    res.status(201).json({
      message: 'Mentee account created successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        rank: user.rank,
        assigned_installation_id: user.assigned_installation_id,
        role: user.role,
        profile_image_url: user.profile_image_url,
        must_change_password: user.must_change_password
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Please enter your email address.'
      });
    }

    const [users] = await pool.query(
      'SELECT user_id, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'No account found with that email.'
      });
    }

    const tempPassword = generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = ?,
           must_change_password = 1
       WHERE email = ?`,
      [hashedTempPassword, email]
    );

    await sendTemporaryPassword(email, tempPassword);

    res.json({
      message: 'A temporary password has been sent to your email.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to send temporary password.',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = ?,
           must_change_password = 0
       WHERE user_id = ?`,
      [hashedPassword, req.user.user_id]
    );

    res.json({
      message: 'Password changed successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to change password.',
      error: error.message
    });
  }
};