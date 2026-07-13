# ADR-009: Centralized Axios Client with Interceptor-Based Auth Injection

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

Nearly every page in the frontend needs to call the backend API, and almost every call needs the JWT attached (see [[ADR-001-jwt-role-based-auth]]). Repeating base-URL and header logic in every component would be error-prone and hard to change later (e.g., switching API hosts between environments).

## Decision

`frontend/src/services/api.js` exports a single configured Axios instance used by every page/component that talks to the backend:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

A request interceptor reads the JWT from `localStorage` on every outgoing call and attaches it as a `Bearer` header, so individual components never manually manage auth headers. The base URL is environment-configurable via Vite's `VITE_API_URL`, defaulting to `localhost:5000/api` for local development.

## Consequences

### Positive

- Auth-header plumbing is written once; adding a new API call anywhere in the app automatically gets authenticated without extra code.
- Switching backend environments (local, staging, prod) is a single env var change, not a codebase-wide find-and-replace.
- A single Axios instance is a natural place to later add cross-cutting concerns (response interceptors for 401 handling, retry logic, request logging) without touching call sites.

### Negative / Trade-offs

- There is currently no response interceptor handling `401`s globally — an expired/invalid token surfaces as a per-call failure that each page must handle (or ignore) individually, rather than a single centralized "log the user out and redirect" behavior.
- The token is read from `localStorage` synchronously on every request, which ties this pattern directly to the XSS exposure already noted in [[ADR-001-jwt-role-based-auth]].

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Native `fetch` in each component | No shared interceptor mechanism; would require manually attaching auth headers and base URL in every call site |
| React Context/hook wrapping API calls | Reasonable alternative, but the project favored the simpler singleton-module pattern over introducing a context provider |
| Per-feature API clients | Unnecessary fragmentation for an app of this size where every request needs the same base URL and auth header |
