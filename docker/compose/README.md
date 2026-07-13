# Local Docker Compose

`docker-compose.local.yml` runs PostgreSQL only. From the repository root:

```powershell
Copy-Item .env.example .env.local
docker compose --env-file .env.local -f docker/compose/docker-compose.local.yml up -d
docker compose --env-file .env.local -f docker/compose/docker-compose.local.yml ps
```

Replace the example PostgreSQL password in `.env.local` before sharing a development machine. The documented fallback is for an isolated local workstation only. Data is retained in the named `the_domain_postgres_data` volume. `docker compose down` stops services without deleting that volume; do not add `--volumes` unless database deletion is explicitly intended.
