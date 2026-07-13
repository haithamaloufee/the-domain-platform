# The Domain Platform — Codex Agent Instructions

You are working on The Domain Platform, a premium entertainment and events management website for The Domain Entertainment Company in Jordan.

This is a production-grade software project. Do not generate quick demo code, placeholder-heavy code, generic AI-looking UI, or unmaintainable structure.

Before writing code, always read:

- THE_DOMAIN_DEVELOPER_BIBLE.md
- docs/design/design-notes.md if available
- docs/design/screenshots/*
- docs/design/stitch-export/* if needed

## Core Rules

1. Follow the Developer Bible strictly.
2. Build this project as if it is maintained by a professional software house.
3. Prefer clean architecture, modular features, reusable components, strong typing, accessibility, performance, and security.
4. Do not create generic SaaS-looking components.
5. Do not hardcode design values randomly.
6. Do not duplicate components.
7. Do not put media files inside app code.
8. Do not implement ticket booking internally in V1.
9. Booking buttons must redirect to external ticketing URLs.
10. Admin routes must never appear in the public website navigation.

## Architecture Direction

Use a monorepo structure:

- apps/website: public Next.js website
- apps/admin: Next.js admin dashboard
- apps/backend: ASP.NET Core Web API
- packages/ui: shared UI components
- packages/types: shared TypeScript types
- packages/config: shared config
- docs: documentation
- docker: Docker, Nginx, PostgreSQL config

## Frontend Standards

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui when useful
- Framer Motion only where it improves UX
- Mobile-first design
- Accessible semantic HTML
- Reusable components
- Feature-based structure

Avoid:

- inline styles
- duplicated components
- template-looking layouts
- generic AI buttons/cards
- excessive animations
- loading all media at once

## Backend Standards

Use:

- ASP.NET Core Web API
- Clean Architecture
- PostgreSQL
- Entity Framework Core
- JWT authentication
- Role-based authorization
- FluentValidation
- Serilog
- Swagger/OpenAPI
- Secure file upload validation
- Cloudinary integration for media

## Design Direction

The visual identity is:

- Premium
- Cinematic
- Dark
- Modern
- Entertainment-focused
- Mobile-first
- Elegant, not childish
- Inspired by premium event websites, but original

Use near-black backgrounds, refined gold accents, large editorial typography, cinematic media presentation, and strong spacing.

## Media Requirements

The project will handle around 500 short videos, mostly vertical Instagram story/reel format.

Rules:

- Store only metadata and URLs in the database.
- Store actual media in Cloudinary or object storage.
- Use lazy loading.
- Use pagination/infinite loading for galleries.
- Never load all videos on page load.
- Use poster images for videos.
- Optimize for mobile first.

## Event Requirements

Events have statuses:

- Upcoming
- Live
- Finished
- Cancelled

Upcoming events show:

- Countdown timer
- Book Now button

Finished events show:

- Finished state
- No active booking CTA unless explicitly configured

Discount campaign widget must be modular and removable. It can be enabled or disabled per event from the admin dashboard.

## Admin Requirements

The admin dashboard must be simple enough for a non-technical media employee.

Required modules:

- Login
- Dashboard overview
- Events management
- Media library
- Gallery manager
- Homepage manager
- Partners manager
- Statistics manager
- Discount campaign controls
- Contact messages
- Users and roles
- Settings

## Workflow Rules

Before implementing any major feature:

1. Explain the plan briefly.
2. List files that will be created or changed.
3. Implement in small safe steps.
4. Run available checks.
5. Summarize what changed.
6. Mention anything left incomplete.

Never rewrite the whole project unless explicitly asked.
Never remove existing work without explaining why.