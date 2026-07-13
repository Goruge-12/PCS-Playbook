# ADR-010: Bundled Demo Data as a Frontend Fallback

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

The frontend (Vite dev server) and backend (Express + MySQL) are developed and often run independently (see [[ADR-002-decoupled-react-spa-express-api]]). Requiring a fully running backend and seeded MySQL database just to view or demo the UI would slow down frontend iteration and make quick demos/presentations fragile.

## Decision

`frontend/src/data/demoData.js` hardcodes representative sample data — `demoInstallations` (Camp Pendleton, Camp Lejeune, Quantico, MCAS Miramar with full field sets) and `demoRequests` — directly in the frontend bundle. As documented in `README.md`: *"The frontend also includes demo installation data so the pages still display even if the backend is not running yet. When the backend is running and MySQL has data, the app will try to load live data from the API."* Pages fall back to this static data when the live API call fails or returns nothing.

## Consequences

### Positive

- The UI is demoable and visually complete (map, installation details, request queues) without any backend/database setup — valuable for presentations, grading, or onboarding new contributors.
- Frontend development can proceed independently of backend/database availability or state.

### Negative / Trade-offs

- Demo data can silently mask real integration failures during development — a broken API call and an intentionally-offline backend look the same to whoever's viewing the page.
- The demo dataset's shape (fields like `slug`, `city_info`, `major_units`) must be kept in sync by hand with the real API/schema shape, and can drift, as seen in the schema/controller field mismatches noted in [[ADR-003-relational-schema-raw-sql-no-orm]].
- There's no visible UI indicator distinguishing "showing live data" from "showing demo fallback data," which could confuse a user (or admin) into thinking stale demo content is real.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Require a running backend for all frontend development | Simpler to keep in sync, but adds friction to frontend-only work and demos |
| Mock service worker / API mocking layer | More robust and realistic mocking, but heavier tooling than needed for a capstone project's demo needs |
| Loading/error states with no fallback content | More "honest" UX, but leaves pages empty/broken for anyone without a live backend, undermining demoability |
