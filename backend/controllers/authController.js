const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

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
        profile_image_url: user.profile_image_url
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};