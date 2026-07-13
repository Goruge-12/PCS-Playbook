# ADR-006: Email-Delivered Temporary Password for Account Recovery

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

Users who forget their password need a self-service way to regain access without admin intervention. The two common patterns are (a) email a time-limited reset *link* containing a signed token, or (b) generate and email a new credential directly.

## Decision

`authController.forgotPassword` implements option (b): it generates a random 8-character hex string (`crypto.randomBytes(4).toString('hex')`), hashes it with bcrypt, overwrites the user's `password` column, sets `must_change_password = 1`, and emails the plaintext temporary password via `utils/emailService.js` (Nodemailer over Gmail SMTP). The user logs in with the temporary password, and the `must_change_password` flag (returned in the login response and checked client-side) is expected to force a password change via `changePassword`/`ChangePassword.jsx` before normal use continues.

## Consequences

### Positive

- Simple to implement and reason about: no reset-token table, no expiry-tracking logic, no separate "reset password" page/route to secure.
- `must_change_password` guarantees the temporary credential is short-lived in practice, since the user is expected to be forced to rotate it immediately after use.

### Negative / Trade-offs

- The temporary password is emailed in **plaintext** over SMTP; if the mailbox or transit is compromised, the account is directly compromised with a live, immediately-usable credential (not just a link with its own scoped expiry).
- The generated password (`crypto.randomBytes(4).toString('hex')` → 8 hex characters, i.e. 32 bits of entropy) is invalidated only by the user logging in and changing it — there's no time-based expiry, so an intercepted email grants access indefinitely until used.
- `forgotPassword` immediately overwrites the real password on request, so anyone who can trigger the endpoint for a victim's email (no rate limiting visible in `authRoutes.js`) locks the legitimate user out until they check email — a denial-of-service vector against individual accounts.
- Gmail SMTP (`smtp.gmail.com`) as the transport ties deliverability to a personal/workspace Gmail account's sending limits and reputation rather than a dedicated transactional email provider.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Signed, expiring reset token + reset-password link | More standard and safer (scoped, time-limited, doesn't hand over a live password), but requires a token table or signed-URL scheme not implemented here |
| Security questions | Weak and largely deprecated as a recovery mechanism; not considered |
| Admin-mediated reset only | Too much manual overhead for a self-service capstone app with a small admin team |
