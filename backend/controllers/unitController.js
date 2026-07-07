const pool = require('../config/db');

exports.getUnitsByInstallation = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM installation_units WHERE installation_id = ? ORDER BY unit_name',
      [req.params.installationId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.searchUnits = async (req, res) => {
  try {
    const { search } = req.query;

    const [rows] = await pool.query(
      `SELECT u.*, i.installation_name
       FROM installation_units u
       JOIN installations i ON u.installation_id = i.installation_id
       WHERE u.unit_name LIKE ? OR i.installation_name LIKE ?
       ORDER BY u.unit_name`,
      [`%${search || ''}%`, `%${search || ''}%`]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, i.installation_name, i.address, i.state
       FROM installation_units u
       JOIN installations i ON u.installation_id = i.installation_id
       WHERE u.unit_id = ?`,
      [req.params.unitId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Unit not found.'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const {
      installation_id,
      unit_name,
      unit_type,
      unit_description,
      contact_info,
      odo_phone,
      aircraft_tms,
      unit_logo_url
    } = req.body;

    await pool.query(
      `INSERT INTO installation_units (
        installation_id,
        unit_name,
        unit_type,
        unit_description,
        contact_info,
        odo_phone,
        aircraft_tms,
        unit_logo_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        installation_id,
        unit_name,
        unit_type,
        unit_description,
        contact_info,
        odo_phone,
        aircraft_tms,
        unit_logo_url
      ]
    );

    res.status(201).json({
      message: 'Unit added successfully.'
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Failed to create unit.',
      error: error.message
    });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    const [result] = await pool.query(
      `DELETE FROM installation_units
       WHERE unit_id = ?`,
      [unitId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Unit not found.' });
    }

    res.json({
      message: 'Unit removed successfully.'
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: 'Failed to remove unit.',
      error: error.message
    });
  }
};