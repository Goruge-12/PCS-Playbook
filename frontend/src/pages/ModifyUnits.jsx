import React from 'react';
import { useEffect, useState } from 'react';
import api from '../services/api';

function ModifyUnits() {
  const [units, setUnits] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');

  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  async function loadUnits() {
    try {
      const unitRes = await api.get('/admin/units');
      setUnits(unitRes.data);

      const installationRes = await api.get('/installations');
      setInstallations(installationRes.data);
    } catch {
      openPopup('Action Failed', 'Failed to load units.');
    }
  }

  function updateLocalUnit(id, field, value) {
    setUnits(
      units.map((unit) =>
        Number(unit.unit_id) === Number(id)
          ? { ...unit, [field]: value }
          : unit
      )
    );
  }

  async function uploadImage(file, unitId, fieldName) {
    if (!file) return;

    const currentUnit = units.find(
      (unit) => Number(unit.unit_id) === Number(unitId)
    );

    const oldImageUrl = currentUnit?.[fieldName] || '';

    const formData = new FormData();
    formData.append('image', file);
    formData.append('oldImageUrl', oldImageUrl);

    if (fieldName === 'unit_logo_url') {
      formData.append('folder', 'Units');
    } else {
      formData.append('folder', 'Command-Photos');
    }

    try {
      setUploading(true);

      openPopup('Uploading Image', 'Uploading image...');

      const res = await api.post('/admin/upload', formData);

      const imageUrl =
        res.data.imageUrl ||
        res.data.image_url ||
        res.data.url ||
        '';

      if (!imageUrl) {
        openPopup(
          'Action Failed',
          'Upload worked, but no image URL was returned.'
        );
        return;
      }

      updateLocalUnit(unitId, fieldName, imageUrl);

      openPopup(
        'Upload Complete',
        'Image uploaded successfully. The URL was added to the field.'
      );
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function updateUnit(unit) {
    try {
      setSaving(true);

      openPopup('Saving Unit', 'Saving unit...');

      await api.put(`/admin/units/${unit.unit_id}`, unit);

      openPopup('Save Complete', 'Unit updated successfully.');

      loadUnits();
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Failed to update unit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      {showPopup && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: '#111',
                fontSize: '1.25rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              ×
            </button>

            <h3>{popupTitle}</h3>
            <p>{message}</p>

            <button onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          gap: '1rem'
        }}
      >
        <button onClick={() => window.history.back()}>
          Go Back
        </button>

        <h2 style={{ flex: 1, textAlign: 'center', margin: 0 }}>
          Modify Units
        </h2>

        <div style={{ width: '110px' }} />
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Select Unit</h3>

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          <option value="">Select Unit</option>

          {units.map((unit) => (
            <option key={unit.unit_id} value={unit.unit_id}>
              {unit.unit_name}
            </option>
          ))}
        </select>
      </div>

      {units
        .filter((unit) => Number(unit.unit_id) === Number(selectedUnit))
        .map((unit) => (
          <div className="card form-card wide" key={unit.unit_id}>
            <h3 style={{ textAlign: 'center' }}>Edit Unit</h3>

            <div className="input-group">
              <label className="centered-label">
                Assigned Installation
              </label>

              <select
                value={unit.installation_id || ''}
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'installation_id',
                    e.target.value
                  )
                }
              >
                <option value="">Select Installation</option>

                {installations.map((installation) => (
                  <option
                    key={installation.installation_id}
                    value={installation.installation_id}
                  >
                    {installation.installation_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="centered-label">Unit Name</label>
              <input
                value={unit.unit_name || ''}
                placeholder="Unit Name"
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'unit_name',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">Unit Description</label>
              <textarea
                value={unit.unit_description || ''}
                placeholder="Unit Description"
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'unit_description',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">ODO Phone Number</label>
              <input
                value={unit.odo_phone || ''}
                placeholder="ODO Phone Number"
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'odo_phone',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">Unit History</label>
              <textarea
                value={unit.unit_history || ''}
                placeholder="Unit History"
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'unit_history',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">Command Information</label>
              <textarea
                value={unit.command_info || ''}
                placeholder="Command Information"
                onChange={(e) =>
                  updateLocalUnit(
                    unit.unit_id,
                    'command_info',
                    e.target.value
                  )
                }
              />
            </div>

            <h4 className="section-title">Unit Logo</h4>

            <div className="unit-logo-row">
              <div className="input-group">
                <label>Unit Logo URL</label>
                <input
                  value={unit.unit_logo_url || ''}
                  placeholder="Unit Logo URL"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'unit_logo_url',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Upload Unit Logo</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      unit.unit_id,
                      'unit_logo_url'
                    )
                  }
                />
              </div>

              <div className="unit-logo-preview-box">
                {unit.unit_logo_url ? (
                  <img
                    src={unit.unit_logo_url}
                    alt="Unit logo preview"
                    className="unit-logo-preview-img"
                  />
                ) : (
                  <span className="preview-placeholder">No Logo</span>
                )}
              </div>
            </div>

            <h4 className="section-title">Command Staff</h4>

            <div className="staff-row">
              <div className="input-group">
                <label>Commanding Officer</label>
                <input
                  value={unit.commanding_officer || ''}
                  placeholder="Commanding Officer"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'commanding_officer',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>CO Image URL</label>
                <input
                  value={unit.commanding_officer_image_url || ''}
                  placeholder="CO Image URL"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'commanding_officer_image_url',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Upload CO Photo</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      unit.unit_id,
                      'commanding_officer_image_url'
                    )
                  }
                />
              </div>

              <div className="staff-preview-box">
                {unit.commanding_officer_image_url ? (
                  <img
                    src={unit.commanding_officer_image_url}
                    alt="CO preview"
                    className="staff-preview-img"
                  />
                ) : (
                  <span className="preview-placeholder">No Photo</span>
                )}
              </div>
            </div>

            <div className="staff-row">
              <div className="input-group">
                <label>Executive Officer</label>
                <input
                  value={unit.executive_officer || ''}
                  placeholder="Executive Officer"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'executive_officer',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>XO Image URL</label>
                <input
                  value={unit.executive_officer_image_url || ''}
                  placeholder="XO Image URL"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'executive_officer_image_url',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Upload XO Photo</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      unit.unit_id,
                      'executive_officer_image_url'
                    )
                  }
                />
              </div>

              <div className="staff-preview-box">
                {unit.executive_officer_image_url ? (
                  <img
                    src={unit.executive_officer_image_url}
                    alt="XO preview"
                    className="staff-preview-img"
                  />
                ) : (
                  <span className="preview-placeholder">No Photo</span>
                )}
              </div>
            </div>

            <div className="staff-row">
              <div className="input-group">
                <label>Senior Enlisted Advisor</label>
                <input
                  value={unit.senior_enlisted_advisor || ''}
                  placeholder="Senior Enlisted Advisor"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'senior_enlisted_advisor',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>SEA Image URL</label>
                <input
                  value={unit.senior_enlisted_advisor_image_url || ''}
                  placeholder="SEA Image URL"
                  onChange={(e) =>
                    updateLocalUnit(
                      unit.unit_id,
                      'senior_enlisted_advisor_image_url',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Upload SEA Photo</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      unit.unit_id,
                      'senior_enlisted_advisor_image_url'
                    )
                  }
                />
              </div>

              <div className="staff-preview-box">
                {unit.senior_enlisted_advisor_image_url ? (
                  <img
                    src={unit.senior_enlisted_advisor_image_url}
                    alt="SEA preview"
                    className="staff-preview-img"
                  />
                ) : (
                  <span className="preview-placeholder">No Photo</span>
                )}
              </div>
            </div>

            <button
              disabled={saving || uploading}
              onClick={() => updateUnit(unit)}
            >
              {saving ? 'Saving...' : 'Save Unit'}
            </button>
          </div>
        ))}
    </section>
  );
}

export default ModifyUnits;