# Revival release

Release from the reviewed GitHub commit after CI and the production smoke checks pass.

## Website

Use the dedicated `the-domain-entertainment` Vercel project rooted at `apps/website`, with shared workspace source available to the build and Node 26 selected. Install the root lockfile with `pnpm@11.12.0` and `--frozen-lockfile`. Build with the Next.js preset. Configure `THE_DOMAIN_API_BASE_URL` separately in Preview and Production. Set `NEXT_PUBLIC_WEBSITE_URL` to `https://thedomain.haitham.website` in Production. Keep preview deployments protected and excluded from indexing. Use a Vercel team eligible for commercial production hosting.

## API and administration

The API and admin Dockerfiles use the repository root as the build context. Provision the API, admin application, and private PostgreSQL in the same region when possible. Put both HTTP services behind HTTPS. Configure the admin with the server-only API URL. Before deploying, set the production database, JWT, CORS and Cloudinary settings in the host secret store. Run the committed migrations using a separate release job. Probe `/health/live` for process liveness and `/health` for readiness.

For a new deployment, use [Render Docker web services](https://render.com/docs/docker) for the API and admin, with managed PostgreSQL on the same [Frankfurt private network](https://render.com/docs/regions). Use the provider's internal database connection and restrict public database access. Verify the team's service and database plans before provisioning.

For a disposable preview, Render's [free services](https://render.com/docs/free) can host the API, admin and an isolated test database. Build both services from the repository root using `docker/api/Dockerfile` and `docker/admin/Dockerfile`. Keep test data disposable because free PostgreSQL expires after 30 days and has no backups. Free web services cannot run one-off jobs. Use a controlled migration client with temporary allowlisted database access for preview setup, and remove that access after migrating. Use a separate Cloudinary test configuration and a preview-only administrator.

The media route streams uploads through the admin service. Verify the provider ingress size and timeout with a disposable image and a video larger than Vercel's function-body limit. Keep the bootstrap administrator secret only for the first controlled start. Configure a retention policy for enquiries before activating the public form.

Before applying `20260718061336_RemoveStaticPublicCopyOwnership` to an existing database, export the affected records, compare them against `docs/content/sprint-05d-static-copy.before.json`, and rehearse backup restoration on a separate instance. Preserve any differences for the owner before the release. The contact inbox and event promotion migrations add new storage.

## DNS and portfolio

The portfolio runs at `https://haitham.website` and `https://www.haitham.website` on the separate `profolio` Vercel project. GoDaddy is authoritative through `ns57.domaincontrol.com` and `ns58.domaincontrol.com`. Vercel verified ownership of `thedomain.haitham.website` on the `the-domain-entertainment` project and requested one record, `thedomain CNAME 92a9c7c25733623d.vercel-dns-017.com.`. Verify the current recommendation before applying it in GoDaddy. Limit DNS changes to that record and verify HTTPS and the expected deployed commit. Update the existing portfolio entry in `haithamaloufee/profolio` with the verified live URL and authorized screenshots after production validation.

## Verified local content

Use the documented archive import after reviewing [the factual sources](../content/verified-launch-content.md). No production data was changed during local rehearsal. Leave the global promotion flag disabled until staff confirms the terms and ticketing partner arrangement for an event.

## Release evidence

- .NET 10 Release build and 198 automated tests passed. GitHub Actions also applied the migrations to PostgreSQL 16.
- The `containers` CI jobs build the production API and admin images from the repository root.
- Local PostgreSQL 18 accepted both new migrations and a dump restored successfully into a separate database.
- Browser smoke tests passed at 320, 390, 768, 1024 and 1440 pixels. Local authenticated checks covered dashboard routes, a contact submission appearing in the inbox, and logout. A disposable event confirmed that the external booking link disappears at the booking deadline and that an enabled promotion appears while booking is open.
- A 21-item local gallery fixture confirmed that hidden media stays private, the summary returns the selected cover, approved media loads in pages of 18 and 2, and Escape closes the media viewer.
- A local production build measured homepage LCP at 456 ms at 390 px and 264 ms at 1440 px, with zero measured layout shift on both viewports. The test used Edge on loopback with no network throttling and no hero video configured.
- The tested public routes had no critical axe WCAG violations at 390 and 1440 pixels. Production Lighthouse and live Cloudinary upload checks require the deployed environment and approved media.
