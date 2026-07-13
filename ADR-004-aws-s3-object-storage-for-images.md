# ADR-004: AWS S3 for Image Storage, In-Memory Upload Buffering

**Status:** Accepted
**Date:** 2026-07-13

---

## Context

Installation images and user profile images are user-uploaded binary content. Storing binaries in MySQL rows would bloat the database and complicate backups; storing them on the API server's local disk would break horizontal scaling and be lost on redeploy (many hosts, e.g. Heroku-style PaaS, have ephemeral filesystems).

## Decision

Uploaded images are sent to **AWS S3** and only the resulting HTTPS URL is persisted in MySQL (`image_url` / `profile_image_url` columns).

- `multer` is configured with `memoryStorage()` (`backend/middleware/upload.js`), so uploaded files exist only as an in-memory `Buffer` on `req.file` — never written to local disk.
- `config/s3.js` exposes a shared `uploadToS3(file, folder)` helper (`PutObjectCommand`) used by `installationController.js` when creating/updating installations.
- A separate, more capable path in `controllers/uploadController.js` (mounted at `/api/admin/upload`, gated by `auth` + `adminOnly`) uploads a file and also deletes the previous image (`DeleteObjectCommand`) by deriving its key from the old URL, so replacing an image doesn't leave orphaned S3 objects.
- AWS credentials and bucket/region config are read from environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`), never hardcoded.

## Consequences

### Positive

- Database stays small and fast; images are served directly from S3 (or, in front of it, a CDN later) rather than proxied through the API.
- Memory-buffered uploads avoid local-disk cleanup and work unmodified on stateless/ephemeral-filesystem hosts.
- Old-image deletion on replace (in `uploadController.js`) prevents unbounded storage growth in the admin image-management flow.

### Negative / Trade-offs

- Two separate S3 upload implementations exist (`config/s3.js`'s `uploadToS3` vs. the inline logic in `uploadController.js`) with slightly different key-naming and no shared old-image cleanup in the `installationController.js` path — a maintenance hazard if they drift further.
- S3 objects are addressed by a public-style HTTPS URL pattern (`https://<bucket>.s3.<region>.amazonaws.com/<key>`), implying the bucket/objects must be configured for public read; there's no signed-URL or access-controlled delivery.
- Large in-memory buffers for big files could pressure Node process memory under concurrent uploads, since nothing streams to S3 or enforces a file-size limit at the `multer` layer.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Store images as BLOBs in MySQL | Bloats the database, slows backups/queries, and doesn't scale to many large images |
| Local disk storage on the API server | Breaks on ephemeral/stateless hosting and doesn't survive redeploys or horizontal scaling |
| Third-party media service (Cloudinary, Imgix) | Extra vendor/cost not justified when the team already needed AWS familiarity/credentials |
