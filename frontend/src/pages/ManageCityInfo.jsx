import { useEffect, useState } from 'react';
import api from '../services/api';

function ManageCityInfo() {
  const [installations, setInstallations] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const [message, setMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [cityInfo, setCityInfo] = useState({
    city_summary: '',
    weather: '',
    transportation: '',
    local_vibe: '',
    hidden_gems: '',
    schools: '',
    medical_facilities: '',
    housing: ''
  });

  const [attraction, setAttraction] = useState({
    title: '',
    description: '',
    website_url: '',
    image_url: '',
    display_order: 0
  });

  const [attractionImage, setAttractionImage] = useState(null);
  const [attractions, setAttractions] = useState([]);

  const orderOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    loadInstallations();
  }, []);

  function openPopup(title, msg) {
    setPopupTitle(title);
    setMessage(msg);
    setShowPopup(true);
  }

  async function loadInstallations() {
    try {
      const res = await api.get('/installations');
      setInstallations(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load installations.');
    }
  }

  async function loadCityInfo(installationId) {
    setSelectedInstallation(installationId);

    if (!installationId) {
      setCityInfo({
        city_summary: '',
        weather: '',
        transportation: '',
        local_vibe: '',
        hidden_gems: '',
        schools: '',
        medical_facilities: '',
        housing: ''
      });
      setAttractions([]);
      return;
    }

    try {
      const res = await api.get(
        `/city-info/installation/${installationId}`
      );

      setCityInfo(
        res.data.cityInfo || {
          city_summary: '',
          weather: '',
          transportation: '',
          local_vibe: '',
          hidden_gems: '',
          schools: '',
          medical_facilities: '',
          housing: ''
        }
      );

      setAttractions(res.data.attractions || []);
    } catch {
      openPopup('Action Failed', 'Failed to load city information.');
    }
  }

  async function saveCityInfo(e) {
    e.preventDefault();

    if (!selectedInstallation) {
      openPopup('Missing Information', 'Please select an installation first.');
      return;
    }

    try {
      openPopup('Saving City Info', 'Saving city information...');

      const res = await api.put(
        `/city-info/installation/${selectedInstallation}`,
        cityInfo
      );

      openPopup(
        'Save Complete',
        res.data.message || 'City information saved successfully.'
      );

      loadCityInfo(selectedInstallation);
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.message ||
          'Failed to save city information.'
      );
    }
  }

  async function uploadCityImage(file) {
    if (!file) return '';

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'City-Photos');

    try {
      setUploading(true);
      openPopup('Uploading Image', 'Uploading image to City-Photos folder...');

      const res = await api.post('/admin/upload', formData);

      const imageUrl =
        res.data.imageUrl ||
        res.data.image_url ||
        res.data.url ||
        '';

      if (!imageUrl.startsWith('http')) {
        openPopup(
          'Action Failed',
          'Upload worked, but backend did not return a valid image URL.'
        );
        return '';
      }

      openPopup('Upload Complete', 'City photo uploaded successfully.');
      return imageUrl;
    } catch {
      openPopup('Action Failed', 'City photo upload failed.');
      return '';
    } finally {
      setUploading(false);
    }
  }

  async function addAttraction(e) {
    e.preventDefault();

    if (!selectedInstallation) {
      openPopup('Missing Information', 'Please select an installation first.');
      return;
    }

    if (!attraction.title.trim()) {
      openPopup('Missing Information', 'Please enter an attraction title.');
      return;
    }

    let finalImageUrl = attraction.image_url;

    if (attractionImage) {
      finalImageUrl = await uploadCityImage(attractionImage);
    }

    try {
      openPopup('Saving Attraction', 'Saving attraction...');

      const res = await api.post(
        `/city-info/installation/${selectedInstallation}/attractions`,
        {
          ...attraction,
          image_url: finalImageUrl
        }
      );

      openPopup(
        'Save Complete',
        res.data.message || 'Attraction added successfully.'
      );

      setAttraction({
        title: '',
        description: '',
        website_url: '',
        image_url: '',
        display_order: 0
      });

      setAttractionImage(null);

      loadCityInfo(selectedInstallation);
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.message ||
          'Failed to add attraction.'
      );
    }
  }

  async function updateAttractionOrder(attractionId, newOrder) {
    try {
      await api.put(`/city-info/attractions/${attractionId}`, {
        display_order: newOrder
      });

      openPopup('Order Updated', 'Attraction display order updated.');

      loadCityInfo(selectedInstallation);
    } catch {
      openPopup('Action Failed', 'Failed to update attraction order.');
    }
  }

  async function deleteAttraction(attractionId) {
    try {
      openPopup('Removing Attraction', 'Removing attraction...');

      await api.delete(`/city-info/attractions/${attractionId}`);

      openPopup('Removal Complete', 'Attraction removed successfully.');

      loadCityInfo(selectedInstallation);
    } catch {
      openPopup('Action Failed', 'Failed to remove attraction.');
    }
  }

  async function clearCityInfo() {
    if (!selectedInstallation) {
      openPopup('Missing Information', 'Please select an installation first.');
      return;
    }

    try {
      const emptyCityInfo = {
        city_summary: '',
        weather: '',
        transportation: '',
        local_vibe: '',
        hidden_gems: '',
        schools: '',
        medical_facilities: '',
        housing: ''
      };

      await api.put(
        `/city-info/installation/${selectedInstallation}`,
        emptyCityInfo
      );

      setCityInfo(emptyCityInfo);

      openPopup('City Info Cleared', 'City information was cleared.');
    } catch {
      openPopup('Action Failed', 'Failed to clear city information.');
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

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Manage City Info</h2>

        <p className="muted">
          Add city details, local information, and things to do for each installation.
        </p>
      </div>

      <div className="card form-card wide">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <label style={{ fontWeight: '600' }}>
            Select Installation
          </label>

          <select
            value={selectedInstallation}
            onChange={(e) => loadCityInfo(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px'
            }}
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
      </div>

      {selectedInstallation && (
        <>
          <div className="card form-card wide">
            <h3 style={{ textAlign: 'center' }}>
              City Information
            </h3>

            <form onSubmit={saveCityInfo}>
              <textarea
                placeholder="City Summary"
                value={cityInfo.city_summary || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    city_summary: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Weather / Climate"
                value={cityInfo.weather || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    weather: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Transportation"
                value={cityInfo.transportation || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    transportation: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Local Vibe"
                value={cityInfo.local_vibe || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    local_vibe: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Hidden Gems"
                value={cityInfo.hidden_gems || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    hidden_gems: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Schools"
                value={cityInfo.schools || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    schools: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Medical Facilities"
                value={cityInfo.medical_facilities || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    medical_facilities: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Housing"
                value={cityInfo.housing || ''}
                onChange={(e) =>
                  setCityInfo({
                    ...cityInfo,
                    housing: e.target.value
                  })
                }
              />

              <button type="submit">
                Save City Information
              </button>

              <button
                type="button"
                className="danger"
                onClick={clearCityInfo}
                style={{ marginTop: '1rem' }}
              >
                Clear City Information
              </button>
            </form>
          </div>

          <div className="card form-card wide">
            <h3 style={{ textAlign: 'center' }}>
              Add Thing To Do
            </h3>

            <form onSubmit={addAttraction}>
              <input
                placeholder="Attraction Title"
                value={attraction.title}
                onChange={(e) =>
                  setAttraction({
                    ...attraction,
                    title: e.target.value
                  })
                }
              />

              <textarea
                placeholder="Description"
                value={attraction.description}
                onChange={(e) =>
                  setAttraction({
                    ...attraction,
                    description: e.target.value
                  })
                }
              />

              <input
                placeholder="Website URL"
                value={attraction.website_url}
                onChange={(e) =>
                  setAttraction({
                    ...attraction,
                    website_url: e.target.value
                  })
                }
              />

              <label
                style={{
                  fontWeight: '600',
                  marginTop: '1rem'
                }}
              >
                Upload Attraction Image
              </label>

              <input
                disabled={uploading}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAttractionImage(e.target.files[0])
                }
              />

              {attractionImage && (
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '1rem'
                  }}
                >
                  <img
                    src={URL.createObjectURL(attractionImage)}
                    alt="Preview"
                    style={{
                      maxWidth: '250px',
                      borderRadius: '10px'
                    }}
                  />
                </div>
              )}

              <select
                value={attraction.display_order}
                onChange={(e) =>
                  setAttraction({
                    ...attraction,
                    display_order: e.target.value
                  })
                }
              >
                <option value={0}>Select Display Order</option>

                {orderOptions.map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={uploading}>
                Add Attraction
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ textAlign: 'center' }}>
              Current Things To Do
            </h3>

            {attractions.length === 0 ? (
              <p className="muted" style={{ textAlign: 'center' }}>
                No attractions added yet.
              </p>
            ) : (
              <div className="grid">
                {attractions.map((item) => (
                  <div className="card" key={item.attraction_id}>
                    {item.image_url && (
                      <img
                        className="card-img"
                        src={item.image_url}
                        alt={item.title}
                      />
                    )}

                    <h4>{item.title}</h4>

                    <p>{item.description}</p>

                    {item.website_url && (
                      <a
                        className="button"
                        href={item.website_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit Website
                      </a>
                    )}

                    <label
                      style={{
                        fontWeight: '600',
                        marginTop: '1rem',
                        display: 'block'
                      }}
                    >
                      Display Order
                    </label>

                    <select
                      value={item.display_order || 0}
                      onChange={(e) =>
                        updateAttractionOrder(
                          item.attraction_id,
                          e.target.value
                        )
                      }
                    >
                      <option value={0}>Select Order</option>

                      {orderOptions.map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteAttraction(item.attraction_id)
                      }
                      style={{
                        marginTop: '1rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ManageCityInfo;