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

The admin frontend exposes same-origin BFF routes with the same `/api/auth/login`, `/refresh`, `/logout`, and `/me` paths on the admin origin. They translate the backend token response into HttpOnly cookies and return only safe session/user fields. BFF errors intentionally hide backend Problem Details, token parsing information, and credential-specific failures.

Public event endpoints are `/api/public/events/upcoming`, `/previous`, `/featured`, `/{slug}`, and `/api/public/gallery/albums[/{eventSlug}]`. They return only Published or Cancelled events and only Approved media metadata.

Admin event endpoints under `/api/admin/events` support list, detail, create, update, publish, archive, and cancel. Every admin event route requires `AdminDashboardAccess`. Booking URLs are external redirects only; no ticketing or payment API exists.

Admin media endpoints under `/api/admin/media` support paginated/filterable lists, detail, upload, metadata updates, approve, hide, and safe delete-by-hide. Event assignment endpoints live under `/api/admin/events/{eventId}/media`. They require `MediaManagerOrAbove`, cap page size at 50, and never expose Cloudinary credentials.
