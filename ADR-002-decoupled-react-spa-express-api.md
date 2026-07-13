# ADR-002: Decoupled React SPA + Express REST API

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

PCS Playbook needed a UI for browsing installations, submitting mentor requests, and an admin back office, backed by data that changes independently of page content (installations, users, mentor requests). The team needed to iterate on UI and API concerns separately, and the app had to be deployable to two different kinds of hosts (static hosting for UI, a Node process for the API).

## Decision

The system is split into two independently-run applications:

- **Frontend:** a React 18 single-page app built with Vite, using `react-router-dom` for client-side routing (`frontend/src/App.jsx`).
- **Backend:** a Node.js/Express REST API (`backend/app.js`, `backend/server.js`) exposing JSON endpoints under `/api/*`, with no server-rendered views.

The two communicate exclusively over HTTP JSON. `app.js` enables CORS for an explicit allowlist (`http://localhost:5173` plus `process.env.FRONTEND_URL`) rather than a wildcard origin, and the frontend targets the API via a configurable base URL (`VITE_API_URL`).

## Consequences

### Positive

- Frontend and backend can be developed, deployed, and scaled independently (e.g., static hosting for the SPA, a separate Node host for the API).
- A JSON REST contract is easy to test in isolation (see [[ADR-011-jest-supertest-mocked-testing]]) without spinning up a browser.
- Explicit CORS allowlisting is more restrictive than a wildcard and keeps the API from being callable by arbitrary origins.

### Negative / Trade-offs

- No server-side rendering means slower first paint and no SEO benefit — acceptable for an authenticated internal tool, but would need reconsideration for a public-facing product.
- Two deployable units means two sets of environment configuration (`FRONTEND_URL`, `VITE_API_URL`) that must be kept in sync across environments, or the app breaks silently with CORS errors.
- Every piece of state that would be "free" with server-rendered pages (auth status, role) has to be re-derived client-side from `localStorage` on every load (see [[ADR-001-jwt-role-based-auth]]).

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Server-rendered Express + templating (EJS/Pug) | Would tightly couple UI and API deploys and complicate the interactive map/dashboard UX the app needed |
| Next.js (SSR/hybrid React) | Adds framework complexity and a Node SSR runtime not needed for an internal, authenticated tool |
| Monolithic single deploy (API serves built SPA assets) | Simpler ops, but was rejected to keep frontend iteration (Vite dev server, hot reload) decoupled from backend restarts |
