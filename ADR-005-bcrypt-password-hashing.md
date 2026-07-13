# ADR-005: bcrypt Password Hashing at Rest

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

User passwords (`users.password`) must never be recoverable from the database in plaintext, whether from a backup leak, an insider, or a SQL injection bug elsewhere in the app.

## Decision

All passwords — user-chosen at registration, admin-set, and system-generated temporary passwords (see [[ADR-006-temporary-password-email-reset]]) — are hashed with **bcrypt** (`bcryptjs` implementation, 10 salt rounds) before being written to the database, and compared with `bcrypt.compare()` on login. This is applied consistently in `authController.js`, `userController.js`, and `adminController.js`.

Note: the project also lists the native `bcrypt` package in `package.json`, but only `bcryptjs` (the pure-JS implementation) is actually `require`d anywhere in the codebase — `bcrypt` is an unused dependency.

## Consequences

### Positive

- A stolen `users` table does not expose usable plaintext passwords; bcrypt's per-hash salt and adjustable work factor resist rainbow-table and brute-force attacks.
- Using the pure-JS `bcryptjs` (vs. native `bcrypt`) avoids native-module build/compile issues across development machines and deployment targets — a real risk for a capstone project run on varied student laptops.

### Negative / Trade-offs

- Two bcrypt packages are installed but only one is used, adding unnecessary `node_modules` weight and contributor confusion about which to `require` in new code.
- The salt-round count (10) is hardcoded in each controller rather than centralized, so tuning it later means a multi-file find-and-replace.
- `bcryptjs` is slower than native `bcrypt` under high concurrent load, though at the traffic scale of this project that's not a practical concern.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Native `bcrypt` | More CPU-efficient, but adds native compilation as an environment dependency; already installed but unused in favor of the pure-JS variant |
| argon2 | Stronger modern KDF, but adds another native dependency and was unnecessary for the project's threat model |
| Plaintext / reversible encryption | Never viable — any DB compromise would expose all user credentials directly |
