import React from 'react';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import InteractiveInstallationMap from "../components/InteractiveInstallationMap";

function Home() {
  const [installations, setInstallations] = useState([]);
  const [selectedBase, setSelectedBase] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadInstallations() {
      try {
        const res = await api.get("/installations");
        setInstallations(res.data);
      } catch (error) {
        console.log(error);
      }
    }

    loadInstallations();
  }, []);

  function openDetail(base) {
    navigate(`/installations/${base.slug || base.installation_id}`);
  }

  function distanceMiles(lat1, lon1, lat2, lon2) {
    const earthRadius = 3958.8;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  async function getZipCoordinates(zipCode) {
    const res = await fetch(`https://api.zippopotam.us/us/${zipCode}`);

    if (!res.ok) {
      throw new Error("ZIP code not found.");
    }

    const data = await res.json();

    return {
      lat: Number(data.places[0].latitude),
      lon: Number(data.places[0].longitude),
    };
  }

  async function goInstall() {
    setMessage("");

    if (selectedBase) {
      const base = installations.find(
        (item) => String(item.installation_id) === selectedBase
      );

      if (base) {
        openDetail(base);
        return;
      }
    }

    if (!zip.trim()) {
      setMessage("Please select a base or enter a ZIP code.");
      return;
    }

    try {
      const userLocation = await getZipCoordinates(zip.trim());

      const basesWithDistance = installations
        .filter((base) => base.latitude && base.longitude)
        .map((base) => ({
          ...base,
          distance: distanceMiles(
            userLocation.lat,
            userLocation.lon,
            Number(base.latitude),
            Number(base.longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      if (basesWithDistance.length === 0) {
        setMessage("No bases with coordinates were found.");
        return;
      }

      const closestBase = basesWithDistance[0];

      setMessage(
        `Closest base found: ${closestBase.installation_name} (${Math.round(
          closestBase.distance
        )} miles away). Click below to open.`
      );

      setSelectedBase(String(closestBase.installation_id));
    } catch (error) {
      setMessage("Could not find that ZIP code. Please try another one.");
    }
  }

  return (
    <section>
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Welcome to the PCS Playbook</h2>

        <p className="muted">
          Explore Marine Corps installations, view location information, and get
          organized before your move.
        </p>
      </div>

      <div className="card home-search-card">
        <h3>Search Installations</h3>

        <div className="home-search-row">
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
          >
            <option value="">Select an Installation</option>

            {installations.map((base) => (
              <option key={base.installation_id} value={base.installation_id}>
                {base.installation_name} - {base.state}
              </option>
            ))}
          </select>

          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP Code to find nearest Installation"
          />

          <button onClick={goInstall}>Find Installation</button>
        </div>

        {message && (
          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <p
              className="success"
              style={{
                margin: 0,
              }}
            >
              {message}
            </p>

            {selectedBase && (
              <button
                style={{
                  margin: 0,
                }}
                onClick={() => {
                  const base = installations.find(
                    (item) => String(item.installation_id) === selectedBase
                  );

                  if (base) {
                    openDetail(base);
                  }
                }}
              >
                View Installation
              </button>
            )}
          </div>
        )}

        <p className="small-muted">
          Select a base directly, or enter a ZIP code to find the closest
          installation.
        </p>
      </div>

      <InteractiveInstallationMap />

      <div
        className="hero-actions"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <Link className="button secondary" to="/mentor-request">
          Request Mentor Support
        </Link>
      </div>
    </section>
  );
}

export default Home;