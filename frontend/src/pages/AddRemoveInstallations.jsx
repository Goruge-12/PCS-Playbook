import React from 'react';
import { useEffect, useState } from 'react';
import api from '../services/api';

function AddRemoveInstallations() {
  const [installations, setInstallations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');

  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    installation_name: '',
    state: '',
    zip_code: '',
    address: '',
    base_entry_requirements: '',
    general_information: '',
    unit_contact_info: '',
    gate_image: null,
    base_logo: null,
    base_map: null
  });

  useEffect(() => {
    loadInstallations();
    loadRegions();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/installations');
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

  function handleImageSelect(file, fieldName, label) {
    if (!file) return;

    openPopup('Uploading Image', `Uploading ${label}...`);

    setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        [fieldName]: file
      }));

      openPopup('Upload Complete', `${label} selected successfully.`);
    }, 800);
  }

  async function uploadImage(file, fieldName) {
    if (!file) return '';

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
      openPopup('Saving Installation', 'Saving image...');

      const res = await api.post('/admin/upload', formData);

      const imageUrl =
        res.data.imageUrl ||
        res.data.image_url ||
        res.data.url ||
        '';

      if (!imageUrl.startsWith('http')) {
        openPopup(
          'Action Failed',
          'Upload worked, but backend returned invalid image URL.'
        );
        return '';
      }

      return imageUrl;
    } catch (error) {
      console.log(error);
      openPopup('Action Failed', 'Image upload failed.');
      return '';
    } finally {
      setUploading(false);
    }
  }

  async function createInstallation(e) {
    e.preventDefault();

    if (
      !form.installation_name.trim() ||
      !form.state.trim() ||
      !form.zip_code.trim() ||
      !form.address.trim() ||
      !form.base_entry_requirements.trim() ||
      !form.general_information.trim() ||
      !form.unit_contact_info.trim()
    ) {
      openPopup(
        'Missing Information',
        'Please fill out all required fields before adding an installation.'
      );
      return;
    }

    const selectedRegion = regions.find(
      (region) => region.region_name === form.state
    );

    const gateImageUrl = form.gate_image
      ? await uploadImage(form.gate_image, 'image_url')
      : '';

    const baseLogoUrl = form.base_logo
      ? await uploadImage(form.base_logo, 'gate_image_url')
      : '';

    const baseMapUrl = form.base_map
      ? await uploadImage(form.base_map, 'base_map_url')
      : '';

    const generatedSlug = generateSlug(form.installation_name);

    const finalForm = {
      installation_name: form.installation_name,
      slug: generatedSlug,
      state: form.state,
      zip_code: form.zip_code,
      address: form.address,
      base_entry_requirements: form.base_entry_requirements,
      general_information: form.general_information,
      unit_contact_info: form.unit_contact_info,
      region_name: form.state,
      latitude: selectedRegion?.latitude || 0,
      longitude: selectedRegion?.longitude || 0,
      map_top: selectedRegion?.map_top || '50%',
      map_left: selectedRegion?.map_left || '50%',
      image_url: gateImageUrl,
      gate_image_url: baseLogoUrl,
      base_map_url: baseMapUrl
    };

    try {
      setUploading(true);
      openPopup('Saving Installation', 'Saving installation...');

      const res = await api.post('/installations', finalForm);

      openPopup(
        'Save Complete',
        res.data.message || 'Installation saved successfully.'
      );

      setForm({
        installation_name: '',
        state: '',
        zip_code: '',
        address: '',
        base_entry_requirements: '',
        general_information: '',
        unit_contact_info: '',
        gate_image: null,
        base_logo: null,
        base_map: null
      });

      setSelectedInstallation('');

      loadInstallations();
      loadRegions();
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to add installation.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeInstallation() {
    if (!selectedInstallation) {
      openPopup(
        'Missing Information',
        'Please select an installation to remove.'
      );
      return;
    }

    const installation = installations.find(
      (i) =>
        i.installation_id.toString() ===
        selectedInstallation.toString()
    );

    const label = installation?.installation_name || 'Installation';

    try {
      openPopup('Removing Installation', `Removing ${label}...`);

      setTimeout(async () => {
        try {
          await api.delete(`/installations/${selectedInstallation}`);

          openPopup('Removal Complete', `${label} removed successfully.`);

          setSelectedInstallation('');

          loadInstallations();
          loadRegions();
        } catch {
          openPopup('Action Failed', `Failed to remove ${label}.`);
        }
      }, 800);
    } catch {
      openPopup('Action Failed', `Failed to remove ${label}.`);
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
          position: 'relative',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            position: 'absolute',
            left: 0
          }}
        >
          Go Back
        </button>

        <h2 style={{ margin: 0 }}>
          Add / Remove Installations
        </h2>
      </div>

      <div className="card form-card wide" style={{ textAlign: 'center' }}>
        <h3>Add Installation</h3>

        <form onSubmit={createInstallation}>
          <input
            placeholder="Installation name"
            value={form.installation_name}
            onChange={(e) =>
              setForm({
                ...form,
                installation_name: e.target.value
              })
            }
          />

          <select
            value={form.state}
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value
              })
            }
          >
            <option value="">Select State / Region</option>

            {regions.map((region, index) => (
              <option
                key={`${region.region_name}-${index}`}
                value={region.region_name}
              >
                {region.region_name}
              </option>
            ))}
          </select>

          <input
            placeholder="ZIP code"
            value={form.zip_code}
            onChange={(e) =>
              setForm({
                ...form,
                zip_code: e.target.value
              })
            }
          />

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value
              })
            }
          />

          <textarea
            placeholder="Base entry requirements"
            value={form.base_entry_requirements}
            onChange={(e) =>
              setForm({
                ...form,
                base_entry_requirements: e.target.value
              })
            }
          />

          <textarea
            placeholder="General information"
            value={form.general_information}
            onChange={(e) =>
              setForm({
                ...form,
                general_information: e.target.value
              })
            }
          />

          <textarea
            placeholder="Unit contact information"
            value={form.unit_contact_info}
            onChange={(e) =>
              setForm({
                ...form,
                unit_contact_info: e.target.value
              })
            }
          />

          <h4 className="section-title">Gate Image</h4>

          <div
            className="admin-image-row"
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              className="input-group"
              style={{
                width: '100%',
                maxWidth: '600px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginBottom: '.5rem'
                }}
              >
                Upload Gate Image
              </label>

              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                style={{
                  width: '100%',
                  maxWidth: '600px'
                }}
                onChange={(e) =>
                  handleImageSelect(
                    e.target.files[0],
                    'gate_image',
                    'Gate image'
                  )
                }
              />
            </div>
          </div>

          {form.gate_image && (
            <div
              className="preview-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}
            >
              <img
                src={URL.createObjectURL(form.gate_image)}
                alt="Gate preview"
                className="admin-preview-img"
              />
            </div>
          )}

          <h4 className="section-title">Base Logo</h4>

          <div
            className="admin-image-row"
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              className="input-group"
              style={{
                width: '100%',
                maxWidth: '600px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginBottom: '.5rem'
                }}
              >
                Upload Base Logo
              </label>

              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                style={{
                  width: '100%',
                  maxWidth: '600px'
                }}
                onChange={(e) =>
                  handleImageSelect(
                    e.target.files[0],
                    'base_logo',
                    'Base logo'
                  )
                }
              />
            </div>
          </div>

          {form.base_logo && (
            <div
              className="preview-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}
            >
              <img
                src={URL.createObjectURL(form.base_logo)}
                alt="Base logo preview"
                className="admin-preview-img"
              />
            </div>
          )}

          <h4 className="section-title">Base Map</h4>

          <div
            className="admin-image-row"
            style={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              className="input-group"
              style={{
                width: '100%',
                maxWidth: '600px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginBottom: '.5rem'
                }}
              >
                Upload Base Map
              </label>

              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                style={{
                  width: '100%',
                  maxWidth: '600px'
                }}
                onChange={(e) =>
                  handleImageSelect(
                    e.target.files[0],
                    'base_map',
                    'Base map'
                  )
                }
              />
            </div>
          </div>

          {form.base_map && (
            <div
              className="preview-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2rem'
              }}
            >
              <img
                src={URL.createObjectURL(form.base_map)}
                alt="Base map preview"
                className="admin-preview-img"
              />
            </div>
          )}

          <button type="submit" disabled={uploading}>
            Add Installation
          </button>
        </form>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Remove Installation</h3>

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
            value={selectedInstallation}
            onChange={(e) =>
              setSelectedInstallation(e.target.value)
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

          <button
            className="danger"
            onClick={removeInstallation}
          >
            Remove Installation
          </button>
        </div>
      </div>
    </section>
  );
}

export default AddRemoveInstallations;