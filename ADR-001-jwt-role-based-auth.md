# ADR-001: JWT-Based Authentication with Role-Based Access Control

**Status:** Accepted
**Date:** 2026-07-07

---

## Context

PCS Playbook requires three distinct user roles — **mentee** (Marines completing a PCS move), **mentor** (Marines already stationed at the gaining installation), and **admin** (staff managing the platform). Each role needs access to a different set of pages and API endpoints.

The application is a decoupled architecture: a React single-page application on the frontend communicates with a Node.js/Express REST API on the backend. There is no server-rendered HTML and no traditional session cookie infrastructure. We needed an authentication mechanism that:

- Works cleanly across a separate frontend origin (`localhost:5173`) and backend origin (`localhost:5000`)
- Carries the user's role so the frontend can control navigation and the backend can enforce access without an extra database lookup on every request
- Can be implemented without a session store or additional infrastructure

---

## Decision

We use **JSON Web Tokens (JWT)** signed with HS256 (`jsonwebtoken` library) for authentication.

On login, the backend signs a token containing `{ user_id, email, role }` with a server-side secret (`JWT_SECRET`) and a 1-day expiry. The full user object is also returned and stored separately in `localStorage`.

```
Token payload: { user_id, email, role, iat, exp }
Storage:       localStorage (both token and user object)
Expiry:        24 hours
Algorithm:     HS256
```

The frontend attaches the token to every API request via an Axios request interceptor (`Authorization: Bearer <token>`). The backend verifies the token in an `auth` middleware and exposes `req.user` to all downstream route handlers. A second `adminOnly` middleware checks `req.user.role === 'admin'` to gate admin-only endpoints.

On the frontend, a `<ProtectedRoute>` component reads the token and user object from `localStorage` to redirect unauthenticated or unauthorized users before the page renders.

---

## Consequences

### Positive

- **Stateless:** The backend does not need a session store. Any server instance can verify any token using the shared secret, which simplifies deployment.
- **Role available everywhere:** Embedding the role in the token means the backend never needs an extra `SELECT` on protected routes, and the frontend can drive navigation (e.g., showing the mentor dashboard link only for mentors) without an additional API call.
- **Simple to implement:** The `auth` + `adminOnly` middleware pattern is straightforward to apply per-route, and the Axios interceptor means no route-specific auth plumbing is needed on the frontend.
- **CORS-friendly:** Bearer tokens work cleanly across origins without the `SameSite`/`Secure` cookie restrictions that complicate cross-origin session cookies.

### Negative / Trade-offs

- **No server-side token revocation:** Because tokens are stateless, a logged-out or de-activated user's token remains valid until it expires (up to 24 hours). Implementing a token blocklist would require a shared store (e.g., Redis) and was out of scope for this project.
- **localStorage XSS risk:** Tokens stored in `localStorage` are accessible to any JavaScript running on the page. A cross-site scripting (XSS) vulnerability could expose the token. `HttpOnly` cookies would mitigate this but require same-origin or carefully configured cross-origin cookie settings.
- **Role is not re-validated on each request:** If an admin changes a user's role, the user's existing token still carries the old role until it expires or they log in again. The frontend `user` object in `localStorage` is also not automatically refreshed.
- **Secret management:** The HS256 secret must be kept out of source control and rotated if compromised. It is loaded via `process.env.JWT_SECRET` from a `.env` file (excluded from the repository via `.gitignore`).

---

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Server-side sessions + cookies | Requires a session store; cookie configuration across separate origins adds complexity out of scope for the project timeline |
| OAuth / third-party auth (Auth0, Clerk) | External dependency; adds cost and requires accounts; overkill for a capstone project with a controlled user base |
| API keys per user | Not suited to browser-based flows; no standard mechanism for role-scoped access |
