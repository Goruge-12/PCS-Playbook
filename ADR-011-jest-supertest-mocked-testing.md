# ADR-011: Jest + Supertest with Mocked Dependencies for Backend Tests

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

The backend needed automated tests for controller/route behavior (validation, status codes, auth enforcement) without requiring a live MySQL instance or real outbound email/network calls in CI or on a contributor's machine.

## Decision

Backend tests (`backend/__tests__/*.test.js`) use **Jest** as the runner/assertion library and **Supertest** to drive the real Express `app` (`require('../app')`) over HTTP without binding a port. External dependencies are mocked at the module level with `jest.mock(...)`:

- `../config/db` is mocked to a bare `{ query: jest.fn() }`, so tests control exact DB responses per-call via `mockResolvedValueOnce`/`mockRejectedValueOnce` instead of touching real MySQL.
- `../utils/emailService` is mocked so no real SMTP calls happen during tests.
- `bcryptjs` is mocked in some suites (e.g. `auth.test.js`) to control hash/compare outcomes deterministically and avoid real (slow) hashing in every test run.

`jest.setup.js` seeds required environment variables (`JWT_SECRET`, `AWS_BUCKET_NAME`, `AWS_REGION`) so `auth`-protected routes and S3-touching code can execute in tests without a real `.env`. `package.json` runs Jest with `--forceExit` to avoid hanging on any dangling handles (e.g., the DB pool) that aren't explicitly closed between test files.

## Consequences

### Positive

- Tests run fast and deterministically with no external services (MySQL, SMTP, AWS) required, so they work identically in CI and locally.
- Testing through Supertest against the real `app` exercises the actual Express middleware chain (CORS, JSON parsing, `auth`/`adminOnly`, route wiring) rather than just calling controller functions directly, catching integration-level regressions (e.g., a route forgetting the `auth` middleware).
- Per-call mock sequencing (`mockResolvedValueOnce` chains) makes each test's exact DB interaction explicit and easy to audit.

### Negative / Trade-offs

- Mocking the DB pool entirely means tests never validate the actual SQL strings/joins against a real schema — a query referencing a non-existent column or table (see the `schema.sql` drift noted in [[ADR-003-relational-schema-raw-sql-no-orm]]) would still pass these tests.
- `--forceExit` papers over any unclosed handles (like the `mysql2` pool) rather than requiring clean teardown, which can hide real resource-leak bugs.
- Because mocks return exactly what the test author specifies, tests can drift from real backend/DB behavior over time without failing — they verify controller logic in isolation, not full-stack correctness.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Integration tests against a real (test) MySQL database | More realistic, but adds infrastructure/setup overhead (test DB provisioning, seeding, cleanup) beyond the project's scope and timeline |
| No automated backend tests | Rejected — the team wanted regression coverage on auth, validation, and status-code behavior across controllers |
| End-to-end tests (Cypress/Playwright) driving the real stack | Valuable for full-stack confidence, but not present; would be a natural complement to, not replacement for, these unit/integration tests |
