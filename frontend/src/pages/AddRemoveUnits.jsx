import React from 'react';
import { useEffect, useState } from 'react';
import api from '../services/api';

function AddRemoveUnits() {
  const [installations, setInstallations] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');

  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    installation_id: '',
    unit_name: '',
    unit_type: '',
    unit_description: '',
    contact_info: '',
    odo_phone: '',
    aircraft_tms: '',
    unit_logo_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  async function loadData() {
    try {
      const installationRes = await api.get('/installations');
      setInstallations(installationRes.data);

      const unitRes = await api.get('/admin/units');
      setUnits(unitRes.data);
    } catch {
      openPopup('Action Failed', 'Failed to load data.');
    }
  }

  async function uploadImage(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'Units');

    try {
      setUploading(true);
      openPopup('Uploading Image', 'Uploading unit logo...');

      const res = await api.post('/admin/upload', formData);

      const imageUrl =
        res.data.imageUrl ||
        res.data.image_url ||
        res.data.url ||
        '';

      if (!imageUrl.startsWith('http')) {
        openPopup(
          'Action Failed',
          'Image uploaded, but no valid image URL was returned.'
        );
        return;
      }

      setForm((prev) => ({
        ...prev,
        unit_logo_url: imageUrl
      }));

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

  async function addUnit(e) {
    e.preventDefault();

    if (
      !form.installation_id ||
      !form.unit_name.trim() ||
      !form.unit_type.trim() ||
      !form.unit_description.trim() ||
      !form.contact_info.trim() ||
      !form.odo_phone.trim() ||
      !form.aircraft_tms.trim()
    ) {
      openPopup(
        'Missing Information',
        'Please fill out all required fields before adding a unit.'
      );
      return;
    }

    try {
      const res = await api.post('/units', form);

      openPopup('Success', res.data.message || 'Unit added successfully.');

      setForm({
        installation_id: '',
        unit_name: '',
        unit_type: '',
        unit_description: '',
        contact_info: '',
        odo_phone: '',
        aircraft_tms: '',
        unit_logo_url: ''
      });

      loadData();
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Failed to add unit.');
    }
  }

  async function removeUnit() {
    if (!selectedUnit) {
      openPopup('Missing Information', 'Please select a unit to remove.');
      return;
    }

    try {
      const res = await api.delete(`/units/${selectedUnit}`);

      openPopup('Success', res.data.message || 'Unit removed successfully.');

      setSelectedUnit('');
      loadData();
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Failed to remove unit.');
    }
  }

  return (
    <section>
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              position: 'relative',
              background: 'white',
              width: 'min(500px, 90%)',
              padding: '2rem',
              borderRadius: '18px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#111',
                fontSize: '1.5rem',
                cursor: 'pointer'
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
          Add / Remove Units
        </h2>

        <div style={{ width: '110px' }} />
      </div>

      <div className="card form-card wide" style={{ textAlign: 'center' }}>
        <h3>Add Unit</h3>

        <form onSubmit={addUnit}>
          <select
            value={form.installation_id}
            onChange={(e) =>
              setForm({
                ...form,
                installation_id: e.target.value
              })
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

          <input
            placeholder="Unit Name"
            value={form.unit_name}
            onChange={(e) =>
              setForm({
                ...form,
                unit_name: e.target.value
              })
            }
          />

          <input
            placeholder="Unit Type"
            value={form.unit_type}
            onChange={(e) =>
              setForm({
                ...form,
                unit_type: e.target.value
              })
            }
          />

          <textarea
            placeholder="Unit Description"
            value={form.unit_description}
            onChange={(e) =>
              setForm({
                ...form,
                unit_description: e.target.value
              })
            }
          />

          <input
            placeholder="Contact Info"
            value={form.contact_info}
            onChange={(e) =>
              setForm({
                ...form,
                contact_info: e.target.value
              })
            }
          />

          <input
            placeholder="ODO Phone"
            value={form.odo_phone}
            onChange={(e) =>
              setForm({
                ...form,
                odo_phone: e.target.value
              })
            }
          />

          <input
            placeholder="Aircraft TMS"
            value={form.aircraft_tms}
            onChange={(e) =>
              setForm({
                ...form,
                aircraft_tms: e.target.value
              })
            }
          />

          <h4 className="section-title">Unit Logo</h4>

          <div className="unit-logo-row">
            <div className="input-group">
              <label>Unit Logo URL</label>
              <input
                value={form.unit_logo_url}
                placeholder="Unit Logo URL"
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit_logo_url: e.target.value
                  })
                }
              />
            </div>

            <div className="input-group">
              <label>Upload Unit Logo</label>
              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files[0])}
              />
            </div>

            <div className="unit-logo-preview-box">
              {form.unit_logo_url &&
              form.unit_logo_url.trim() !== '' &&
              form.unit_logo_url.startsWith('http') ? (
                <img
                  src={form.unit_logo_url}
                  alt="Unit logo preview"
                  className="unit-logo-preview-img"
                />
              ) : (
                <span className="preview-placeholder">No Logo</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{ marginTop: '1rem' }}
          >
            {uploading ? 'Uploading...' : 'Add Unit'}
          </button>
        </form>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Remove Unit</h3>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}
        >
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="">Select Unit</option>

            {units.map((unit) => (
              <option key={unit.unit_id} value={unit.unit_id}>
                {unit.unit_name} - {unit.installation_name}
              </option>
            ))}
          </select>

          <button className="danger" onClick={removeUnit}>
            Remove Unit
          </button>
        </div>
      </div>
    </section>
  );
}

export default AddRemoveUnits;