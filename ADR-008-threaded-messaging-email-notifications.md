# ADR-008: Threaded In-App Messages with Email Notifications (No Real-Time Channel)

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

Once a mentee and mentor are connected on a request, they need to exchange follow-up messages (housing questions, unit details, etc.). The app needed a conversation mechanism without taking on the operational complexity of a real-time chat system.

## Decision

Conversations are modeled as a simple **append-only message log** per request: `mentor_request_messages` rows (`request_id`, `sender_user_id`, `sender_role`, `message`, `created_at`), read via polling (`getMessages`, ordered by `created_at ASC`) and written via `createMessage`. There is no WebSocket/SSE channel — the frontend must re-fetch to see new messages.

To compensate for the lack of real-time delivery, every message send triggers an **email notification** to the other party (`utils/emailService.sendEmail`) via Nodemailer, telling them to log in and check the conversation. Email failures are caught and logged but do not fail the request (`try { await sendEmail(...) } catch (emailError) { console.log(...) }` in both `createRequest` and `createMessage`), so a broken mailer never blocks the core message/request flow.

## Consequences

### Positive

- Much simpler infrastructure than real-time chat: no WebSocket server, no connection/presence management, no additional deployment surface.
- Email as the "you have a new message" signal fits the app's overall low-frequency, asynchronous mentorship use case (this isn't a live chat product).
- Best-effort email (caught, non-blocking) means the core request/messaging flow keeps working even if SMTP credentials are misconfigured or Gmail throttles sending.

### Negative / Trade-offs

- No push/real-time update means users must manually refresh or re-navigate to see new messages — a noticeably weaker UX than a live chat.
- Every single message triggers an outbound email, which at scale could hit Gmail SMTP sending limits or read as spammy to recipients with an active conversation.
- Because email failures are silently logged and swallowed, there's no user-facing signal if notification delivery is broken — a misconfigured `EMAIL_USER`/`EMAIL_PASS` degrades notification delivery invisibly.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| WebSockets / Socket.IO real-time chat | Real-time UX, but adds a persistent-connection server component disproportionate to the app's message volume |
| Polling from the frontend on an interval | Would give near-real-time updates without a new protocol, but wasn't implemented — messages are only fetched on page load/navigation |
| No notifications, in-app only | Simpler, but risks requests/messages going unnoticed for days since users don't have a reason to return to the app |
