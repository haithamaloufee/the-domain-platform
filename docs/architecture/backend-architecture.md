# Backend architecture

The backend is an ASP.NET Core Web API targeting .NET 8 and organized around Clean Architecture boundaries.

## Dependency direction

```text
Api ---------> Application -----> Domain
 |                  |
 |                  +-----------> Shared
 +------------> Infrastructure --> Application, Domain, Shared
 +------------> Shared
```

`Domain` has no project dependencies. `Application` owns future use-case contracts. `Infrastructure` will implement those contracts for persistence and external systems. `Api` is the composition root and owns HTTP-only behavior. `Shared` is restricted to small framework-independent contracts.

## Persistence

`TheDomain.Infrastructure` owns `TheDomainDbContext`, EF Core configuration, the Npgsql provider, design-time context creation, and PostgreSQL health registration. Neither Domain nor Application references EF Core or Infrastructure.

Persistence activation is explicit. When `Database:Enabled` is `true`, startup requires a connection string, registers the context, and adds PostgreSQL to `/health`. When disabled, no context is registered and the API remains available for foundation tests and non-persistence tooling.

Business modules, entities, mappings, migrations, and authentication require separate reviewed sprints.

## Identity and authentication

Domain owns the EF-free `ApplicationUser`, `RefreshToken`, and `UserRole` model. Application owns authentication orchestration and abstractions. Infrastructure owns password hashing, JWT creation, refresh-token hashing, persistence mappings, and initial administrator provisioning. API endpoints validate transport input and delegate to Application.

Bearer access tokens use HMAC SHA-256. Refresh tokens are random 256-bit values whose SHA-256 hashes are persisted and rotated transactionally. Admin authentication is configuration-gated and does not add public-site login.

## Events and media

Domain owns the `EntertainmentEvent` aggregate and media metadata entities without EF dependencies. Application calculates display/booking projections through `TimeProvider`, filters public data, validates commands, and separates public/admin DTOs. Infrastructure owns EF mappings and queries. API exposes anonymous public reads and policy-protected admin writes.

Application defines media storage, query, management, repository, and validation abstractions. Infrastructure implements storage with the official Cloudinary SDK and metadata queries with EF Core. API translates multipart requests and remains unaware of Cloudinary credentials. No binary crosses into PostgreSQL.
