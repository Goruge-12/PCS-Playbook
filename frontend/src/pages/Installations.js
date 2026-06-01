import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import api from '../services/api';
import { demoInstallations } from '../data/demoData';

function normalizeBase(base) {
  return {
    ...base,
    slug: base.slug || String(base.installation_id),
    city: base.city || base.address || `${base.state} ${base.zip_code}`,
    major_units:
      base.major_units ||
      base.unit_contact_info ||
      'Units managed by admin.'
  };
}

function Installations() {
  const [installations, setInstallations] = useState(demoInstallations);
  const [search, setSearch] = useState('');

  async function loadInstallations() {
    try {
      const res = await api.get(
        `/installations?search=${encodeURIComponent(search)}`
      );

      if (res.data?.length) {
        setInstallations(res.data.map(normalizeBase));
      } else {
        setInstallations(filterDemo());
      }
    } catch {
      setInstallations(filterDemo());
    }
  }

  function filterDemo() {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return demoInstallations;

    return demoInstallations.filter((base) =>
      `${base.installation_name} ${base.city} ${base.state} ${base.zip_code}`
        .toLowerCase()
        .includes(keyword)
    );
  }

  useEffect(() => {
    loadInstallations();
  }, []);

  return (
    <section>
      <div
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <h2>Marine Corps Installations</h2>

        <p className="muted">
          Select an installation to view details.
        </p>
      </div>

      <div className="map-card">
        <MapContainer center={[36.5, -96]} zoom={4} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {installations
            .filter(
              (base) =>
                base.latitude &&
                base.longitude &&
                !Number.isNaN(Number(base.latitude)) &&
                !Number.isNaN(Number(base.longitude))
            )
            .map((base) => (
              <Marker
                key={base.slug}
                position={[
                  Number(base.latitude),
                  Number(base.longitude)
                ]}
              >
                <Popup>
                  <strong>{base.installation_name}</strong>
                  <br />
                  {base.city}
                  <br />
                  <Link to={`/installations/${base.slug}`}>
                    View Installation
                  </Link>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <div
        style={{
          maxHeight: '1250px',
          overflowY: 'auto',
          marginTop: '2rem',
          paddingRight: '.5rem'
        }}
      >
        <div className="grid">
          {installations.map((base) => (
            <div className="card" key={base.slug}>
              {(base.image_url || base.gate_image_url) && (
                <img
                  className="card-img"
                  src={base.image_url || base.gate_image_url}
                  alt={base.installation_name}
                />
              )}

              <h3>{base.installation_name}</h3>

              <p className="muted">{base.city}</p>

              <p>
                <strong>Major Units:</strong> {base.major_units}
              </p>

              <Link
                className="button"
                to={`/installations/${base.slug}`}
              >
                View Installation
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Installations;