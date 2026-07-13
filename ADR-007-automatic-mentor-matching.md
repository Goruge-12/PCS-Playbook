# ADR-007: Automatic First-Available-Mentor Matching

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

When a Marine (mentee) requests a mentor for an installation, the system needs to decide *who* handles that request — a mentee shouldn't have to browse and hand-pick from a list of mentors, and requests shouldn't pile up unassigned if a mentor is available.

## Decision

`mentorRequestController.createRequest` performs a synchronous, best-effort auto-match at request time: it queries for **one** available mentor at the target installation (`mentor_profiles` joined to `users` where `is_available = TRUE` and `role = 'mentor'`, `LIMIT 1`), and if found, assigns that mentor immediately (`status = 'assigned'`). If no mentor is available, the request is stored as `status = 'pending'` for later manual assignment (surfaced to mentors via `getMentorQueue`, which shows requests for the mentor's own installation).

## Consequences

### Positive

- Mentees get an immediate assignment in the common case (an available mentor exists), with no extra step or waiting for admin/mentor action.
- The matching query is simple and fast (a single indexed-ish `LIMIT 1` lookup) rather than a scoring/ranking algorithm — appropriate given there's typically at most a handful of mentors per installation.
- Unassigned requests degrade gracefully into a per-installation pending queue rather than being lost.

### Negative / Trade-offs

- `LIMIT 1` with no `ORDER BY` means the "first available mentor" is whatever MySQL returns first for that predicate — effectively arbitrary/undefined ordering, not fairness-based (e.g., round-robin or least-recently-assigned) or preference-based.
- No load balancing: a single available mentor at a busy installation will be assigned every new request until they mark themselves unavailable, with no cap on concurrent assignments.
- The match is a point-in-time decision made once at creation — if the assigned mentor goes unavailable afterward, the request stays assigned to them rather than being re-queued.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Manual admin/mentor assignment only | Adds latency and manual overhead for every request; rejected in favor of auto-assignment in the common case |
| Round-robin / least-busy mentor selection | More fair but requires tracking assignment counts or last-assigned timestamps — added complexity not justified at current mentor volumes |
| Mentee picks from a list of available mentors | Gives mentees agency but adds UI complexity and exposes mentor identities before any match is confirmed |
