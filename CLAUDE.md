# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

PCS Playbook is a full-stack web app for Marines completing a Permanent Change of Station (PCS) move. Users browse Marine Corps installations, view entry requirements and unit contact info, request mentors, and manage installation/profile images via AWS S3.

Stack: React (Vite) frontend, Node.js/Express backend, MySQL (raw `mysql2` queries, no ORM), AWS S3 for image storage, JWT auth.

## Commands

There is no root-level package.json — `frontend/` and `backend/` are independent projects, run separately.

Backend (from `backend/`):
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start with node
- No lint, test, or build scripts exist for the backend.

Frontend (from `frontend/`):
- `npm run dev` — start Vite dev server (default `http://localhost:5173`)
- `npm run build` — production build
- `npm run preview` — preview the production build
- No lint or test scripts exist for the frontend.

There is currently no automated test suite in either project — verify changes manually by running both servers.

### Environment

Backend needs a `.env` (see `backend/.env` for the keys it expects: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `EMAIL_USER`, `EMAIL_PASS`).

Frontend reads `VITE_API_URL` (optional, defaults to `http://localhost:5000/api`) — see `frontend/src/services/api.js`.

The frontend ships with demo data (`frontend/src/data/demoData.js`) so pages like Installations still render without a backend connection; when the API call succeeds it replaces the demo data with live results (see the `normalizeBase`/fallback pattern in `frontend/src/pages/Installations.jsx`).

## Architecture

### Backend (`backend/`)

Standard layered Express app: `server.js` mounts one router per resource under `/api/*` (`routes/` → `controllers/`). There is no service/model layer — controllers call the shared `mysql2/promise` pool (`config/db.js`) directly with parameterized SQL and a consistent `try { ... } catch (error) { res.status(500).json({ message: ..., error: error.message }) }` pattern.

- `middleware/auth.js` exports `auth` (verifies the `Authorization: Bearer <jwt>` header, sets `req.user`) and `adminOnly` (checks `req.user.role === 'admin'`). Apply both in sequence on routes that need admin access, e.g. `router.get('/users', auth, adminOnly, adminController.getAllUsers)`.
- Not all routes that probably should be protected actually have `auth`/`adminOnly` applied — e.g. unit create/delete in `routes/unitRoutes.js` has no middleware. Check each route file rather than assuming protection follows from intent.
- `config/s3.js` exports `uploadToS3(file, folder)`, used by `controllers/uploadController.js` (wired through `middleware/upload.js`, a multer memory-storage config) to push installation/profile images to S3 and return a public URL.
- `utils/emailService.js` sends the temporary password email used by the forgot-password flow in `controllers/authController.js`.
- JWTs are signed with `{ user_id, email, role }` and a 1-day expiry; the frontend persists the decoded `user` object and `token` to `localStorage` separately (not derived from the JWT client-side).

**`backend/sql/schema.sql` is stale and does not match the live application.** It defines a `role ENUM('marine','mentor','admin')` and has no `units`/`installation_units` table, but `authController.js` actually inserts users with role `'mentee'`, plus `phone`, `rank`, `assigned_installation_id`, and `must_change_password` columns that aren't in the schema file, and `unitController.js` queries an `installation_units` table that the schema never creates. Treat the controllers/queries as the source of truth for the real table shape, not `schema.sql`.

### Frontend (`frontend/src/`)

- `App.jsx` defines all routes in one file with `react-router-dom`. Admin/mentor/mentee-only pages are wrapped in `<ProtectedRoute allowedRoles={[...]}>` (`components/ProtectedRoute.jsx`), which reads `token`/`user` from `localStorage` and redirects to `/login` or `/unauthorized` accordingly. Note the role string mismatch above (`'mentee'` from the backend vs. `'marine'` in the stale schema) — `allowedRoles` checks must match what `authController.js` actually issues.
- `services/api.js` is a single shared axios instance; a request interceptor attaches `Authorization: Bearer <token>` from `localStorage` on every call. Use this instance for all API calls rather than raw axios/fetch.
- `components/Navbar.jsx` re-reads `token`/`user` from `localStorage` on `storage` and a custom `profileUpdated` window event — dispatch `profileUpdated` after any login/logout/profile-image change so the navbar stays in sync (it does not poll or use context).
- Admin CRUD pages are split by resource and by action, e.g. `AddRemoveInstallations.jsx` / `ModifyInstallations.jsx` and `AddRemoveUnits.jsx` / `ModifyUnits.jsx` are separate pages rather than one combined admin form.
- `pages/Installations.jsx` uses `react-leaflet` for the clickable installation map; marker icon assets are imported and re-registered manually (`L.Icon.Default.mergeOptions(...)`) because Vite/Leaflet's default icon path resolution doesn't work out of the box.
