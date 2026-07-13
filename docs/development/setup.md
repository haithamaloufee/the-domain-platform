# Development setup

## Prerequisites

- .NET SDK 8 or newer
- Docker with Docker Compose
- Node.js 22 or newer
- pnpm 11.12.0

## 1. Install dependencies

From the repository root, run `pnpm install`. From `apps/backend`, run `dotnet tool restore` and `dotnet restore`.

## 2. Configure local values

Copy `.env.example` to the ignored `.env.local` file and replace the JWT signing key, initial-admin password, and local database password. Then update the password inside `Database__ConnectionString` so it matches `POSTGRES_PASSWORD`.

ASP.NET Core does not automatically read dotenv files. In PowerShell, import the file into the current process before running EF or the API:

```powershell
Get-Content .env.local |
  Where-Object { $_ -and -not $_.StartsWith('#') } |
  ForEach-Object {
    $name, $value = $_.Split('=', 2)
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
```

Copy `apps/website/.env.example` and `apps/admin/.env.example` to `.env.local` inside their respective app folders. `NEXT_PUBLIC_` values are visible to browsers and must never contain secrets. The admin file also contains `THE_DOMAIN_API_BASE_URL` and refresh-cookie lifetime configuration; those unprefixed values remain server-only. Keep the cookie lifetime aligned with the backend refresh-token lifetime (14 days by default).

To exercise media uploads locally, set `Cloudinary__Enabled=true` and provide `Cloudinary__CloudName`, `Cloudinary__ApiKey`, and `Cloudinary__ApiSecret` in the backend process environment. Keep these values out of both Next.js applications and never use a `NEXT_PUBLIC_` prefix. The defaults accept JPEG, PNG, and WebP images up to 15 MB and MP4 or WebM videos up to 100 MB.

## 3. Start PostgreSQL

From the repository root:

```powershell
docker compose --env-file .env.local -f docker/compose/docker-compose.local.yml up -d
docker compose --env-file .env.local -f docker/compose/docker-compose.local.yml ps
```

Wait until PostgreSQL reports `healthy`. The named volume preserves local data when the container stops.

## 4. Apply approved migrations

After importing backend variables, run from `apps/backend`:

```powershell
dotnet tool restore
dotnet ef database update --project src/TheDomain.Infrastructure --startup-project src/TheDomain.Api
```

This applies the existing identity, event, and media-metadata migrations. It does not create a new migration or seed business content.

## 5. Start the API

In the same configured PowerShell process, from `apps/backend`:

```powershell
dotnet run --project src/TheDomain.Api
```

Open `http://localhost:5000/swagger`. Verify `http://localhost:5000/health` and `http://localhost:5000/api/info`. The first successful startup provisions the configured SuperAdmin only when the database contains no users. The password is hashed and not logged. Disable `InitialAdmin__Enabled` after provisioning, and never reuse the local password in a real deployment.

## 6. Start the frontend applications

From separate repository-root terminals:

```powershell
pnpm --filter @the-domain/admin dev
pnpm --filter @the-domain/website dev
```

Admin runs at `http://localhost:3001`; the website runs at `http://localhost:3000`. Visit `http://localhost:3001/login` and use the SuperAdmin provisioned during the first configured API startup. After successful login, the admin BFF sets HttpOnly cookies and redirects to `/dashboard`. Neither token is available through JavaScript or browser Web Storage.

For event gallery testing, create or select an event, approve at least one disposable media asset, and open `/dashboard/events/{id}/media`. Assignment listing and ordering work without Cloudinary once metadata exists; uploading additional files still requires the Cloudinary development configuration described above. Removing an event assignment preserves the reusable media asset.

Repository checks are `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `dotnet test apps/backend/TheDomain.Backend.sln`.
