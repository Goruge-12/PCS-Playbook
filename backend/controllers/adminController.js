const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        user_id,
        first_name,
        last_name,
        email,
        phone,
        rank,
        role,
        assigned_installation_id
       FROM users
       ORDER BY last_name, first_name`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {

    let { role } = req.body;

    if (role === 'marine') {
      role = 'mentee';
    }

    if (!['mentee', 'mentor', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role.'
      });
    }

    const [users] = await pool.query(
      'SELECT role, assigned_installation_id FROM users WHERE user_id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const oldRole = users[0].role;
    const installationId = users[0].assigned_installation_id;

    await pool.query(
      'UPDATE users SET role = ? WHERE user_id = ?',
      [role, req.params.id]
    );

    await pool.query(
      `INSERT INTO user_role_history
       (user_id, old_role, new_role, changed_by)
       VALUES (?, ?, ?, ?)`,
      [
        req.params.id,
        oldRole,
        role,
        req.user.user_id
      ]
    );

    if (role === 'mentor') {

      const [existingMentor] = await pool.query(
        'SELECT * FROM mentor_profiles WHERE user_id = ?',
        [req.params.id]
      );

      if (existingMentor.length === 0) {

        await pool.query(
          `INSERT INTO mentor_profiles
           (user_id, installation_id, is_available)
           VALUES (?, ?, TRUE)`,
          [req.params.id, installationId]
        );

      } else {

        await pool.query(
          `UPDATE mentor_profiles
           SET is_available = TRUE,
               installation_id = ?
           WHERE user_id = ?`,
          [installationId, req.params.id]
        );

      }

    } else {

      await pool.query(
        `UPDATE mentor_profiles
         SET is_available = FALSE
         WHERE user_id = ?`,
        [req.params.id]
      );

    }

    res.json({
      message: 'User role updated successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};
exports.getAllRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        mr.*,
        i.installation_name,
        u.first_name AS mentor_first_name,
        u.last_name AS mentor_last_name
       FROM mentor_requests mr
       JOIN installations i ON mr.installation_id = i.installation_id
       LEFT JOIN users u ON mr.mentor_user_id = u.user_id
       ORDER BY mr.created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
      'UPDATE mentor_requests SET status = ? WHERE request_id = ?',
      [status, req.params.id]
    );

    res.json({
      message: 'Request status updated.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};
exports.assignMentorToRequest = async (req, res) => {
  try {
    const { mentor_user_id } = req.body;

    if (!mentor_user_id) {
      return res.status(400).json({
        message: 'Mentor user ID is required.'
      });
    }

    await pool.query(
      `UPDATE mentor_requests
       SET mentor_user_id = ?,
           status = 'assigned'
       WHERE request_id = ?`,
      [mentor_user_id, req.params.id]
    );

    res.json({
      message: 'Mentor assigned successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};
exports.getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        mp.installation_id,
        i.installation_name
       FROM users u
       JOIN mentor_profiles mp
        ON u.user_id = mp.user_id
       JOIN installations i
        ON mp.installation_id = i.installation_id
       WHERE u.role = 'mentor'
       ORDER BY u.last_name, u.first_name`
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};
exports.updateInstallation = async (req, res) => {
  try {
    const {
      installation_name,
      state,
      zip_code,
      address,
      base_entry_requirements,
      general_information,
      unit_contact_info
    } = req.body;

    await pool.query(
      `UPDATE installations
       SET installation_name = ?,
           state = ?,
           zip_code = ?,
           address = ?,
           base_entry_requirements = ?,
           general_information = ?,
           unit_contact_info = ?
       WHERE installation_id = ?`,
      [
        installation_name,
        state,
        zip_code,
        address,
        base_entry_requirements,
        general_information,
        unit_contact_info,
        req.params.id
      ]
    );

    res.json({
      message: 'Installation updated successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const {
      unit_name,
      unit_type,
      aircraft_tms,
      odo_phone,
      unit_history,
      command_info,
      unit_logo_url,
      unit_description,
      commanding_officer,
      executive_officer,
      senior_enlisted_advisor,
      commanding_officer_image_url,
      executive_officer_image_url,
      senior_enlisted_advisor_image_url
    } = req.body;

    await pool.query(
      `UPDATE installation_units
       SET unit_name = ?,
           unit_type = ?,
           aircraft_tms = ?,
           odo_phone = ?,
           unit_history = ?,
           command_info = ?,
           unit_logo_url = ?,
           unit_description = ?,
           commanding_officer = ?,
           executive_officer = ?,
           senior_enlisted_advisor = ?,
           commanding_officer_image_url = ?,
           executive_officer_image_url = ?,
           senior_enlisted_advisor_image_url = ?
       WHERE unit_id = ?`,
      [
        unit_name,
        unit_type,
        aircraft_tms,
        odo_phone,
        unit_history,
        command_info,
        unit_logo_url,
        unit_description,
        commanding_officer,
        executive_officer,
        senior_enlisted_advisor,
        commanding_officer_image_url,
        executive_officer_image_url,
        senior_enlisted_advisor_image_url,
        req.params.id
      ]
    );

    res.json({
      message: 'Unit updated successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};
exports.getInstallations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM installations ORDER BY installation_name'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM installation_units ORDER BY unit_name'
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};