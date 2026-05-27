const pool = require('../config/db');
const { uploadToS3 } = require('../config/s3');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, first_name, last_name, email, role, profile_image_url FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });

    const imageUrl = await uploadToS3(req.file, 'profile-images');
    await pool.query('UPDATE users SET profile_image_url = ? WHERE user_id = ?', [imageUrl, req.user.user_id]);

    res.json({ message: 'Profile image updated.', profile_image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
