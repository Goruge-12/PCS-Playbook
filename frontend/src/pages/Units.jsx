import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Units() {
  const [units, setUnits] = useState([]);

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

  return (
    <section className="units-page">
      <div className="card">
        <h2>All Units</h2>
        <p className="muted">
          Browse Marine Corps units by their installation or parent command.
        </p>
      </div>

      {Object.keys(groupedUnits).map((parentCommand) => (
        <div className="card" key={parentCommand}>
          <h3>{parentCommand}</h3>

          <div className="unit-grid">
            {groupedUnits[parentCommand].map((unit) => (
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
      ))}
    </section>
  );
}

export default Units;
