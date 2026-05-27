import { useEffect, useState } from 'react';
import api from '../services/api';

function AddRemoveInstallations() {
  const [installations, setInstallations] = useState([]);
  const [selectedInstallation, setSelectedInstallation] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    installation_name: '',
    slug: '',
    region_name: '',
    state: '',
    zip_code: '',
    address: '',
    latitude: '',
    longitude: '',
    map_top: '',
    map_left: '',
    base_entry_requirements: '',
    general_information: '',
    unit_contact_info: ''
  });

  useEffect(() => {
    loadInstallations();
  }, []);

  async function loadInstallations() {
    try {

      const res = await api.get('/installations');

      setInstallations(res.data);

    } catch {

      setMessage('Failed to load installations.');

    }
  }

  async function createInstallation(e) {

    e.preventDefault();

    const formData = new FormData();

    Object.keys(form).forEach((key) =>
      formData.append(key, form[key])
    );

    if (image) {
      formData.append('image', image);
    }

    try {

      const res = await api.post(
        '/installations',
        formData
      );

      setMessage(
        res.data.message ||
        'Installation added successfully.'
      );

      loadInstallations();

    } catch {

      setMessage('Failed to add installation.');

    }

  }

  async function removeInstallation() {

    if (!selectedInstallation) {

      setMessage('Please select an installation.');

      return;

    }

    try {

      await api.delete(
        `/installations/${selectedInstallation}`
      );

      setMessage(
        'Installation removed successfully.'
      );

      setSelectedInstallation('');

      loadInstallations();

    } catch {

      setMessage('Failed to remove installation.');

    }

  }

  return (
    <section>

      <div
  style={{
    textAlign: 'center',
    marginBottom: '2rem'
  }}
>

  <h2>Add / Remove Installations</h2>

  <button
  onClick={() => window.history.back()}
  style={{
    marginTop: '1rem'
  }}
>
  Go Back
</button>

  {message && (
    <p className="success">
      {message}
    </p>
  )}

</div>

      <div
        className="card form-card wide"
        style={{
          textAlign: 'center'
        }}
      >

        <h3>Add Installation</h3>

        <form onSubmit={createInstallation}>

          <input
            placeholder="Installation name"
            onChange={(e) =>
              setForm({
                ...form,
                installation_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Slug example: camp-pendleton"
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value
              })
            }
          />

          <input
            placeholder="Region name example: California"
            onChange={(e) =>
              setForm({
                ...form,
                region_name:
                  e.target.value
              })
            }
          />

          <input
            placeholder="State"
            onChange={(e) =>
              setForm({
                ...form,
                state: e.target.value
              })
            }
          />

          <input
            placeholder="ZIP code"
            onChange={(e) =>
              setForm({
                ...form,
                zip_code:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Address"
            onChange={(e) =>
              setForm({
                ...form,
                address:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Latitude"
            onChange={(e) =>
              setForm({
                ...form,
                latitude:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Longitude"
            onChange={(e) =>
              setForm({
                ...form,
                longitude:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Map top example: 49%"
            onChange={(e) =>
              setForm({
                ...form,
                map_top:
                  e.target.value
              })
            }
          />

          <input
            placeholder="Map left example: 40%"
            onChange={(e) =>
              setForm({
                ...form,
                map_left:
                  e.target.value
              })
            }
          />

          <textarea
            placeholder="Base entry requirements"
            onChange={(e) =>
              setForm({
                ...form,
                base_entry_requirements:
                  e.target.value
              })
            }
          />

          <textarea
            placeholder="General information"
            onChange={(e) =>
              setForm({
                ...form,
                general_information:
                  e.target.value
              })
            }
          />

          <textarea
            placeholder="Unit contact information"
            onChange={(e) =>
              setForm({
                ...form,
                unit_contact_info:
                  e.target.value
              })
            }
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

          <button type="submit">
            Add Installation
          </button>

        </form>

      </div>

      <div
        className="card"
        style={{
          textAlign: 'center'
        }}
      >

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
              setSelectedInstallation(
                e.target.value
              )
            }
          >

            <option value="">
              Select Installation
            </option>

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