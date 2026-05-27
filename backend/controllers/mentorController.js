const pool = require('../config/db');

exports.getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.first_name, u.last_name, u.email, i.installation_name
      FROM mentors m
      JOIN users u ON m.user_id = u.user_id
      JOIN installations i ON m.installation_id = i.installation_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.createMentor = async (req, res) => {
  try {
    const { user_id, installation_id, availability_status, bio } = req.body;
    const [result] = await pool.query(
      'INSERT INTO mentors (user_id, installation_id, availability_status, bio) VALUES (?, ?, ?, ?)',
      [user_id, installation_id, availability_status || 'available', bio]
    );
    res.status(201).json({ message: 'Mentor profile created.', mentor_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { mentor_id, installation_id, request_message } = req.body;
    await pool.query(
      'INSERT INTO mentorship_requests (marine_user_id, mentor_id, installation_id, request_message) VALUES (?, ?, ?, ?)',
      [req.user.user_id, mentor_id, installation_id, request_message]
    );
    res.status(201).json({ message: 'Mentorship request submitted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.first_name AS marine_first_name, u.last_name AS marine_last_name, i.installation_name
      FROM mentorship_requests r
      JOIN users u ON r.marine_user_id = u.user_id
      JOIN installations i ON r.installation_id = i.installation_id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE mentorship_requests SET status = ? WHERE request_id = ?', [status, req.params.id]);
    res.json({ message: 'Request status updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
