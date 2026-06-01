const pool = require('../config/db');

exports.getResources = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM resources
       WHERE is_active = 1
       ORDER BY category ASC, display_order ASC, title ASC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load resources.',
      error: error.message
    });
  }
};

exports.getAllResourcesAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM resources
       ORDER BY category ASC, display_order ASC, title ASC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin resources.',
      error: error.message
    });
  }
};

exports.createResource = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      website_url,
      display_order,
      is_active
    } = req.body;

    await pool.query(
      `INSERT INTO resources
      (category, title, description, website_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category,
        title,
        description,
        website_url,
        display_order || 0,
        is_active ?? 1
      ]
    );

    res.json({
      message: 'Resource added successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add resource.',
      error: error.message
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const {
      category,
      title,
      description,
      website_url,
      display_order,
      is_active
    } = req.body;

    await pool.query(
      `UPDATE resources
       SET category = ?,
           title = ?,
           description = ?,
           website_url = ?,
           display_order = ?,
           is_active = ?
       WHERE resource_id = ?`,
      [
        category,
        title,
        description,
        website_url,
        display_order || 0,
        is_active ?? 1,
        resourceId
      ]
    );

    res.json({
      message: 'Resource updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update resource.',
      error: error.message
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    await pool.query(
      `DELETE FROM resources
       WHERE resource_id = ?`,
      [resourceId]
    );

    res.json({
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete resource.',
      error: error.message
    });
  }
};