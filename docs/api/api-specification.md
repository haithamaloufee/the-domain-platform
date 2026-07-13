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

Public event endpoints are `/api/public/events/upcoming`, `/previous`, `/featured`, `/{slug}`, and `/api/public/gallery/albums[/{eventSlug}]`. They return only Published or Cancelled events and only Approved media metadata.

Admin event endpoints under `/api/admin/events` support list, detail, create, update, publish, archive, and cancel. Every admin event route requires `AdminDashboardAccess`. Booking URLs are external redirects only; no ticketing or payment API exists.

Admin event responses include publication status plus backend-computed display status and booking availability. The admin frontend mirrors these endpoints through same-origin `/api/admin/events/*` BFF handlers. Those handlers authenticate from HttpOnly cookies, refresh an expired access token at most once, and translate backend failures into safe `{ message }` responses rather than forwarding raw Problem Details.

Admin media endpoints under `/api/admin/media` support paginated/filterable lists, detail, single-file multipart upload, metadata updates, approve, hide, and safe delete-by-hide. List filters are `search`, `type`, `status`, `orientation`, `category`, `eventId`, `pageNumber`, and `pageSize`. Event assignment endpoints live under `/api/admin/events/{eventId}/media` and support create, update, and removal without deleting the reusable asset. They require `MediaManagerOrAbove`, cap page size at 50, and never expose Cloudinary credentials.

The admin frontend mirrors these endpoints with same-origin BFF routes. Media routes authenticate from HttpOnly cookies, perform at most one token refresh, allowlist query and multipart fields, validate mutation bodies, and reduce backend errors to safe `{ message }` responses. Browser code never calls Cloudinary or the ASP.NET origin directly.
