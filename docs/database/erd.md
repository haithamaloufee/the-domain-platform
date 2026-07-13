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
