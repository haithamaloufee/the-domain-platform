# Revival release

Release from the reviewed GitHub commit after CI and the production smoke checks pass.

## Website

Use a Vercel project rooted at `apps/website`, enable source files outside the root for workspace packages, and select Node 26. Ensure the build installs the root lockfile with `pnpm@11.12.0` and `--frozen-lockfile`. Build with the Next.js preset. Configure `THE_DOMAIN_API_BASE_URL` on the server and `NEXT_PUBLIC_WEBSITE_URL` for the production canonical origin. Use the final origin only for Production and prevent indexing of previews.

## API and administration

The API and admin Dockerfiles use the repository root as the build context. Provision the API, admin application, and private PostgreSQL in the same region when possible. Put both HTTP services behind HTTPS. Configure the admin with the server-only API URL. Before deploying, set the production database, JWT, CORS and Cloudinary settings in the host secret store. Run the committed migrations using a separate release job. Probe `/health/live` for process liveness and `/health` for readiness.

The media route streams uploads through the admin service. Verify the provider ingress size and timeout with a disposable image and a video larger than Vercel's function-body limit. Keep the bootstrap administrator secret only for the first controlled start. Configure a retention policy for enquiries before activating the public form.

Before applying `20260718061336_RemoveStaticPublicCopyOwnership` to an existing database, export the affected records, compare them against `docs/content/sprint-05d-static-copy.before.json`, and rehearse backup restoration on a separate instance. Preserve any differences for the owner before the release. The contact inbox and event promotion migrations add new storage.

## DNS and portfolio

Public resolvers returned NXDOMAIN for `hetam.website` and `thedomain.hetam.website` on 13 November 2026. The registry RDAP endpoint returned 404 for the apex. Verify registration and delegation inside the owner's registrar account before adding a subdomain record. After Vercel identifies the required CNAME and any ownership TXT record, add those records with the authoritative DNS provider. Verify HTTPS and the expected deployed commit. Review the existing portfolio entry in `haithamaloufee/profolio` after production validation and update it with the verified live URL and authorized screenshots.

## Verified local content

Use the documented archive import after reviewing [the factual sources](../content/verified-launch-content.md). No production data was changed during local rehearsal. Leave the global promotion flag disabled until staff confirms the terms and ticketing partner arrangement for an event.
