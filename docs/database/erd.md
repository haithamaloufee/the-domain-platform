# Entity relationship model

```text
application_users 1 ─────── * refresh_tokens
```

`application_users` stores internal staff identity, normalized unique email, framework password hash, role, active state, and UTC audit timestamps. `refresh_tokens` stores only SHA-256 token hashes, expiry/revocation/rotation metadata, client context, and a cascading user foreign key.

The approved roles are Editor, MediaManager, Admin, and SuperAdmin. No public customer identity or business entity is part of this schema.

```text
events 1 ───── * event_media * ───── 1 media_assets
```

Events store lifecycle, UTC scheduling, location, external booking configuration, and homepage flags. Media assets store URLs and metadata only. The association stores usage, ordering, and featured state and prevents duplicate event/asset/usage assignments.

```text
homepage_content (singleton)
homepage_statistics
partners
```

`homepage_content` stores editable section copy, CTA configuration, publication state, and UTC audit timestamps. Its application-owned primary key is constrained to the singleton identifier; no default content is seeded.

`homepage_statistics` exposes four permanent numbered slots. The Sprint 5D migration normalizes the first four legacy rows, creates any missing slots, separates numeric values from suffixes, and enforces unique slot numbers in the range 1-4. Public and admin projections use fixed slot order; the API allows edits but not create, hide, delete, or reorder operations. `partners` stores names, unique slugs, canonical Media Library logo references, external website metadata, visibility/featured flags, ordering, and UTC audit timestamps. Public logo projection rechecks current media approval and archive state in one batched query. No image binaries are stored in either table.
