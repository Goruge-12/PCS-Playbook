const pool = require('../config/db');
const { uploadToS3 } = require('../config/s3');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        user_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        rank,
        assigned_installation_id,
        profile_image_url
      FROM users
      WHERE user_id = ?`,
      [req.user.user_id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      assigned_installation_id,
      password
    } = req.body;

    let sql = `
      UPDATE users
      SET first_name = ?,
          last_name = ?,
          email = ?,
          phone = ?,
          assigned_installation_id = ?
    `;

    const params = [
      first_name,
      last_name,
      email,
      phone,
      assigned_installation_id
    ];

    if (password && password.trim() !== '') {
      const hashedPassword =
        await bcrypt.hash(password, 10);

      sql += `,
          password = ?
      `;

      params.push(hashedPassword);
    }

    sql += `
      WHERE user_id = ?
    `;

    params.push(req.user.user_id);

    await pool.query(sql, params);

    res.json({
      message: 'Profile updated successfully.'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: 'No image uploaded.'
      });
    }

    const imageUrl =
      await uploadToS3(
        req.file,
        'profile-images'
      );

    await pool.query(
      'UPDATE users SET profile_image_url = ? WHERE user_id = ?',
      [
        imageUrl,
        req.user.user_id
      ]
    );

    res.json({
      message:
        'Profile image updated.',
      profile_image_url:
        imageUrl
    });

  } catch (error) {

    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });

  }
};