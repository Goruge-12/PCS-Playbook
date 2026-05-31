import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { demoInstallations } from "../data/demoData";

function InstallationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [base, setBase] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [showCityInfo, setShowCityInfo] = useState(false);
  const [cityInfo, setCityInfo] = useState(null);
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    async function loadBase() {
      try {
        const res = await api.get(`/installations/${id}`);

        const loadedBase = {
          ...res.data,
          city: res.data.address,
          major_units: res.data.unit_contact_info
        };

        setBase(loadedBase);

        try {
          const unitRes = await api.get(
            `/units/installation/${res.data.installation_id}`
          );
          setUnits(unitRes.data);
        } catch {
          setUnits([]);
        }

        try {
          const cityRes = await api.get(
            `/city-info/installation/${res.data.installation_id}`
          );

          setCityInfo(cityRes.data.cityInfo);
          setAttractions(cityRes.data.attractions || []);
        } catch {
          setCityInfo(null);
          setAttractions([]);
        }
      } catch {
        const demoBase = demoInstallations.find(
          (item) =>
            item.slug === id ||
            String(item.installation_id) === id
        );

        setBase(demoBase || demoInstallations[0]);
        setUnits([]);
        setCityInfo(null);
        setAttractions([]);
      }
    }

    loadBase();
  }, [id]);

  if (!base) return <p>Loading...</p>;

  const selectedUnit = units.find(
    (unit) => String(unit.unit_id) === selectedUnitId
  );

  return (
    <section>
      <button
        className="button ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "1rem" }}
      >
        Back
      </button>

      {showCityInfo && (
        <div className="modal-backdrop">
          <div
            className="modal-card"
            style={{
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              textAlign: "left",
              position: "relative"
            }}
          >
            <button
              onClick={() => setShowCityInfo(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                color: "#111",
                fontSize: "1.5rem",
                border: "none",
                cursor: "pointer"
              }}
            >
              ×
            </button>

            <h2 style={{ textAlign: "center" }}>
              City Information
            </h2>

            <p
              className="muted"
              style={{
                textAlign: "center",
                marginBottom: "1.5rem"
              }}
            >
              {base.city || base.address}
            </p>

            {!cityInfo ? (
              <p className="muted" style={{ textAlign: "center" }}>
                City information has not been added yet.
              </p>
            ) : (
              <>
                {cityInfo.city_summary && (
                  <p>{cityInfo.city_summary}</p>
                )}

                <p>
                  <strong>Weather:</strong>{" "}
                  {cityInfo.weather || "Admin will update weather information."}
                </p>

                <p>
                  <strong>Transportation:</strong>{" "}
                  {cityInfo.transportation ||
                    "Admin will update transportation information."}
                </p>

                <p>
                  <strong>Local Vibe:</strong>{" "}
                  {cityInfo.local_vibe ||
                    "Admin will update local information."}
                </p>

                <p>
                  <strong>Housing:</strong>{" "}
                  {cityInfo.housing ||
                    "Admin will update housing information."}
                </p>

                <p>
                  <strong>Schools:</strong>{" "}
                  {cityInfo.schools ||
                    "Admin will update school information."}
                </p>

                <p>
                  <strong>Medical Facilities:</strong>{" "}
                  {cityInfo.medical_facilities ||
                    "Admin will update medical information."}
                </p>

                <p>
                  <strong>Hidden Gems:</strong>{" "}
                  {cityInfo.hidden_gems ||
                    "Admin will update hidden gems."}
                </p>
              </>
            )}

            <h3 style={{ textAlign: "center", marginTop: "2rem" }}>
              Things To Do
            </h3>

            {attractions.length === 0 ? (
              <p className="muted" style={{ textAlign: "center" }}>
                No attractions have been added yet.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem"
                }}
              >
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

                    <p className="muted">{item.description}</p>

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
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1.5rem"
              }}
            >
              <button
                className="button"
                onClick={() => setShowCityInfo(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card details-hero">
        {base.image_url && (
          <img
            className="hero-img"
            src={base.image_url}
            alt={base.installation_name}
          />
        )}

        <h2>{base.installation_name}</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap"
          }}
        >
          <p className="muted" style={{ margin: 0 }}>
            {base.city || base.address}
          </p>

          <button
            className="button"
            onClick={() => setShowCityInfo(true)}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.9rem"
            }}
          >
            City Info
          </button>
        </div>
      </div>

      <div className="card base-map-card">
        <h3>Base Map</h3>

        {base.base_map_url ? (
          <>
            <img
              className="hero-img"
              src={base.base_map_url}
              alt={`${base.installation_name} map`}
            />

            <div className="map-button-wrapper">
              <a
                className="button"
                href={base.base_map_url}
                target="_blank"
                rel="noreferrer"
              >
                Open Full Base Map
              </a>
            </div>
          </>
        ) : (
          <div className="map-placeholder">
            <h3>Map Coming Soon</h3>

            <p>
              A base map has not been added yet for this installation.
            </p>
          </div>
        )}
      </div>

      <div className="card details-card">
        <h3>Base Entry Requirements</h3>
        <p>{base.base_entry_requirements}</p>

        <h3>General Information</h3>
        <p>{base.general_information}</p>

        <h3>Major Units</h3>
        <p>{base.major_units || base.unit_contact_info}</p>
      </div>

      <div className="card">
        <h3>Units Currently on Station</h3>

        {units.length === 0 ? (
          <p className="muted">
            No units added yet. Admin will update unit information.
          </p>
        ) : (
          <>
            <select
              className="unit-dropdown"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
            >
              <option value="">Select a unit</option>

              {units.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_name}
                </option>
              ))}
            </select>

            {selectedUnit && (
              <div className="unit-card">
                <h4>{selectedUnit.unit_name}</h4>

                {selectedUnit.unit_logo_url && (
                  <img
                    className="unit-logo"
                    src={selectedUnit.unit_logo_url}
                    alt={`${selectedUnit.unit_name} logo`}
                  />
                )}

                <p>
                  <strong>Type:</strong> {selectedUnit.unit_type}
                </p>

                {selectedUnit.aircraft_tms &&
                  selectedUnit.aircraft_tms !== "N/A" && (
                    <p>
                      <strong>Aircraft TMS:</strong>{" "}
                      {selectedUnit.aircraft_tms}
                    </p>
                  )}

                <p>{selectedUnit.unit_description}</p>

                <p>
                  <strong>ODO Phone:</strong>{" "}
                  {selectedUnit.odo_phone ||
                    "Admin will update ODO number."}
                </p>

                <Link
                  className="button"
                  to={`/units/${selectedUnit.unit_id}`}
                  state={{
                    from: `/installations/${id}`
                  }}
                >
                  View Unit History & Command
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className="row button-row"
        style={{
          justifyContent: "center"
        }}
      >
        <Link className="button" to="/mentor-request">
          Request Mentor
        </Link>
      </div>
    </section>
  );
}

export default InstallationDetails;