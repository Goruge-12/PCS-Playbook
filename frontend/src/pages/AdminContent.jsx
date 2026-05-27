import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminContent() {
  const [installations, setInstallations] = useState([]);
  const [units, setUnits] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const installationRes = await api.get('/admin/installations');
      setInstallations(installationRes.data);

      const unitRes = await api.get('/admin/units');
      setUnits(unitRes.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateInstallation(installation) {
    try {
      setSaving(true);
      await api.put(`/admin/installations/${installation.installation_id}`, installation);
      setMessage('Installation updated successfully.');
    } catch {
      setMessage('Failed to update installation.');
    } finally {
      setSaving(false);
    }
  }

  async function updateUnit(unit) {
    try {
      setSaving(true);
      await api.put(`/admin/units/${unit.unit_id}`, unit);
      setMessage('Unit updated successfully.');
    } catch {
      setMessage('Failed to update unit.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file, unitId, fieldName) {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);

      const res = await api.post('/admin/upload', formData);
      const imageUrl = res.data.imageUrl || res.data.image_url;

      setUnits(
        units.map((u) =>
          u.unit_id === unitId
            ? { ...u, [fieldName]: imageUrl }
            : u
        )
      );

      setMessage('Image uploaded successfully. Click Save Unit to store it.');
    } catch {
      setMessage('Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Admin Content Management</h2>

        <button
          onClick={() => window.history.back()}
          style={{ marginTop: '1rem' }}
        >
          Go Back
        </button>

        {message && <p className="success">{message}</p>}
        {uploading && <p className="muted">Uploading image...</p>}
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Select Installation</h3>

        <select
          value={selectedInstallation}
          onChange={(e) => setSelectedInstallation(e.target.value)}
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

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Installations</h3>

        {installations
          .filter((installation) => installation.installation_id == selectedInstallation)
          .map((installation) => (
            <div
              className="card"
              style={{ textAlign: 'center' }}
              key={installation.installation_id}
            >
              <input
                value={installation.installation_name || ''}
                onChange={(e) =>
                  setInstallations(
                    installations.map((i) =>
                      i.installation_id === installation.installation_id
                        ? { ...i, installation_name: e.target.value }
                        : i
                    )
                  )
                }
              />

              <textarea
                value={installation.general_information || ''}
                placeholder="General Information"
                onChange={(e) =>
                  setInstallations(
                    installations.map((i) =>
                      i.installation_id === installation.installation_id
                        ? { ...i, general_information: e.target.value }
                        : i
                    )
                  )
                }
              />

              <button
                disabled={saving}
                onClick={() => updateInstallation(installation)}
              >
                {saving ? 'Saving...' : 'Save Installation'}
              </button>
            </div>
          ))}
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

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Units</h3>

        {units
          .filter((unit) => unit.unit_id == selectedUnit)
          .map((unit) => (
            <div
              className="card"
              style={{ textAlign: 'center' }}
              key={unit.unit_id}
            >
              <input
                value={unit.unit_name || ''}
                placeholder="Unit Name"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, unit_name: e.target.value }
                        : u
                    )
                  )
                }
              />

              <textarea
                value={unit.unit_description || ''}
                placeholder="Brief Description"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, unit_description: e.target.value }
                        : u
                    )
                  )
                }
              />

              <input
                value={unit.odo_phone || ''}
                placeholder="ODO Phone"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, odo_phone: e.target.value }
                        : u
                    )
                  )
                }
              />

              <textarea
                value={unit.unit_history || ''}
                placeholder="Unit History"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, unit_history: e.target.value }
                        : u
                    )
                  )
                }
              />

              <textarea
                value={unit.command_info || ''}
                placeholder="Command Information"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, command_info: e.target.value }
                        : u
                    )
                  )
                }
              />

              <input
                value={unit.unit_logo_url || ''}
                placeholder="Unit Logo URL"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, unit_logo_url: e.target.value }
                        : u
                    )
                  )
                }
              />

              <label>Upload Unit Logo</label>
              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  uploadImage(e.target.files[0], unit.unit_id, 'unit_logo_url')
                }
              />

              {unit.unit_logo_url && (
                <img
                  src={unit.unit_logo_url}
                  alt="Unit logo preview"
                  className="admin-preview-img"
                />
              )}

              <input
                value={unit.commanding_officer || ''}
                placeholder="Commanding Officer"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, commanding_officer: e.target.value }
                        : u
                    )
                  )
                }
              />

              <input
                value={unit.commanding_officer_image_url || ''}
                placeholder="CO Image URL"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, commanding_officer_image_url: e.target.value }
                        : u
                    )
                  )
                }
              />

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

              {unit.commanding_officer_image_url && (
                <img
                  src={unit.commanding_officer_image_url}
                  alt="CO preview"
                  className="admin-preview-img"
                />
              )}

              <input
                value={unit.executive_officer || ''}
                placeholder="Executive Officer"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, executive_officer: e.target.value }
                        : u
                    )
                  )
                }
              />

              <input
                value={unit.executive_officer_image_url || ''}
                placeholder="XO Image URL"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, executive_officer_image_url: e.target.value }
                        : u
                    )
                  )
                }
              />

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

              {unit.executive_officer_image_url && (
                <img
                  src={unit.executive_officer_image_url}
                  alt="XO preview"
                  className="admin-preview-img"
                />
              )}

              <input
                value={unit.senior_enlisted_advisor || ''}
                placeholder="Senior Enlisted Advisor"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? { ...u, senior_enlisted_advisor: e.target.value }
                        : u
                    )
                  )
                }
              />

              <input
                value={unit.senior_enlisted_advisor_image_url || ''}
                placeholder="SEA Image URL"
                onChange={(e) =>
                  setUnits(
                    units.map((u) =>
                      u.unit_id === unit.unit_id
                        ? {
                            ...u,
                            senior_enlisted_advisor_image_url: e.target.value
                          }
                        : u
                    )
                  )
                }
              />

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

              {unit.senior_enlisted_advisor_image_url && (
                <img
                  src={unit.senior_enlisted_advisor_image_url}
                  alt="SEA preview"
                  className="admin-preview-img"
                />
              )}

              <button
                disabled={saving || uploading}
                onClick={() => updateUnit(unit)}
              >
                {saving ? 'Saving...' : 'Save Unit'}
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}

export default AdminContent;