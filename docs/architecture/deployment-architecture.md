# Deployment architecture

## Local development topology

Local development uses one PostgreSQL 16 container exposed on `localhost:5432`. The ASP.NET Core API runs directly on the host at `localhost:5000`, with the public website at port 3000 and admin at port 3001. Only PostgreSQL is containerized in Sprint 6A.

The Compose definition uses a named volume for persistence and a PostgreSQL readiness health check. Environment values are supplied explicitly from an ignored local file. The API applies no migrations automatically; developers run the approved EF command before startup.

Committed application defaults keep database access, authentication, initial-admin provisioning, and Cloudinary disabled. Local environment overrides enable the first three; Cloudinary remains disabled. Production must use a managed secret provider, unique credentials, TLS, restricted networking, backups, observability, and a reviewed migration/rollback process. The local Compose topology is not a production deployment design.
