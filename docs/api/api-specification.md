# API specification

The backend exposes an OpenAPI document and Swagger UI in the Development environment only.

Current foundation endpoints:

- `GET /health` returns process health.
- `GET /api/info` returns the application name, environment, version, and UTC timestamp.
- `POST /api/auth/login` authenticates internal staff and returns access/refresh tokens.
- `POST /api/auth/refresh` rotates a valid refresh token and returns a new token pair.
- `POST /api/auth/logout` revokes a valid refresh token.
- `GET /api/auth/me` requires bearer authentication and returns safe current-user fields.

Unexpected errors use `application/problem+json` Problem Details responses. Production responses omit exception details and stack traces. Business and administrative contracts are intentionally deferred.

There is no public registration endpoint. Password hashes and persisted refresh-token records are never serialized. Invalid login responses are intentionally generic. Login rate limiting is scheduled for the security-hardening sprint.

The admin frontend exposes same-origin BFF routes with the same `/api/auth/login`, `/refresh`, `/logout`, and `/me` paths on the admin origin. They translate the backend token response into HttpOnly cookies and return only safe session/user fields. Protected dashboard navigation also validates identity server-side and performs at most one refresh-token rotation. BFF errors intentionally hide backend Problem Details, token parsing information, and credential-specific failures.

Public event endpoints are `/api/public/events/upcoming`, `/previous`, `/featured`, `/{slug}`, and `/api/public/gallery/albums[/{eventSlug}]`. They return only Published or Cancelled events and only Approved media metadata. Event lists return summary fields plus a single nullable cover projection; event detail returns long description, location/map fields, and the approved ordered media collection. The external booking URL is emitted only when backend-computed booking availability is Open.

Gallery album lists return event identity, date/location metadata, photo/video counts, and one cover item. Album detail returns the full approved `Gallery` usage collection in persisted sort order. Events with no approved gallery item are omitted from the album list. Public lists are capped at 50 items; media binaries remain on external storage and are never returned by the API.

Admin event endpoints under `/api/admin/events` support list, detail, create, update, publish, archive, and cancel. Every admin event route requires `AdminDashboardAccess`. Booking URLs are external redirects only; no ticketing or payment API exists.

Admin event responses include publication status plus backend-computed display status and booking availability. The admin frontend mirrors these endpoints through same-origin `/api/admin/events/*` BFF handlers. Those handlers authenticate from HttpOnly cookies, refresh an expired access token at most once, and translate backend failures into safe `{ message }` responses rather than forwarding raw Problem Details.

Admin media endpoints under `/api/admin/media` support paginated/filterable lists, detail, single-file multipart upload, metadata updates, approve, hide, and safe delete-by-hide. List filters are `search`, `mediaType`, `approvalStatus`, `orientation`, `category`, `eventId`, `usage`, `pageNumber`, and `pageSize`. Event assignment endpoints live under `/api/admin/events/{eventId}/media` and support list, create, update, and removal without deleting the reusable asset. They require `MediaManagerOrAbove`, cap global media page size at 50, and never expose Cloudinary credentials.

`GET /api/admin/events/{eventId}/media` returns every assignment for the event ordered by usage, sort order, and creation date. Each row includes the real assignment ID, event and media IDs, usage, sort order, featured state, creation date, and a nested `AdminMediaResponse` with safe asset metadata. Ordering writes continue to use the existing per-assignment PUT route; no separate reorder endpoint exists.

The admin frontend mirrors these endpoints with same-origin BFF routes. Media routes authenticate from HttpOnly cookies, perform at most one token refresh, allowlist query and multipart fields, validate mutation bodies, and reduce backend errors to safe `{ message }` responses. Browser code never calls Cloudinary or the ASP.NET origin directly.

Homepage CMS public endpoints are:

- `GET /api/public/homepage` returns nullable published homepage content, visible verified statistics, and visible partners.
- `GET /api/public/statistics` returns the same ordered safe statistic projection.
- `GET /api/public/partners` returns the same ordered safe partner projection.

Empty arrays and `content: null` are valid before administrators publish verified records. Public DTOs omit IDs, audit timestamps, draft/publish flags, verification flags, visibility flags, sort controls, and storage-provider data.

Homepage CMS admin endpoints require `AdminDashboardAccess`:

- `GET|PUT /api/admin/homepage`
- `GET|POST /api/admin/statistics`
- `PUT|DELETE /api/admin/statistics/{id}`
- `POST /api/admin/statistics/{id}/show|hide`
- `GET|POST /api/admin/partners`
- `PUT|DELETE /api/admin/partners/{id}`
- `POST /api/admin/partners/{id}/show|hide`

Homepage PUT creates or updates the singleton record. Statistic verification remains an explicit admin-controlled field; visibility alone does not make an unverified value public. Partner slugs are unique. DELETE for statistics and partners performs the same reversible hide operation as the hide endpoint.

The admin frontend mirrors these CMS endpoints on the admin origin with the same route shapes. BFF handlers authenticate from HttpOnly cookies, rotate an expired access token at most once, enforce same-origin mutations, runtime-validate the shared CMS contracts, and reduce backend failures to safe `{ message }` responses. They never return tokens, raw Problem Details, exception data, or backend configuration.
