import { useEffect, useState } from 'react';
import api from '../services/api';

function ModifyInstallations() {
  const [installations, setInstallations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');

  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadInstallations();
    loadRegions();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  function makeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function updateLocalInstallation(id, field, value) {
    setInstallations((prevInstallations) =>
      prevInstallations.map((installation) =>
        Number(installation.installation_id) === Number(id)
          ? {
              ...installation,
              [field]: value,
              ...(field === 'installation_name'
                ? { slug: makeSlug(value) }
                : {})
            }
          : installation
      )
    );
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/admin/installations');
      setInstallations(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load installations.');
    }
  }

  async function loadRegions() {
    try {
      const res = await api.get('/installations/regions');
      setRegions(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load regions.');
    }
  }

  function validateInstallation(installation) {
    if (
      !installation.installation_name?.trim() ||
      !installation.region_name?.trim() ||
      !installation.state?.trim() ||
      !installation.zip_code?.trim() ||
      !installation.address?.trim() ||
      !installation.base_entry_requirements?.trim() ||
      !installation.general_information?.trim() ||
      !installation.unit_contact_info?.trim()
    ) {
      openPopup(
        'Missing Information',
        'Please fill out all required information before saving the installation.'
      );
      return false;
    }

    return true;
  }

  async function saveInstallation(installation, successMessage) {
    const payload = {
      installation_name: installation.installation_name || '',
      slug: installation.slug || makeSlug(installation.installation_name || ''),
      region_name: installation.region_name || '',
      state: installation.state || '',
      zip_code: installation.zip_code || '',
      address: installation.address || '',
      latitude: installation.latitude || 0,
      longitude: installation.longitude || 0,
      map_top: installation.map_top || '50%',
      map_left: installation.map_left || '50%',
      image_url: installation.image_url || '',
      gate_image_url: installation.gate_image_url || '',
      base_map_url: installation.base_map_url || '',
      base_entry_requirements: installation.base_entry_requirements || '',
      general_information: installation.general_information || '',
      unit_contact_info: installation.unit_contact_info || ''
    };

    await api.put(
      `/admin/installations/${installation.installation_id}`,
      payload
    );

    openPopup('Success', successMessage);

    await loadInstallations();
    setSelectedInstallation(String(installation.installation_id));
  }

  async function uploadImage(file, installationId, fieldName) {
    if (!file) return;

    const currentInstallation = installations.find(
      (installation) =>
        Number(installation.installation_id) === Number(installationId)
    );

    if (!currentInstallation) {
      openPopup('Action Failed', 'Installation not found.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    if (fieldName === 'image_url') {
      formData.append('folder', 'Gates');
    } else if (fieldName === 'gate_image_url') {
      formData.append('folder', 'Base-Logos');
    } else if (fieldName === 'base_map_url') {
      formData.append('folder', 'Maps');
    } else {
      formData.append('folder', 'Uploads');
    }

    try {
      setUploading(true);
      openPopup('Uploading', 'Uploading image...');

      const res = await api.post('/admin/upload', formData);

      const imageUrl =
        res.data.imageUrl ||
        res.data.image_url ||
        res.data.url ||
        '';

      if (!imageUrl.startsWith('http')) {
        openPopup(
          'Action Failed',
          'Upload worked, but the backend did not return a valid image URL.'
        );
        return;
      }

      const updatedInstallation = {
        ...currentInstallation,
        [fieldName]: imageUrl
      };

      updateLocalInstallation(installationId, fieldName, imageUrl);

      await saveInstallation(
        updatedInstallation,
        'Image uploaded and saved successfully.'
      );
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function updateInstallation(installation) {
    if (!validateInstallation(installation)) return;

    try {
      setSaving(true);

      await saveInstallation(
        installation,
        'Installation updated successfully.'
      );
    } catch {
      openPopup('Action Failed', 'Failed to update installation.');
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
          Modify Installations
        </h2>

        <div style={{ width: '110px' }} />
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
              {installation.installation_name ||
                `Test Row ${installation.installation_id}`}
            </option>
          ))}
        </select>
      </div>

      {installations
        .filter(
          (installation) =>
            Number(installation.installation_id) ===
            Number(selectedInstallation)
        )
        .map((installation) => (
          <div
            className="card form-card wide"
            key={installation.installation_id}
          >
            <h3 style={{ textAlign: 'center' }}>
              Edit Installation
            </h3>

            <div className="admin-form-grid">
              <div className="input-group">
                <label>Installation Name</label>
                <input
                  value={installation.installation_name || ''}
                  placeholder="Installation Name"
                  onChange={(e) =>
                    updateLocalInstallation(
                      installation.installation_id,
                      'installation_name',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Region Name</label>

                <select
                  value={installation.region_name || ''}
                  onChange={(e) => {
                    const selectedRegion = regions.find(
                      (region) =>
                        region.region_name === e.target.value
                    );

                    updateLocalInstallation(
                      installation.installation_id,
                      'region_name',
                      e.target.value
                    );

                    updateLocalInstallation(
                      installation.installation_id,
                      'map_top',
                      selectedRegion?.map_top || '50%'
                    );

                    updateLocalInstallation(
                      installation.installation_id,
                      'map_left',
                      selectedRegion?.map_left || '50%'
                    );

                    updateLocalInstallation(
                      installation.installation_id,
                      'latitude',
                      selectedRegion?.latitude || 0
                    );

                    updateLocalInstallation(
                      installation.installation_id,
                      'longitude',
                      selectedRegion?.longitude || 0
                    );
                  }}
                >
                  <option value="">Select Region</option>

                  {regions.map((region) => (
                    <option
                      key={region.region_name}
                      value={region.region_name}
                    >
                      {region.region_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>State</label>
                <input
                  value={installation.state || ''}
                  placeholder="State"
                  onChange={(e) =>
                    updateLocalInstallation(
                      installation.installation_id,
                      'state',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>ZIP Code</label>
                <input
                  value={installation.zip_code || ''}
                  placeholder="ZIP Code"
                  onChange={(e) =>
                    updateLocalInstallation(
                      installation.installation_id,
                      'zip_code',
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input
                  value={installation.address || ''}
                  placeholder="Address"
                  onChange={(e) =>
                    updateLocalInstallation(
                      installation.installation_id,
                      'address',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <h4 className="section-title">Gate Image</h4>

            <div className="admin-image-row">
              <div className="input-group">
                <label>Upload Gate Image</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      installation.installation_id,
                      'image_url'
                    )
                  }
                />
              </div>
            </div>

            {installation.image_url && (
              <div className="preview-container">
                <img
                  src={installation.image_url}
                  alt="Gate preview"
                  className="admin-preview-img"
                />
              </div>
            )}

            <h4 className="section-title">
              Base Logo / Details Image
            </h4>

            <div className="admin-image-row">
              <div className="input-group">
                <label>Upload Base Logo</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      installation.installation_id,
                      'gate_image_url'
                    )
                  }
                />
              </div>
            </div>

            {installation.gate_image_url && (
              <div className="preview-container">
                <img
                  src={installation.gate_image_url}
                  alt="Base logo preview"
                  className="admin-preview-img"
                />
              </div>
            )}

            <h4 className="section-title">Base Map</h4>

            <div className="admin-image-row">
              <div className="input-group">
                <label>Upload Base Map</label>
                <input
                  disabled={uploading}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    uploadImage(
                      e.target.files[0],
                      installation.installation_id,
                      'base_map_url'
                    )
                  }
                />
              </div>
            </div>

            {installation.base_map_url && (
              <div className="preview-container">
                <img
                  src={installation.base_map_url}
                  alt="Base map preview"
                  className="admin-preview-img"
                />
              </div>
            )}

            <div className="input-group">
              <label className="centered-label">
                Base Entry Requirements
              </label>
              <textarea
                value={installation.base_entry_requirements || ''}
                placeholder="Base Entry Requirements"
                onChange={(e) =>
                  updateLocalInstallation(
                    installation.installation_id,
                    'base_entry_requirements',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">
                General Information
              </label>
              <textarea
                value={installation.general_information || ''}
                placeholder="General Information"
                onChange={(e) =>
                  updateLocalInstallation(
                    installation.installation_id,
                    'general_information',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="centered-label">
                Major Units
              </label>
              <textarea
                value={installation.unit_contact_info || ''}
                placeholder="Major Units"
                onChange={(e) =>
                  updateLocalInstallation(
                    installation.installation_id,
                    'unit_contact_info',
                    e.target.value
                  )
                }
              />
            </div>

            <button
              disabled={saving || uploading}
              onClick={() => updateInstallation(installation)}
            >
              {saving ? 'Saving...' : 'Save Installation'}
            </button>
          </div>
        ))}
    </section>
  );
}

export default ModifyInstallations;