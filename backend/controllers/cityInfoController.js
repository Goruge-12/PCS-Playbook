const pool = require('../config/db');

exports.getCityInfo = async (req, res) => {
  try {
    const { installationId } = req.params;

    const [cityRows] = await pool.query(
      `SELECT *
       FROM city_info
       WHERE installation_id = ?`,
      [installationId]
    );

    const [attractionRows] = await pool.query(
      `SELECT *
       FROM city_attractions
       WHERE installation_id = ?
       ORDER BY display_order ASC, attraction_id ASC`,
      [installationId]
    );

    res.json({
      cityInfo: cityRows[0] || null,
      attractions: attractionRows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load city information.',
      error: error.message
    });
  }
};

exports.saveCityInfo = async (req, res) => {
  try {
    const { installationId } = req.params;

    const {
      city_summary,
      weather,
      transportation,
      local_vibe,
      hidden_gems,
      schools,
      medical_facilities,
      housing
    } = req.body;

    const [existing] = await pool.query(
      `SELECT city_info_id
       FROM city_info
       WHERE installation_id = ?`,
      [installationId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE city_info
         SET city_summary = ?,
             weather = ?,
             transportation = ?,
             local_vibe = ?,
             hidden_gems = ?,
             schools = ?,
             medical_facilities = ?,
             housing = ?
         WHERE installation_id = ?`,
        [
          city_summary,
          weather,
          transportation,
          local_vibe,
          hidden_gems,
          schools,
          medical_facilities,
          housing,
          installationId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO city_info (
          installation_id,
          city_summary,
          weather,
          transportation,
          local_vibe,
          hidden_gems,
          schools,
          medical_facilities,
          housing
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          installationId,
          city_summary,
          weather,
          transportation,
          local_vibe,
          hidden_gems,
          schools,
          medical_facilities,
          housing
        ]
      );
    }

    res.json({
      message: 'City information saved successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save city information.',
      error: error.message
    });
  }
};

exports.addAttraction = async (req, res) => {
  try {
    const { installationId } = req.params;

    const {
      title,
      description,
      image_url,
      website_url,
      display_order
    } = req.body;

    await pool.query(
      `INSERT INTO city_attractions (
        installation_id,
        title,
        description,
        image_url,
        website_url,
        display_order
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        installationId,
        title,
        description,
        image_url,
        website_url,
        display_order || 0
      ]
    );

    res.json({
      message: 'Attraction added successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add attraction.',
      error: error.message
    });
  }
};

exports.deleteAttraction = async (req, res) => {
  try {
    const { attractionId } = req.params;

    await pool.query(
      `DELETE FROM city_attractions
       WHERE attraction_id = ?`,
      [attractionId]
    );

    res.json({
      message: 'Attraction removed successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove attraction.',
      error: error.message
    });
  }
};
exports.updateAttraction = async (req, res) => {
  try {
    const { attractionId } = req.params;
    const { display_order } = req.body;

    await pool.query(
      `UPDATE city_attractions
       SET display_order = ?
       WHERE attraction_id = ?`,
      [display_order, attractionId]
    );

    res.json({
      message: 'Attraction order updated successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update attraction order.',
      error: error.message
    });
  }
};