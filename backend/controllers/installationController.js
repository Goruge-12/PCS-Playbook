const pool = require('../config/db');
const { uploadToS3 } = require('../config/s3');

exports.getInstallations = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM installations';
    let params = [];

    if (search) {
      sql += ' WHERE installation_name LIKE ? OR state LIKE ? OR zip_code LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.getInstallationRegions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        region_name,
        MIN(map_top) AS map_top,
        MIN(map_left) AS map_left
      FROM installations
      WHERE region_name IS NOT NULL
      AND region_name != ''
      GROUP BY region_name
      ORDER BY region_name ASC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load regions.',
      error: error.message
    });
  }
};

exports.getInstallationById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM installations WHERE installation_id = ? OR slug = ?',
      [req.params.id, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Installation not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.createInstallation = async (req, res) => {
  try {
    const data = req.body;
    let imageUrl = data.image_url || '';

    if (req.file) {
      imageUrl = await uploadToS3(req.file, 'installation-images');
    }

    const [result] = await pool.query(
      `INSERT INTO installations
      (installation_name, slug, region_name, state, zip_code, address, latitude, longitude, map_top, map_left, base_entry_requirements, general_information, unit_contact_info, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.installation_name,
        data.slug,
        data.region_name,
        data.state,
        data.zip_code,
        data.address,
        data.latitude,
        data.longitude,
        data.map_top,
        data.map_left,
        data.base_entry_requirements,
        data.general_information,
        data.unit_contact_info,
        imageUrl
      ]
    );

    res.status(201).json({
      message: 'Installation created.',
      installation_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.updateInstallation = async (req, res) => {
  try {
    const data = req.body;
    let imageUrl = data.image_url || '';

    if (req.file) {
      imageUrl = await uploadToS3(req.file, 'installation-images');
    }

    await pool.query(
      `UPDATE installations 
       SET installation_name=?, slug=?, region_name=?, state=?, zip_code=?, address=?, latitude=?, longitude=?, 
       map_top=?, map_left=?, base_entry_requirements=?, general_information=?, unit_contact_info=?, image_url=? 
       WHERE installation_id=?`,
      [
        data.installation_name,
        data.slug,
        data.region_name,
        data.state,
        data.zip_code,
        data.address,
        data.latitude,
        data.longitude,
        data.map_top,
        data.map_left,
        data.base_entry_requirements,
        data.general_information,
        data.unit_contact_info,
        imageUrl,
        req.params.id
      ]
    );

    res.json({ message: 'Installation updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.deleteInstallation = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM installations WHERE installation_id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Installation removed successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};