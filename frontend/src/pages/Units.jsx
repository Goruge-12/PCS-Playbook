import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Units() {
  const [units, setUnits] = useState([]);
  const [openInstallation, setOpenInstallation] = useState("");

  useEffect(() => {
    api
      .get("/units/search")
      .then((res) => setUnits(res.data))
      .catch(() => setUnits([]));
  }, []);

  const groupedUnits = units.reduce((groups, unit) => {
    const parentCommand = unit.installation_name || "Other Units";

    if (!groups[parentCommand]) {
      groups[parentCommand] = [];
    }

    groups[parentCommand].push(unit);
    return groups;
  }, {});

  const installationNames = Object.keys(groupedUnits).sort();

  return (
    <section className="units-page">
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem"
        }}
      >
        <h2>All Units</h2>
        <p className="muted">
          Browse Marine Corps units by installation or parent command.
        </p>
      </div>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 2rem auto"
        }}
      >
        <label
          style={{
            display: "block",
            textAlign: "center",
            fontWeight: "600",
            marginBottom: ".5rem"
          }}
        >
          Select Installation
        </label>

        <select
          value={openInstallation}
          onChange={(e) => setOpenInstallation(e.target.value)}
          style={{
            width: "100%"
          }}
        >
          <option value="">Choose an Installation</option>

          {installationNames.map((installation) => (
            <option key={installation} value={installation}>
              {installation}
            </option>
          ))}
        </select>
      </div>

      {openInstallation && (
        <div className="card">
          <h3 style={{ textAlign: "center" }}>
            {openInstallation}
          </h3>

          <div className="unit-grid">
            {groupedUnits[openInstallation].map((unit) => (
              <Link
                to={`/units/${unit.unit_id}`}
                state={{ from: "/units" }}
                className="unit-tile"
                key={unit.unit_id}
              >
                {unit.unit_logo_url ? (
                  <img
                    src={unit.unit_logo_url}
                    alt={unit.unit_name}
                    className="unit-tile-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}

                <div className="unit-img-placeholder">
                  Image Coming Soon
                </div>

                <h4>{unit.unit_name}</h4>

                <p>{unit.unit_type}</p>

                {unit.aircraft_tms && unit.aircraft_tms !== "N/A" && (
                  <span>{unit.aircraft_tms}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Units;