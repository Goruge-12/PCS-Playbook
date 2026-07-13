# ADR-003: Normalized MySQL Schema with Direct Parameterized SQL (No ORM)

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

The domain has clear relational entities — users, installations, mentors, mentorship requests, messages — with real foreign-key relationships (a mentor request belongs to a mentee, a mentor, and an installation). The team needed a data layer that a wide range of contributors (including students on a capstone timeline) could read and reason about directly, and that mapped cleanly onto phpMyAdmin, the target DB management tool per `README.md`.

## Decision

The schema (`backend/sql/schema.sql`) is a normalized MySQL relational design: `users`, `installations`, `mentors`/`mentor_profiles`, `mentorship_requests`/`mentor_requests`, `mentor_request_messages`, and `installation_updates`, connected with explicit `FOREIGN KEY ... ON DELETE CASCADE` constraints so related rows (e.g., a user's mentor requests) are cleaned up automatically when a parent row is deleted.

Data access goes straight through `mysql2/promise` with parameterized queries (`pool.query(sql, params)`) written inline in each controller — there is no ORM (Sequelize/Prisma/TypeORM) and no repository/DAO abstraction layer. All query parameters are passed positionally (`?` placeholders), never string-concatenated, which prevents SQL injection.

## Consequences

### Positive

- Zero ORM learning curve or version-upgrade risk; SQL is visible and debuggable exactly as it runs against MySQL/phpMyAdmin.
- Parameterized queries throughout give injection safety without needing an ORM to enforce it.
- `ON DELETE CASCADE` keeps referential integrity enforcement in the database itself rather than requiring application-level cleanup code.

### Negative / Trade-offs

- No schema migrations tool — `schema.sql` is applied by hand, and the file has visibly drifted from the running schema in places (e.g., `mentors`/`mentorship_requests` in `schema.sql` vs. `mentor_profiles`/`mentor_requests` referenced in `mentorRequestController.js`), making the SQL file an unreliable source of truth.
- Query logic (joins, column lists) is duplicated across controllers by hand, so schema changes require manually updating every affected `pool.query` call instead of a single model definition.
- No compile-time or query-build-time type checking of SQL — a typo in a column name is only caught at runtime.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Sequelize / Prisma ORM | Adds a model layer, migrations, and generated types, but was more setup/learning overhead than the project timeline supported |
| NoSQL (MongoDB) | Domain is inherently relational (users ↔ mentors ↔ installations ↔ requests); a document store would need application-enforced referential integrity |
| Query builder (Knex) | A middle ground considered unnecessary given raw `mysql2` parameterized queries already provide injection safety |
