// src/pages/UnitDetails.jsx
import React from 'react';
import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../services/api";

function UnitDetails() {
  const { unitId } = useParams();
  const [unit, setUnit] = useState(null);
  const location = useLocation();
  const backLink = location.state?.from || "/units";

  useEffect(() => {
    api
      .get(`/units/${unitId}`)
      .then((res) => setUnit(res.data))
      .catch(() => setUnit(null));
  }, [unitId]);

  if (!unit) return <p>Loading unit...</p>;

  return (
    <section className="unit-details-page">
      <Link
        className="button ghost"
        to={backLink}
        style={{
          marginBottom: "1rem",
          display: "inline-block"
        }}
      >
        Back
      </Link>

      <div className="card unit-detail-card">
        <h2>{unit.unit_name}</h2>

        {unit.unit_logo_url && (
          <img
            className="unit-logo-large"
            src={unit.unit_logo_url}
            alt={`${unit.unit_name} logo`}
            style={{
              objectFit: "contain"
            }}
          />
        )}

        <p>
          <strong>Installation:</strong> {unit.installation_name}
        </p>

        <p>
          <strong>Type:</strong> {unit.unit_type}
        </p>

        {unit.aircraft_tms && unit.aircraft_tms !== "N/A" && (
          <p>
            <strong>Aircraft TMS:</strong> {unit.aircraft_tms}
          </p>
        )}

        <p>
          <strong>ODO Phone:</strong>{" "}
          {unit.odo_phone || "Admin will update ODO number."}
        </p>
      </div>

      <div className="card">
        <h3>Unit History</h3>

        <p>
          {unit.unit_history ||
            "Unit history is currently being updated. This section will include the unit’s background, mission, major responsibilities, and historical role within the Marine Corps."}
        </p>
      </div>

      <div className="card">
        <h3>Command Team</h3>

        <div className="command-grid">
          <div className="command-card">
            {unit.commanding_officer_image_url ? (
              <img
                className="command-img"
                src={unit.commanding_officer_image_url}
                alt="Commanding Officer"
                style={{
                  objectFit: "contain",
                  background: "#fff"
                }}
              />
            ) : (
              <div className="command-img-placeholder">
                Image Coming Soon
              </div>
            )}

            <h4>Commanding Officer</h4>
            <p>{unit.commanding_officer || "Name coming soon"}</p>
          </div>

          <div className="command-card">
            {unit.executive_officer_image_url ? (
              <img
                className="command-img"
                src={unit.executive_officer_image_url}
                alt="Executive Officer"
                style={{
                  objectFit: "contain",
                  background: "#fff"
                }}
              />
            ) : (
              <div className="command-img-placeholder">
                Image Coming Soon
              </div>
            )}

            <h4>Executive Officer</h4>
            <p>{unit.executive_officer || "Name coming soon"}</p>
          </div>

          <div className="command-card">
            {unit.senior_enlisted_advisor_image_url ? (
              <img
                className="command-img"
                src={unit.senior_enlisted_advisor_image_url}
                alt="Senior Enlisted Advisor"
                style={{
                  objectFit: "contain",
                  background: "#fff"
                }}
              />
            ) : (
              <div className="command-img-placeholder">
                Image Coming Soon
              </div>
            )}

            <h4>Senior Enlisted Advisor</h4>
            <p>{unit.senior_enlisted_advisor || "Name coming soon"}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Command Information</h3>

        <p>
          {unit.command_info ||
            "Command information is currently being updated. This section will include the unit command structure, leadership notes, and general reporting information."}
        </p>
      </div>
    </section>
  );
}

export default UnitDetails;