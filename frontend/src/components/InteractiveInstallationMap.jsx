import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const fallbackPositions = {
  CA: { top: "51%", left: "39%" },
  AZ: { top: "54%", left: "47%" },
  HI: { top: "76%", left: "50%" },
  NC: { top: "51%", left: "86%" },
  SC: { top: "59%", left: "84%" },
  VA: { top: "42%", left: "87%" },
  NY: { top: "34%", left: "88%" },
  GA: { top: "64%", left: "78%" },
  FL: { top: "76%", left: "83%" },
  LA: { top: "66%", left: "71%" },
  TX: { top: "66%", left: "62%" },
  GU: { top: "58%", left: "22%" },
  DC: { top: "42%", left: "88%" },
};

function InteractiveInstallationMap() {
  const [installations, setInstallations] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadInstallations() {
      try {
        const res = await api.get("/installations");
        console.log("INSTALLATIONS:", res.data);
        setInstallations(res.data);
      } catch (error) {
        console.log("Map load error:", error);
      }
    }

    loadInstallations();
  }, []);

  function openBase(base) {
    navigate(`/installations/${base.slug || base.installation_id}`);
  }

  const groupedRegions = {};

  installations.forEach((base) => {
    const region = base.region_name || base.state || "Other";

    if (!groupedRegions[region]) {
      groupedRegions[region] = [];
    }

    groupedRegions[region].push(base);
  });

  return (
    <div className="interactive-map-card">
      <h2>Marine Corps Installations</h2>
      <p className="muted">Click or hover over a pin to view installations.</p>

      <div className="custom-map">
        <img
          src="https://pcs-playbook.s3.us-east-2.amazonaws.com/Maps/maps.png"
          alt="Marine Corps installation map"
          className="map-bg"
        />

        {Object.entries(groupedRegions).map(([region, bases]) => {
          const firstBase = bases[0];

          const position = {
            top: firstBase.map_top || fallbackPositions[firstBase.state]?.top || "50%",
            left: firstBase.map_left || fallbackPositions[firstBase.state]?.left || "50%",
          };

          return (
           <button
  key={region}
  className={`map-region ${activeRegion?.region === region ? "active" : ""}`}
  style={{
    top: firstBase.map_top,
    left: firstBase.map_left,
  }}
  onClick={() =>
    setActiveRegion({
      region,
      bases,
    })
  }
  title={region}
>
  📍
</button>
          );
        })}

        {activeRegion && (
  <div className="map-info-box">
    <button
      className="map-close-button"
      onClick={() => setActiveRegion(null)}
    >
      X
    </button>

    <h3>{activeRegion.region}</h3>

    {activeRegion.bases.map((base) => (
      <div
        key={base.installation_id}
        className="map-base-item"
        onClick={() => openBase(base)}
      >
        <strong>{base.installation_name}</strong>
        <p>{base.address}</p>
      </div>
    ))}
  </div>
)}
      </div>
    </div>
  );
}

export default InteractiveInstallationMap;