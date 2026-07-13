# Production readiness and deployment

This guide is provider-neutral. It prepares The Domain Platform for deployment but does not authorize or perform a production release.

## Recommended topology

- Public website: `https://www.example.com`
- Admin dashboard: `https://admin.example.com`
- ASP.NET API: `https://api.example.com`
- PostgreSQL: private network access only
- Media: Cloudinary, with credentials available only to the API

Replace the example origins with approved domains. All three HTTP applications must use HTTPS in production. Do not link the admin origin from the public website.

## Environment ownership

| Setting                                     | Owner                     | Production requirement                                                                                               |
| ------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `WEBSITE_URL`, `ADMIN_URL`, `API_URL`       | Deployment orchestration  | Document the three final HTTPS origins. They are not application secrets.                                            |
| `NEXT_PUBLIC_WEBSITE_URL`                   | Public website            | Final public HTTPS origin used for canonical, Open Graph, sitemap, and robots URLs.                                  |
| `THE_DOMAIN_API_BASE_URL`                   | Website and admin servers | Absolute API URL. It remains server-only and must not use `NEXT_PUBLIC_`.                                            |
| `Database__Enabled`                         | API                       | `true` for the production API.                                                                                       |
| `Database__ConnectionString`                | API secret store          | TLS-enabled PostgreSQL connection string with a dedicated least-privilege account.                                   |
| `Authentication__*`                         | API secret/config store   | Authentication enabled with deployment-specific issuer/audience and a random signing key of at least 32 UTF-8 bytes. |
| `InitialAdmin__*`                           | API secret/config store   | Temporarily enabled only for controlled first-user provisioning, then disabled.                                      |
| `Cloudinary__*`                             | API secret/config store   | Server-only cloud name, key, secret, folder, size, and MIME policy.                                                  |
| `Cors__AllowedOrigins__0..n`                | API                       | Exact website and admin HTTPS origins. Never use a wildcard.                                                         |
| `THE_DOMAIN_REFRESH_COOKIE_MAX_AGE_SECONDS` | Admin server              | Match the backend refresh lifetime; default is 1,209,600 seconds.                                                    |

The root `.env.example` is a local template, not a production secret file. Production values belong in each provider's encrypted secret/configuration system. Never copy `.env.local`, signing keys, database passwords, initial-admin passwords, or Cloudinary credentials into Git, images, build logs, or browser-visible variables.

## Release sequence

1. Provision PostgreSQL in a private network, require encrypted connections, create a dedicated application database/user, and confirm automated backups and point-in-time recovery.
2. Create separate production secrets for the database, JWT signing key, initial admin, and Cloudinary. Do not reuse local values.
3. Build immutable API and frontend artifacts from the reviewed commit.
4. Back up the database before schema changes.
5. Apply only committed EF migrations from a controlled release job:

   ```powershell
   dotnet tool restore
   dotnet ef database update --project apps/backend/src/TheDomain.Infrastructure --startup-project apps/backend/src/TheDomain.Api
   ```

6. Deploy the API with exact CORS origins. Verify `/health` and `/api/info`. Swagger must not be available outside Development.
7. Provision the first SuperAdmin during one controlled API startup only. Confirm login, then set `InitialAdmin__Enabled=false` and remove its plaintext bootstrap password from the runtime environment.
8. Deploy the admin application with its server-only API origin. Confirm secure HttpOnly cookies and dashboard protection over HTTPS.
9. Deploy the public website with its final canonical origin and server-only API origin. Verify `/robots.txt` and `/sitemap.xml` after deployment.
10. Run the smoke checklist below before DNS cutover and again after cutover.

Do not run EF migration generation during deployment. Production applies reviewed migrations; it does not create them.

## API and Cloudinary

The API already validates that production CORS contains at least one explicit origin, JWT signing keys contain at least 32 UTF-8 bytes when authentication is enabled, and Cloudinary credentials exist when media storage is enabled. Production exceptions return Problem Details without stack traces or exception messages. Serilog writes structured console output; the hosting platform should retain it with access controls and secret redaction.

Cloudinary should use a production-specific folder prefix and restricted credentials. Keep original upload limits aligned with the documented image/video policy. The database stores URLs and metadata only. Test transformations, delivery formats, poster generation, and CDN behavior against real approved media before launch.

## Rollback and recovery

- Keep the previous API, admin, and website artifacts available for application rollback.
- Prefer forward-compatible migrations. A frontend/API rollback must remain compatible with the migrated schema.
- Never reverse a destructive migration without a reviewed data-recovery plan and verified backup.
- Record the database backup identifier, deployed commit, migration list, and environment revision for every release.
- Test restore procedures before launch; an untested backup is not a recovery plan.

## Launch smoke test

Use disposable test data and remove or hide it after verification.

See `launch-checklist.md` for the latest recorded local evidence and unresolved launch gates.

- [ ] `GET https://api.example.com/health` returns a healthy result, including PostgreSQL when enabled.
- [ ] `GET https://api.example.com/api/info` reports the expected application/environment/version.
- [ ] Swagger UI is unavailable in Production.
- [ ] Public `/`, `/events`, `/gallery`, `/about`, `/services`, and `/contact` load over HTTPS.
- [ ] A known published event detail and approved gallery album load; draft/archived/hidden content does not.
- [ ] External booking appears only for an Open booking with an approved absolute URL.
- [ ] `/sitemap.xml` contains static routes and current discoverable public event/album routes.
- [ ] `/robots.txt` references the production sitemap and does not expose admin/API routes.
- [ ] An unknown public URL renders the branded 404 and is not indexable.
- [ ] Admin login rejects invalid credentials generically and accepts the approved administrator.
- [ ] Unauthenticated `/dashboard` access redirects to login; no tokens appear in browser storage or responses.
- [ ] Create, edit, publish, and archive a disposable event through admin and verify its public visibility rules.
- [ ] Upload a disposable allowed media file, approve it, assign/order it, verify public rendering, then hide it.
- [ ] Save homepage content as Draft, verify fallback remains, publish it, and verify the public page after revalidation.
- [ ] Verify statistics require Visible + Verified and partners require Visible before public rendering.
- [ ] Confirm production cookies are Secure, HttpOnly, SameSite=Lax, and scoped to the admin host.
- [ ] Run desktop/mobile Lighthouse and manual 360px, 390px, tablet, keyboard, and assistive-technology checks with production content.
- [ ] Confirm monitoring, backup alerts, log retention, rollback ownership, and incident contacts.

## Build verification

From the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm format:check
pnpm typecheck
pnpm lint
pnpm build
dotnet restore apps/backend/TheDomain.Backend.sln
dotnet build apps/backend/TheDomain.Backend.sln -c Release
dotnet test apps/backend/TheDomain.Backend.sln -c Release
git diff --check
```

Launch remains blocked until approved domains, production content, an official icon/manifest decision, real-device QA, monitoring, backup restore testing, and security review are complete.
