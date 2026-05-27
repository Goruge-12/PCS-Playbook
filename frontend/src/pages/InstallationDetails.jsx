import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { demoInstallations } from "../data/demoData";

function InstallationDetails() {
  const { id } = useParams();

  const [base, setBase] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");

  useEffect(() => {
    async function loadBase() {
      try {
        const res = await api.get(`/installations/${id}`);

        const loadedBase = {
          ...res.data,
          city: res.data.address,
          major_units: res.data.unit_contact_info,
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
      } catch {
        const demoBase = demoInstallations.find(
          (item) =>
            item.slug === id ||
            String(item.installation_id) === id
        );

        setBase(demoBase || demoInstallations[0]);
        setUnits([]);
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
    <div className="card details-hero">

  {base.image_url && (
    <img
      className="hero-img"
      src={base.image_url}
      alt={base.installation_name}
    />
  )}

  <h2>{base.installation_name}</h2>

  <p className="muted">
    {base.city || base.address}
  </p>

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
              onChange={(e) =>
                setSelectedUnitId(e.target.value)
              }
            >
              <option value="">
                Select a unit
              </option>

              {units.map((unit) => (
                <option
                  key={unit.unit_id}
                  value={unit.unit_id}
                >
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

    <p>
      {selectedUnit.aircraft_tms &&
 selectedUnit.aircraft_tms !== "N/A" && (
  <p>
    <strong>Aircraft TMS:</strong>{" "}
    {selectedUnit.aircraft_tms}
  </p>
)}
    </p>

    <p>{selectedUnit.unit_description}</p>

    <p>
      <strong>ODO Phone:</strong>{" "}
      {selectedUnit.odo_phone || "Admin will update ODO number."}
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

      <div className="card">
        <h3>City Info</h3>

        <ul className="muted">
          {(
            base.city_info || [
              "Cost of living: placeholder",
              "Schools: placeholder",
              "Medical facilities: placeholder",
            ]
          ).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="row button-row">
          <Link
            className="button"
            to={`/mentors?base=${
              base.slug || base.installation_id
            }`}
          >
            Request Mentor
          </Link>

          <Link
            className="button ghost"
            to="/installations"
          >
            Back
          </Link>
        </div>
      </div>
    </section>
  );
}

export default InstallationDetails;